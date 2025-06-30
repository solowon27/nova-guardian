const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Child = require('../models/Child');
const Parent = require('../models/Parent'); // Although not directly used, keeping for consistency if needed elsewhere
const Assignment = require('../models/Assignment');
const { AuthenticationError } = require('apollo-server-express');
const TriviaResult = require('../models/TriviaResult');
const { pushParentNotification } = require('../utils/notify');
const openai = require('../utils/openaiClient'); // Ensure this is set up correctly
const { loadCache, saveCache } = require('../utils/cache'); // Ensure this is set up correctly


const SECRET = process.env.JWT_SECRET;

let { imageUrl, explanation, lastGeneratedAt } = loadCache() || {
  imageUrl: null,
  explanation: null,
  lastGeneratedAt: 0
};

module.exports = {
  Query: {
    getMe: async (_, __, { req }) => {
      const user = req.user;
      if (!user) throw new Error('Not authenticated');
      return await User.findById(user.id).populate('children');
    },

    // Get all children for a parent
    getMyChildren: async (_, __, context) => {
      const parentId = context.req.user?._id;
      if (!parentId) throw new Error("Unauthorized");

      const parent = await User.findById(parentId).populate('children');
      if (!parent) throw new Error("Parent not found");

      return parent.children;
    },

    getChildById: async (_, { id }, { req }) => {
      if (req.user) {
        const child = await Child.findById(id);
        if (!child) throw new Error("Child not found");
        if (child.parent.toString() !== req.user.id) throw new Error("Unauthorized access");
        return child;
      }

      if (req.child) {
        if (req.child._id.toString() !== id) throw new Error("Unauthorized access");
        return req.child;
      }

      throw new Error("Not authenticated");
    },

    getAssignmentsForChild: async (_, { childId }, { req }) => {
      const parent = req.user;
      if (!parent) throw new Error("Unauthorized");

      // 🧠 Safely fetch the child and confirm parent ownership
      const child = await Child.findById(childId).lean();
      if (!child || child.parent.toString() !== parent.id.toString()) {
        throw new Error("Access denied");
      }

      // ✅ Fetch assignments for this child
      const assignments = await Assignment.find({ child: child._id }).lean();

      console.log("📥 Found", assignments.length, "assignments for childId:", childId);

      return assignments.map(a => ({
        id: a._id.toString(),
        title: a.title,
        description: a.description,
        status: a.status,
        difficulty: a.difficulty || 'EASY',
        responses: a.responses || [],
        questions: a.questions || [],
        feedback: a.feedback || '',
        totalCorrect: a.totalCorrect || 0, // Ensure these are included
        score: a.score || 0,             // Ensure these are included
        evaluation: a.evaluation || [],  // Ensure these are included
        createdAt: a.createdAt?.toISOString(),
        completedAt: a.completedAt?.toISOString() || null,
      }));
    },

    getMyAssignments: async (_, __, { req }) => {
      const child = req.child;
      if (!child) throw new Error("Unauthorized");

      const assignments = await Assignment.find({ child: child._id }).lean();

      return assignments.map(a => ({
        ...a,
        id: a._id.toString(),
        title: a.title,
        description: a.description,
        status: a.status,
        difficulty: a.difficulty || 'EASY',
        responses: a.responses || [],
        questions: a.questions || [],
        feedback: a.feedback || '',
        totalCorrect: a.totalCorrect || 0,
        score: a.score || 0,
        evaluation: a.evaluation || [],
        createdAt: a.createdAt?.toISOString(),
        completedAt: a.completedAt?.toISOString() || null,
      }));
    },

    getParentNotifications: async (_, { limit }, { req }) => {
      const user = req.user;
      if (!user) throw new Error("Unauthorized");

      const parent = await User.findById(user.id);
      if (!parent || !parent.notifications) return [];

      return parent.notifications
        .reverse()
        .slice(0, limit || parent.notifications.length)
        .map(n => ({
          message: n.message,
          date: n.date instanceof Date ? n.date.toISOString() : n.date,
        }));
    },


    getFunImage: async () => {
      const now = Date.now();
      const hoursSince = (now - lastGeneratedAt) / (1000 * 60 * 60);

      if (imageUrl && explanation && hoursSince < 12) {
        console.log("⏳ Using cached AI image from file.");
        return { imageUrl, explanation };
      }

      console.log("⚙️ Generating new AI image...");

      const promptResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            "role": "system",
            "content": "You're an informative and creative AI that generates fun, educational, and kid-friendly image ideas based on real-world subjects. Your goal is to describe simple but interesting real animals, plants, people, or cities in a way that's safe, exciting, and easy to imagine as an illustration for children. Focus on accurate but engaging descriptions."
          },
          {
            "role": "user",
            "content": "Generate a random real-world animal, plant, famous person, or city. For the chosen subject, provide: 1) a fun, imaginative name for the image that hints at its real-world nature, and 2) a short, accurate explanation that helps kids understand what it is and why it’s cool or interesting. Make it highly visual so it can be drawn as a kid-friendly image."
          }
        ]

      });

      const prompt = promptResponse.choices[0].message.content.trim();

      const image = await openai.images.generate({
        model: "dall-e-3",
        prompt,
        size: "1024x1024",
        response_format: "url"
      });

      const explanationResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You're a fun and smart AI teacher for kids." },
          { role: "user", content: `Explain this image: "${prompt}" in a short, fun way for children.` }
        ]
      });

      explanation = explanationResponse.choices[0].message.content.trim();
      imageUrl = image.data[0].url;
      lastGeneratedAt = now;

      saveCache({ imageUrl, explanation, lastGeneratedAt });

      console.log("✅ New image saved to file cache.");
      return { imageUrl, explanation };
    },

    generatePuzzleFromTopic: async (_, { topic }) => {
      const systemPrompt = "You're a creative science educator for kids aged 7-13. Your job is to generate visual puzzles or questions based on real science topics, and describe the image to generate and the question to ask.";

      const userPrompt = `
Generate a fun, image-based question or puzzle for kids based on this topic: "${topic}".
Return your answer in this exact format:
---
IMAGE_PROMPT: [describe the image to generate for DALL·E]
QUESTION: [ask a simple question about the image]
ANSWER: [the correct answer]
---`;

      const gptResponse = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      });

      const output = gptResponse.choices[0].message.content.trim();

      // 🧠 Parse GPT output
      const imagePrompt = output.match(/IMAGE_PROMPT:\s*(.+)/)?.[1]?.trim();
      const question = output.match(/QUESTION:\s*(.+)/)?.[1]?.trim();
      const answer = output.match(/ANSWER:\s*(.+)/)?.[1]?.trim();

      if (!imagePrompt || !question || !answer) {
        throw new Error("GPT output format error. Please retry.");
      }

      // 🎨 Generate image
      const imageResult = await openai.images.generate({
        model: "dall-e-3",
        prompt: imagePrompt,
        size: "1024x1024",
        response_format: "url"
      });

      return {
        imageUrl: imageResult.data[0].url,
        question,
        answer
      };
    },

    evaluatePuzzleAnswer: async (_, { question, userAnswer }) => {
      const systemPrompt = "You are a fun, encouraging science teacher for kids. If the answer is correct, praise them. If it's wrong, gently explain the right answer.";

      const userPrompt = `Here's the question: "${question}". The child answered: "${userAnswer}". What should I say back to them? Keep it short and kind.`;

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      });

      return {
        feedback: response.choices[0].message.content
      };
    }


  },


  Mutation: {
    registerParent: async (_, { email, password }) => {
      const existing = await User.findOne({ email });
      if (existing) throw new Error('User already exists');
      const hashed = await bcrypt.hash(password, 12);
      const user = await User.create({ email, password: hashed, role: 'PARENT' });

      const token = jwt.sign({ id: user._id, role: user.role }, SECRET);
      return { token, user };
    },

    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user) throw new Error('Invalid email');
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error('Invalid password');

      const token = jwt.sign({ id: user._id, role: user.role }, SECRET);
      return { token, user };
    },

    createChildProfile: async (_, { name, age, username, password }, { req }) => {
      const user = req.user;
      if (!user || user.role !== 'PARENT') throw new Error('Unauthorized');

      const existing = await Child.findOne({ username });
      if (existing) throw new Error('Username already exists');

      const hashedPassword = await bcrypt.hash(password, 12);

      const child = await Child.create({
        name,
        age,
        username,
        password: hashedPassword,
        parent: user.id
      });

      await User.findByIdAndUpdate(user.id, { $push: { children: child._id } });

      return child;
    },

    loginChild: async (_, { username, password }) => {
      const child = await Child.findOne({ username });
      if (!child) throw new Error("Username not found");

      const valid = await bcrypt.compare(password, child.password);
      if (!valid) throw new Error("Incorrect password");

      const token = jwt.sign(
        { id: child._id, role: 'CHILD' },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )
      return { token, child };
    },

    createAssignment: async (_, { childId, title, description, questions, difficulty }, { req }) => { // Add 'difficulty' here
      const user = req.user;
      if (!user || user.role !== 'PARENT') throw new Error('Unauthorized');

      const assignment = await Assignment.create({
        title,
        description,
        child: childId,
        questions,
        difficulty,
      });

      return assignment;
    },

    updateAssignmentStatus: async (_, { assignmentId, status, responses }, { req }) => {
      const child = req.child;
      if (!child) throw new Error("Unauthorized");

      // Find the assignment and ensure it belongs to the child
      const assignment = await Assignment.findOne({ _id: assignmentId, child: child._id });
      if (!assignment) throw new Error("Assignment not found or does not belong to this child.");

      // Set basic status and responses
      assignment.status = status;
      if (responses) assignment.responses = responses;
      assignment.completedAt = new Date(); // Set completion date

      // --- Start: Evaluation Logic ---
      let totalCorrect = 0;
      const evaluationResults = [];

      if (status === 'COMPLETED' && responses && assignment.questions && assignment.questions.length > 0) {
        assignment.questions.forEach((question, index) => {
          const studentResponse = responses.find(r => r.questionIndex === index);
          let isCorrect = false;
          let feedback = "";

          if (studentResponse) {
            const studentAnswerClean = studentResponse.answer ? studentResponse.answer.trim().toLowerCase() : '';
            const correctAnswerClean = question.answer ? question.answer.trim().toLowerCase() : '';

            // CRUCIAL: Robust string comparison for auto-evaluation
            if (question.type === 'MULTIPLE_CHOICE' || question.type === 'TRUE_FALSE' || question.type === 'SHORT_ANSWER') {
              isCorrect = studentAnswerClean === correctAnswerClean;
            } else if (question.type === 'EXPLAIN') {
              // For 'EXPLAIN' type, auto-evaluation is tricky.
              // For now, it defaults to incorrect unless a more sophisticated AI check is added.
              // You might want to leave these for manual parent evaluation.
              isCorrect = false;
              feedback = "This type of question requires manual review by your parent.";
            }

            if (isCorrect) {
              totalCorrect++;
              feedback = "Correct! 🎉";
            } else {
              feedback = `Your answer "${studentResponse.answer}" was incorrect.`;
              if (question.answer) {
                 feedback += ` The correct answer was "${question.answer}".`;
              }
            }
          } else {
            // If a question was skipped (no response provided)
            isCorrect = false;
            feedback = "No response provided for this question.";
          }

          evaluationResults.push({ questionIndex: index, isCorrect, feedback });
        });

        // Calculate overall score
        const score = (totalCorrect / assignment.questions.length) * 100;

        // Update the assignment document with the evaluation results
        assignment.totalCorrect = totalCorrect;
        assignment.score = score;
        assignment.evaluation = evaluationResults;
        assignment.status = 'EVALUATED'; // Set status to EVALUATED after scoring
      }
      // --- End: Evaluation Logic ---

      await assignment.save(); // Save all changes including evaluation, score, totalCorrect

      // 1️⃣ XP logic - now uses calculated score for more nuanced XP
      let xpGained = 0; // Initialize XP gained
      if (assignment.status === 'EVALUATED') { // Only give XP if evaluated
          if (assignment.difficulty === 'EASY') xpGained = 10;
          else if (assignment.difficulty === 'MEDIUM') xpGained = 20;
          else if (assignment.difficulty === 'HARD') xpGained = 30;

          // Optional: Adjust XP based on score
          if (assignment.score > 90) xpGained *= 1.2; // 20% bonus for high score
          else if (assignment.score < 50) xpGained *= 0.5; // Half XP for low score
          xpGained = Math.round(xpGained); // Round to nearest whole number
      }


      const targetChild = await Child.findById(child._id);
      if (targetChild) { // Ensure child exists before updating
        targetChild.xp = (targetChild.xp || 0) + xpGained;

        // 2️⃣ Badge logic - Recalculate completed count including 'EVALUATED'
        const badges = new Set(targetChild.badges || []);
        const completedCount = await Assignment.countDocuments({ child: child._id, status: { $in: ['COMPLETED', 'EVALUATED'] } });

        if (completedCount === 1 && !badges.has('First Task')) { // Check for exactly 1 completed assignment
          badges.add('First Task');
          await pushParentNotification(child._id, `${child.name} unlocked the "First Task" badge! 🏅`);
        }
        if (completedCount >= 3 && !badges.has('Task Master')) {
          badges.add('Task Master');
          await pushParentNotification(child._id, `${child.name} unlocked the "Task Master" badge! 🏅`);
        }
        if (targetChild.xp >= 10 && !badges.has('Rising Star')) {
          badges.add('Rising Star');
          await pushParentNotification(child._id, `${child.name} unlocked the "Rising Star" badge! 🏅`);
        }
        // 'Hard Worker' badge now considers score for HARD assignments
        if (assignment.difficulty === 'HARD' && assignment.score >= 70 && !badges.has('Hard Worker')) {
          badges.add('Hard Worker');
          await pushParentNotification(child._id, `${child.name} unlocked the "Hard Worker" badge! 🏅`);
        }

        targetChild.badges = Array.from(badges);
        await targetChild.save();

        // 3️⃣ Parent XP notification
        await pushParentNotification(
          child._id,
          `${child.name} completed "${assignment.title}" (Score: ${assignment.score.toFixed(0)}%, XP: +${xpGained.toFixed(0)})`
        );
      }

      // ⭐ CRITICAL: Return the *fully updated* assignment object,
      // ensuring all fields align with your GraphQL schema.
      // Use .toObject() to convert Mongoose document to a plain JavaScript object
      // before spreading, and explicitly format dates/IDs.
      return {
          ...assignment.toObject(),
          id: assignment._id.toString(), // Ensure ID is a string
          createdAt: assignment.createdAt?.toISOString(),
          completedAt: assignment.completedAt?.toISOString() || null,
          // Mongoose .toObject() should include totalCorrect, score, evaluation
          // as they are now saved on the document.
          // Ensure nested objects like questions, responses, evaluation are also plain objects
          // if they contain Mongoose sub-document methods that might cause issues.
          // For evaluation, it's already an array of plain objects due to `evaluationResults`
          // and the schema definition.
          questions: assignment.questions ? assignment.questions.map(q => q.toObject ? q.toObject() : q) : [],
          responses: assignment.responses ? assignment.responses.map(r => r.toObject ? r.toObject() : r) : [],
          evaluation: assignment.evaluation ? assignment.evaluation.map(e => e.toObject ? e.toObject() : e) : [],
      };
    },

    // Update assignment feedback
    updateAssignmentFeedback: async (_, { assignmentId, feedback }, { req }) => {
      const user = req.user;
      if (!user || user.role !== 'PARENT') throw new Error("Unauthorized");

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) throw new Error("Assignment not found");

      assignment.feedback = feedback;
      await assignment.save();

      // Return the updated assignment with all fields expected by GraphQL schema
      return {
          ...assignment.toObject(),
          id: assignment._id.toString(),
          createdAt: assignment.createdAt?.toISOString(),
          completedAt: assignment.completedAt?.toISOString() || null,
          totalCorrect: assignment.totalCorrect || 0,
          score: assignment.score || 0,
          evaluation: assignment.evaluation || [],
          questions: assignment.questions ? assignment.questions.map(q => q.toObject ? q.toObject() : q) : [],
          responses: assignment.responses ? assignment.responses.map(r => r.toObject ? r.toObject() : r) : [],
      };
    },

    // Save trivia score
    saveTriviaScore: async (_, { childId, score }) => {
      const result = await TriviaResult.create({
        childId,
        score,
      });

      return {
        id: result._id.toString(), // Ensure ID is string
        childId: result.childId.toString(),
        score: result.score,
        date: result.date.toISOString(),
      };
    },

    // Add XP to a child
    updateChildXP: async (_, { childId, xp }) => {
      const child = await Child.findById(childId);
      if (!child) throw new Error("Child not found");

      child.xp = (child.xp || 0) + xp; // Ensure xp is initialized if null
      await child.save();

      return child;
    },

    // Add a badge if not already owned
    addChildBadge: async (_, { childId, badge }) => {
      const child = await Child.findById(childId);
      if (!child) throw new Error("Child not found");

      if (!child.badges.includes(badge)) {
        child.badges.push(badge);
        await child.save();
      }

      return child;
    },

    evaluateAssignmentResponse: async (_, { childId, assignmentId, evaluation }, context) => {
      // Check if user is a parent
      if (!context.user || context.user.role !== 'PARENT') {
        throw new Error('Unauthorized');
      }

      // Find assignment
      const assignment = await Assignment.findOne({ _id: assignmentId, 'child': childId });

      if (!assignment) {
        throw new Error('Assignment not found');
      }

      // Count total correct answers
      const totalCorrect = evaluation.filter(e => e.isCorrect).length;
      const totalQuestions = assignment.questions.length; // Use actual questions length for score base
      const score = (totalCorrect / totalQuestions) * 100;

      // Save evaluation results
      assignment.evaluation = evaluation;
      assignment.totalCorrect = totalCorrect;
      assignment.score = score;
      assignment.status = 'EVALUATED'; // Set status to EVALUATED

      await assignment.save();

      return {
        assignmentId: assignment._id.toString(),
        responses: assignment.responses || [], // ✅ guaranteed array
        evaluation,
        totalCorrect,
        score,
      };

    }
  } // <--- Closing brace for the Mutation object
}; // <--- Closing brace for the module.exports object. NO SEMICOLON AFTER THIS!