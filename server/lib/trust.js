const User = require('../models/User');
const Profile = require('../models/Profile');
const Report = require('../models/Report');

async function trustScore(userId) {
  const user = await User.findById(userId);
  const profile = await Profile.findOne({ userId });
  const reports = await Report.countDocuments({ targetId: userId });
  let score = 0;
  if (user) score += 30; // verified email
  if (profile) {
    if (profile.name) score += 10;
    if (profile.bio) score += 10;
    if (profile.interests && profile.interests.length) score += 10;
    if (profile.year) score += 5;
    if (profile.photos && profile.photos.length) score += 15;
  }
  const ageDays = user ? (Date.now() - new Date(user.createdAt).getTime()) / 86400000 : 0;
  score += Math.min(20, Math.floor(ageDays));
  score -= reports * 10;
  return Math.max(0, Math.min(100, score));
}

module.exports = trustScore;
