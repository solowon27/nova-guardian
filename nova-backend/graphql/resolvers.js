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
        responses: a.responses || [],
        questions: a.questions || [],
        feedback: a.feedback || '',
        title: a.title,
        description: a.description,
        status: a.status,
        difficulty: a.difficulty || 'EASY',
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
                      "content": "You're a creative AI that generates fun, educational, and kid-friendly image ideas. Your goal is to describe simple but interesting concepts like animals, machines, planets, or places in a way that's safe, exciting, and easy to imagine as an illustration for children."
                    },
                    {
                      "role": "user",
                      "content": "Generate a random animal, machine/equipment, planet, or country. For one of them, provide: 1) a fun, imaginative name for the image, and 2) a short explanation that helps kids understand what it is and why it’s cool. Make it visual so it can be drawn as a kid-friendly image."
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

      const assignment = await Assignment.findOne({ _id: assignmentId, child: child._id });
      if (!assignment) throw new Error("Assignment not found");

      assignment.status = status;
      if (responses) assignment.responses = responses;
      assignment.completedAt = new Date();
      await assignment.save();

      // 1️⃣ XP logic
      let xpGained = 1;
      if (assignment.difficulty === 'MEDIUM') xpGained = 2;
      else if (assignment.difficulty === 'HARD') xpGained = 3;

      const targetChild = await Child.findById(child._id);
      targetChild.xp = (targetChild.xp || 0) + xpGained;

      // 2️⃣ Badge logic
      const badges = new Set(targetChild.badges || []);
      const completedCount = await Assignment.countDocuments({ child: child._id, status: 'COMPLETED' });

      if (completedCount === 0) {
        badges.add('First Task');
        await pushParentNotification(child._id, `${child.name} unlocked the "First Task" badge! 🏅`);
      }

      if (completedCount + 1 >= 3 && !badges.has('Task Master')) {
        badges.add('Task Master');
        await pushParentNotification(child._id, `${child.name} unlocked the "Task Master" badge! 🏅`);
      }

      if (targetChild.xp >= 10 && !badges.has('Rising Star')) {
        badges.add('Rising Star');
        await pushParentNotification(child._id, `${child.name} unlocked the "Rising Star" badge! 🏅`);
      }

      if (assignment.difficulty === 'HARD' && !badges.has('Hard Worker')) {
        badges.add('Hard Worker');
        await pushParentNotification(child._id, `${child.name} unlocked the "Hard Worker" badge! 🏅`);
      }

      targetChild.badges = Array.from(badges);
      await targetChild.save();

      // 3️⃣ Parent XP notification
      await pushParentNotification(
        child._id,
        `${child.name} completed "${assignment.title}" (${assignment.difficulty}) — +${xpGained} XP`
      );

      return assignment;
    },

    // Update assignment feedback
    updateAssignmentFeedback: async (_, { assignmentId, feedback }, { req }) => {
      const user = req.user;
      if (!user || user.role !== 'PARENT') throw new Error("Unauthorized");

      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) throw new Error("Assignment not found");

      assignment.feedback = feedback;
      await assignment.save();

      return assignment;
    },

    // Save trivia score
    saveTriviaScore: async (_, { childId, score }) => {
      const result = await TriviaResult.create({
        childId,
        score,
      });

      return {
        id: result._id,
        childId: result.childId.toString(),
        score: result.score,
        date: result.date.toISOString(),
      };
    },

    // Add XP to a child
    updateChildXP: async (_, { childId, xp }) => {
      const child = await Child.findById(childId);
      if (!child) throw new Error("Child not found");

      child.xp += xp;
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

  } // <--- Closing brace for the Mutation object
}; // <--- Closing brace for the module.exports object. NO SEMICOLON AFTER THIS!