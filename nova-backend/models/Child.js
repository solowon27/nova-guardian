const mongoose = require('mongoose');

const childSchema = new mongoose.Schema({
  name: String,
  age: Number,
  username: { type: String, unique: true },
  password: String,
  parent: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  xp: { type: Number, default: 0 },
  badges: { type: [String], default: [], },
  avatarUrl: {
  type: String,
  default: '', // Or you can assign a default avatar
}


});

module.exports = mongoose.model('Child', childSchema);
