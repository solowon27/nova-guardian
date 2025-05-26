const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  token: String,
  role: { type: String, default: 'PARENT' },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Child' }],
  notifications: [
    {
      message: String,
      date: { type: Date, required: true, default: Date.now }, // Default to current date
    },
  ],
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
