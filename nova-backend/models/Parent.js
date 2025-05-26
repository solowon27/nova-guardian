const mongoose = require('mongoose');

const parentSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Child' }],
});

module.exports = mongoose.models.Parent || mongoose.model('Parent', parentSchema);

