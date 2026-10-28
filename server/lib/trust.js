const dataService = require('./dataService');

/**
 * Calculates a comprehensive trust score and verifiable trust signals for a user.
 * @param {string} userId
 * @returns {Promise<Object>} { score, grade, badge, breakdown, verifiedBadges }
 */
async function calculateTrust(userId) {
  const user = await dataService.findUserById(userId);
  const profile = await dataService.findProfileByUserId(userId);
  const activeReports = await dataService.getActiveReportCount(userId);
  const mutualConnections = await dataService.getMutualConnectionCount(userId);

  const breakdown = {
    emailVerification: { points: 0, max: 30, label: 'Verified College Domain (@kiit.ac.in)' },
    profileCompleteness: { points: 0, max: 35, label: 'Authentic Profile Details' },
    accountTenure: { points: 0, max: 15, label: 'Account Age & Stability' },
    campusEndorsements: { points: 0, max: 15, label: 'Mutual Campus Connections' },
    safetyPledge: { points: 0, max: 5, label: 'Anti-Harassment & Safety Pledge' },
    reportDeductions: { points: 0, label: 'Community Misconduct Reports' },
  };

  const verifiedBadges = [];

  // 1. Institutional Email
  if (user && user.email) {
    breakdown.emailVerification.points = 30;
    verifiedBadges.push({ id: 'email', label: 'Institutional Email Verified', icon: 'shield-check' });
  }

  // 2. Profile completeness
  if (profile) {
    let pPoints = 0;
    if (profile.name && profile.name.trim().length > 1) pPoints += 5;
    if (profile.bio && profile.bio.trim().length > 10) pPoints += 10;
    if (profile.interests && profile.interests.length >= 2) pPoints += 5;
    if (profile.year) pPoints += 5;
    if (profile.department) pPoints += 5;
    if (profile.photos && profile.photos.length > 0) pPoints += 5;
    breakdown.profileCompleteness.points = Math.min(35, pPoints);

    if (profile.photos && profile.photos.length > 0) {
      verifiedBadges.push({ id: 'photo', label: 'Profile Photo Added', icon: 'camera' });
    }
    if (profile.safetyPledgeAgreed) {
      breakdown.safetyPledge.points = 5;
      verifiedBadges.push({ id: 'pledge', label: 'Safe Meet Pledge Signed', icon: 'award' });
    }
  }

  // 3. Account tenure (1 point per 2 days active, up to 15 points)
  if (user && user.createdAt) {
    const ageDays = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / 86400000);
    breakdown.accountTenure.points = Math.min(15, Math.max(1, Math.floor(ageDays * 0.5) + 3));
  } else {
    breakdown.accountTenure.points = 5;
  }

  // 4. Mutual peer endorsements
  breakdown.campusEndorsements.points = Math.min(15, mutualConnections * 5);
  if (mutualConnections >= 2) {
    verifiedBadges.push({ id: 'peers', label: `${mutualConnections} Mutual Connections`, icon: 'users' });
  }

  // 5. Deductions for active reports
  if (activeReports > 0) {
    breakdown.reportDeductions.points = -(activeReports * 20);
  } else {
    verifiedBadges.push({ id: 'clean', label: 'Clean Safety Record', icon: 'check-circle' });
  }

  // Total calculation
  let rawScore =
    breakdown.emailVerification.points +
    breakdown.profileCompleteness.points +
    breakdown.accountTenure.points +
    breakdown.campusEndorsements.points +
    breakdown.safetyPledge.points +
    breakdown.reportDeductions.points;

  const score = Math.max(0, Math.min(100, rawScore));

  let level = 'Verified Student';
  let badgeColor = 'blue';

  if (activeReports > 0 || score < 40) {
    level = 'Under Review';
    badgeColor = 'amber';
  } else if (score >= 90) {
    level = 'Campus Ambassador';
    badgeColor = 'emerald';
  } else if (score >= 75) {
    level = 'Highly Trusted Peer';
    badgeColor = 'indigo';
  } else if (score >= 60) {
    level = 'Verified Student';
    badgeColor = 'blue';
  }

  return {
    score,
    level,
    badgeColor,
    breakdown,
    verifiedBadges,
    mutualConnections,
    activeReports,
    email: user ? user.email : '',
  };
}

async function trustScore(userId) {
  const result = await calculateTrust(userId);
  return result.score;
}

module.exports = trustScore;
module.exports.calculateTrust = calculateTrust;
