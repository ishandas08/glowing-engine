const mongoose = require('mongoose');

const visibilityEnum = ['everyone', 'matches', 'hidden'];

const profileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  name: { type: String, default: '' },
  bio: { type: String, default: '' },
  interests: { type: [String], default: [] },
  year: { type: String, default: '' },
  photos: { type: [String], default: [] },
  visibility: {
    name: { type: String, enum: visibilityEnum, default: 'everyone' },
    bio: { type: String, enum: visibilityEnum, default: 'everyone' },
    interests: { type: String, enum: visibilityEnum, default: 'everyone' },
    year: { type: String, enum: visibilityEnum, default: 'everyone' },
    photos: { type: String, enum: visibilityEnum, default: 'everyone' },
  },
  contactShare: {
    value: String,
    expiresAt: Date,
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Profile', profileSchema);
