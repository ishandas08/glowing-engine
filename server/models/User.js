const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: String,
  picture: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  department: { type: String, default: '' },
  isSuspended: { type: Boolean, default: false },
  suspensionReason: { type: String, default: '' },
  warningCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
