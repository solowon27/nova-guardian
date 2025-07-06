const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Child = require('../models/Child');
const Parent = require('../models/Parent');
const Assignment = require('../models/Assignment');
const { AuthenticationError } = require('apollo-server-express');
const TriviaResult = require('../models/TriviaResult');
const { pushParentNotification } = require('../utils/notify');
const openai = require('../utils/openaiClient');
const { loadCache, saveCache } = require('../utils/cache');


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
      
      const child = await Child.findById(childId).lean();
      if (!child || child.parent.toString() !== parent.id.toString()) {
        throw new Error("Access denied");
      }

      const assignments = await Assignment.find({ child: child._id }).lean();

      return assignments.map(a => ({
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
      
      const imagePrompt = output.match(/IMAGE_PROMPT:\s*(.+)/)?.[1]?.trim();
      const question = output.match(/QUESTION:\s*(.+)/)?.[1]?.trim();
      const answer = output.match(/ANSWER:\s*(.+)/)?.[1]?.trim();

      if (!imagePrompt || !question || !answer) {
        throw new Error("GPT output format error. Please retry.");
      }
      
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

  login: async (_, { email, username, password }) => {
      let user;
      let role;

      if (email) {
        user = await User.findOne({ email });
        if (!user) throw new Error('No parent found with this email.');
        role = 'PARENT';
      } else if (username) {
        user = await Child.findOne({ username });
        if (!user) throw new Error('No child found with this username.');
        role = 'CHILD';
      } else {
        throw new Error('Please provide an email or username.');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) throw new Error('Invalid password.');

      const token = jwt.sign({ id: user._id, role }, SECRET, { expiresIn: '7d' });
      
      // Return a standardized user object
      return {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          username: user.username,
          role,
          age: user.age, // Include age for child login
        },
      };
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

    createAssignment: async (_, { childId, title, description, questions, difficulty }, { req }) => {
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
    
    // ✅ CORRECTED: This function only saves the child's answers and marks the assignment as 'COMPLETED'.
    updateAssignmentStatus: async (_, { assignmentId, status, responses }, { req }) => {
      const child = req.child;
      if (!child) throw new Error("Unauthorized");

      const assignment = await Assignment.findOne({ _id: assignmentId, child: child._id });
      if (!assignment) throw new Error("Assignment not found or does not belong to this child.");
      
      assignment.status = status; // This will be 'COMPLETED'
      if (responses) assignment.responses = responses;
      assignment.completedAt = new Date();

      await assignment.save();
      
      await pushParentNotification(
        child._id,
        `${child.name} has completed the assignment "${assignment.title}". It is ready for your review.`
      );
      
      return {
          ...assignment.toObject(),
          id: assignment._id.toString(),
          createdAt: assignment.createdAt?.toISOString(),
          completedAt: assignment.completedAt?.toISOString() || null,
          questions: assignment.questions ? assignment.questions.map(q => q.toObject ? q.toObject() : q) : [],
          responses: assignment.responses ? assignment.responses.map(r => r.toObject ? r.toObject() : r) : [],
          evaluation: [],
          totalCorrect: 0,
          score: 0,
      };
    },

    updateAssignmentFeedback: async (_, { assignmentId, feedback }, { req }) => {
      const user = req.user;
      if (!user || user.role !== 'PARENT') throw new Error("Unauthorized");

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) throw new Error("Assignment not found");

      assignment.feedback = feedback;
      await assignment.save();
      
      return {
          ...assignment.toObject(),
          id: assignment._id.toString(),
          createdAt: assignment.createdAt?.toISOString(),
          completedAt: assignment.completedAt?.toISOString() || null,
          score: assignment.score !== undefined ? assignment.score : undefined,
          totalCorrect: assignment.totalCorrect !== undefined ? assignment.totalCorrect : undefined,
          evaluation: assignment.evaluation?.length ? assignment.evaluation : undefined,
          questions: assignment.questions ? assignment.questions.map(q => q.toObject ? q.toObject() : q) : [],
          responses: assignment.responses ? assignment.responses.map(r => r.toObject ? r.toObject() : r) : [],
      };
    },

    saveTriviaScore: async (_, { childId, score }) => {
      const result = await TriviaResult.create({
        childId,
        score,
      });

      return {
        id: result._id.toString(),
        childId: result.childId.toString(),
        score: result.score,
        date: result.date.toISOString(),
      };
    },

    updateChildXP: async (_, { childId, xp }) => {
      const child = await Child.findById(childId);
      if (!child) throw new Error("Child not found");

      child.xp = (child.xp || 0) + xp;
      await child.save();

      return child;
    },
    
    addChildBadge: async (_, { childId, badge }) => {
      const child = await Child.findById(childId);
      if (!child) throw new Error("Child not found");

      if (!child.badges.includes(badge)) {
        child.badges.push(badge);
        await child.save();
      }

      return child;
    },

    // ✅ CORRECTED: This function handles the parent's manual evaluation and awards XP/badges.
    evaluateAssignmentResponse: async (_, { childId, assignmentId, evaluation }, context) => {
      if (!context.req.user || context.req.user.role !== 'PARENT') {
        throw new Error('Unauthorized');
      }

      const assignment = await Assignment.findOne({ _id: assignmentId, child: childId });
      if (!assignment) {
        throw new Error('Assignment not found');
      }

      const totalCorrect = evaluation.filter(e => e.isCorrect).length;
      const totalQuestions = assignment.questions.length;
      const score = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;
      
      assignment.evaluation = evaluation;
      assignment.totalCorrect = totalCorrect;
      assignment.score = score;
      assignment.status = 'EVALUATED';

      // --- Moved Reward Logic ---
      let xpGained = 0;
      if (assignment.difficulty === 'EASY') xpGained = 10;
      else if (assignment.difficulty === 'MEDIUM') xpGained = 20;
      else if (assignment.difficulty === 'HARD') xpGained = 30;

      if (score > 90) xpGained *= 1.2;
      else if (score < 50) xpGained *= 0.5;
      xpGained = Math.round(xpGained);

      const targetChild = await Child.findById(childId);
      if (targetChild) {
        targetChild.xp = (targetChild.xp || 0) + xpGained;

        const badges = new Set(targetChild.badges || []);
        const completedCount = await Assignment.countDocuments({ child: childId, status: 'EVALUATED' });

        if (completedCount === 1 && !badges.has('First Task')) badges.add('First Task');
        if (completedCount >= 3 && !badges.has('Task Master')) badges.add('Task Master');
        if (targetChild.xp >= 10 && !badges.has('Rising Star')) badges.add('Rising Star');
        if (assignment.difficulty === 'HARD' && score >= 70 && !badges.has('Hard Worker')) badges.add('Hard Worker');
        
        targetChild.badges = Array.from(badges);
        await targetChild.save();
        
        await pushParentNotification(
          childId,
          `You evaluated "${assignment.title}" for ${targetChild.name}. Score: ${score.toFixed(0)}%, XP: +${xpGained}`
        );
      }
      
      await assignment.save();

      return {
        assignmentId: assignment._id.toString(),
        responses: assignment.responses || [],
        evaluation,
        totalCorrect,
        score,
      };
    }
  }
  };