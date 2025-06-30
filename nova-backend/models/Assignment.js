const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['EXPLAIN', 'SHORT_ANSWER', 'TRUE_FALSE', 'MULTIPLE_CHOICE'],
    required: true,
  },
  prompt: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    default: undefined,
  },
  answer: {
    type: String,
    default: '',
  },
});

// ✅ Add AnswerEvaluation schema
const evaluationSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  feedback: {
    type: String,
    default: '',
  }
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  child: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Child',
    required: true,
  },
  questions: {
    type: [questionSchema],
    default: [],
  },
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'EVALUATED'], // 💡 Added "EVALUATED"
    default: 'PENDING',
  },
  points: {
    type: Number,
    default: 1,
  },
  difficulty: {
    type: String,
    enum: ['EASY', 'MEDIUM', 'HARD'],
    default: 'EASY',
  },
  dueDate: Date,
  completedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  feedback: {
    type: String,
    default: '',
  },
  responses: {
    type: [
      {
        questionIndex: Number,
        answer: String,
      }
    ],
    default: [],
  },
  evaluation: {
    type: [evaluationSchema],  // ✅ New field
    default: [],
  },
  totalCorrect: {
    type: Number,
    default: 0,
  },
  score: {
    type: Number,
    default: 0,
  },
});

assignmentSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

assignmentSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.models.Assignment || mongoose.model('Assignment', assignmentSchema);
