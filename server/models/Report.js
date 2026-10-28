const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    enum: ['impersonation', 'harassment', 'inappropriate_photos', 'fake_student', 'spam', 'unsolicited_contact', 'other'],
    default: 'other',
  },
  reason: { type: String, required: true },
  details: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'reviewed', 'action_taken', 'dismissed'], default: 'pending' },
  reviewed: { type: Boolean, default: false },
  actionTaken: { type: String, default: '' },
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },
});

module.exports = mongoose.model('Report', reportSchema);
