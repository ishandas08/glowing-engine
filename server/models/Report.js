const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  reviewed: { type: Boolean, default: false },
});

module.exports = mongoose.model('Report', reportSchema);
