const mongoose = require('mongoose');
const connectDB = require('./db');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Connection = require('../models/Connection');
const Report = require('../models/Report');
const Block = require('../models/Block');
const mockStore = require('./mockStore');

function isConnected() {
  return mongoose.connection && mongoose.connection.readyState === 1;
}

// User Operations
async function findUserById(id) {
  if (isConnected()) {
    return await User.findById(id);
  }
  return mockStore.users.find((u) => String(u._id) === String(id)) || null;
}

async function findUserByEmail(email) {
  if (isConnected()) {
    return await User.findOne({ email: email.toLowerCase().trim() });
  }
  return mockStore.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim()) || null;
}

async function findUserByGoogleId(googleId) {
  if (isConnected()) {
    return await User.findOne({ googleId });
  }
  return mockStore.users.find((u) => u.googleId === googleId) || null;
}

async function createUser(userData) {
  if (isConnected()) {
    return await User.create(userData);
  }
  const newUser = {
    _id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    isSuspended: false,
    warningCount: 0,
    createdAt: new Date(),
    ...userData,
  };
  mockStore.users.push(newUser);
  return newUser;
}

async function updateUser(id, updateData) {
  if (isConnected()) {
    return await User.findByIdAndUpdate(id, { $set: updateData }, { new: true });
  }
  const user = mockStore.users.find((u) => String(u._id) === String(id));
  if (user) {
    Object.assign(user, updateData);
    return user;
  }
  return null;
}

// Profile Operations
async function findProfileByUserId(userId) {
  if (isConnected()) {
    return await Profile.findOne({ userId });
  }
  return mockStore.profiles.find((p) => String(p.userId) === String(userId)) || null;
}

async function updateOrCreateProfile(userId, profileData) {
  if (isConnected()) {
    return await Profile.findOneAndUpdate(
      { userId },
      { $set: profileData, $setOnInsert: { userId } },
      { upsert: true, new: true }
    );
  }
  let profile = mockStore.profiles.find((p) => String(p.userId) === String(userId));
  if (!profile) {
    profile = {
      _id: `prof_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId,
      createdAt: new Date(),
      ...profileData,
    };
    mockStore.profiles.push(profile);
  } else {
    Object.assign(profile, profileData, { updatedAt: new Date() });
  }
  return profile;
}

async function getCampusProfiles(currentUserId) {
  if (isConnected()) {
    const blocks = await Block.find({
      $or: [{ blockerId: currentUserId }, { blockedId: currentUserId }],
    });
    const blockedUserIds = blocks.map((b) =>
      String(b.blockerId) === String(currentUserId) ? b.blockedId : b.blockerId
    );

    const suspendedUsers = await User.find({ isSuspended: true }).select('_id');
    const suspendedIds = suspendedUsers.map((u) => u._id);

    const excludeIds = [currentUserId, ...blockedUserIds, ...suspendedIds];

    return await Profile.find({
      userId: { $nin: excludeIds },
    }).populate('userId', 'email name picture isSuspended createdAt department role');
  }

  // Mock store filtering
  const blockedIds = mockStore.blocks
    .filter((b) => String(b.blockerId) === String(currentUserId) || String(b.blockedId) === String(currentUserId))
    .map((b) => (String(b.blockerId) === String(currentUserId) ? String(b.blockedId) : String(b.blockerId)));

  const suspendedIds = mockStore.users.filter((u) => u.isSuspended).map((u) => String(u._id));
  const excludeSet = new Set([String(currentUserId), ...blockedIds, ...suspendedIds]);

  return mockStore.profiles
    .filter((p) => !excludeSet.has(String(p.userId)))
    .map((p) => {
      const user = mockStore.users.find((u) => String(u._id) === String(p.userId));
      return {
        ...p,
        userId: user || { _id: p.userId, email: 'student@kiit.ac.in', name: p.name },
      };
    });
}

// Connections Operations
async function getAcceptedMatches(userId) {
  if (isConnected()) {
    const conns = await Connection.find({
      $or: [
        { requesterId: userId, status: 'accepted' },
        { recipientId: userId, status: 'accepted' },
      ],
    });
    return conns.map((c) =>
      String(c.requesterId) === String(userId) ? String(c.recipientId) : String(c.requesterId)
    );
  }
  return mockStore.connections
    .filter(
      (c) =>
        c.status === 'accepted' &&
        (String(c.requesterId) === String(userId) || String(c.recipientId) === String(userId))
    )
    .map((c) =>
      String(c.requesterId) === String(userId) ? String(c.recipientId) : String(c.requesterId)
    );
}

async function isMutualMatch(userA, userB) {
  if (isConnected()) {
    const conn = await Connection.findOne({
      $or: [
        { requesterId: userA, recipientId: userB, status: 'accepted' },
        { requesterId: userB, recipientId: userA, status: 'accepted' },
      ],
    });
    return !!conn;
  }
  return mockStore.connections.some(
    (c) =>
      c.status === 'accepted' &&
      ((String(c.requesterId) === String(userA) && String(c.recipientId) === String(userB)) ||
        (String(c.requesterId) === String(userB) && String(c.recipientId) === String(userA)))
  );
}

async function isPendingConnection(fromUser, toUser) {
  if (isConnected()) {
    const conn = await Connection.findOne({
      requesterId: fromUser,
      recipientId: toUser,
      status: 'pending',
    });
    return !!conn;
  }
  return mockStore.connections.some(
    (c) =>
      c.status === 'pending' &&
      String(c.requesterId) === String(fromUser) &&
      String(c.recipientId) === String(toUser)
  );
}

async function sendConnectionRequest(fromId, toId, note) {
  if (isConnected()) {
    let existing = await Connection.findOne({
      $or: [
        { requesterId: fromId, recipientId: toId },
        { requesterId: toId, recipientId: fromId },
      ],
    });

    if (existing) {
      if (existing.status === 'accepted') throw new Error('Already connected');
      if (String(existing.requesterId) === String(toId) && existing.status === 'pending') {
        existing.status = 'accepted';
        existing.updatedAt = new Date();
        await existing.save();
        return { message: 'Mutual match! Connected.', connection: existing, status: 'accepted' };
      }
      existing.requesterId = fromId;
      existing.recipientId = toId;
      existing.status = 'pending';
      existing.note = note || '';
      existing.updatedAt = new Date();
      await existing.save();
      return { message: 'Request sent', connection: existing, status: 'pending' };
    }

    const created = await Connection.create({ requesterId: fromId, recipientId: toId, note: note || '', status: 'pending' });
    return { message: 'Request sent', connection: created, status: 'pending' };
  }

  // Mock
  let existing = mockStore.connections.find(
    (c) =>
      (String(c.requesterId) === String(fromId) && String(c.recipientId) === String(toId)) ||
      (String(c.requesterId) === String(toId) && String(c.recipientId) === String(fromId))
  );

  if (existing) {
    if (existing.status === 'accepted') throw new Error('Already connected');
    if (String(existing.requesterId) === String(toId) && existing.status === 'pending') {
      existing.status = 'accepted';
      existing.updatedAt = new Date();
      return { message: 'Mutual match! Connected.', connection: existing, status: 'accepted' };
    }
    existing.requesterId = fromId;
    existing.recipientId = toId;
    existing.status = 'pending';
    existing.note = note || '';
    existing.updatedAt = new Date();
    return { message: 'Request sent', connection: existing, status: 'pending' };
  }

  const created = {
    _id: `conn_${Date.now()}`,
    requesterId: fromId,
    recipientId: toId,
    note: note || '',
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  mockStore.connections.push(created);
  return { message: 'Request sent', connection: created, status: 'pending' };
}

async function removeConnection(userA, userB) {
  if (isConnected()) {
    await Connection.findOneAndDelete({
      $or: [
        { requesterId: userA, recipientId: userB },
        { requesterId: userB, recipientId: userA },
      ],
    });
    return true;
  }
  mockStore.connections = mockStore.connections.filter(
    (c) =>
      !(
        (String(c.requesterId) === String(userA) && String(c.recipientId) === String(userB)) ||
        (String(c.requesterId) === String(userB) && String(c.recipientId) === String(userA))
      )
  );
  return true;
}

// Reports & Moderation
async function createReport(reporterId, targetId, category, reason, details) {
  if (isConnected()) {
    return await Report.create({ reporterId, targetId, category, reason, details, status: 'pending' });
  }
  const rep = {
    _id: `rep_${Date.now()}`,
    reporterId,
    targetId,
    category: category || 'other',
    reason,
    details: details || '',
    status: 'pending',
    reviewed: false,
    createdAt: new Date(),
  };
  mockStore.reports.push(rep);
  return rep;
}

async function getAllReports() {
  if (isConnected()) {
    return await Report.find()
      .populate('reporterId', 'name email department picture')
      .populate('targetId', 'name email department picture isSuspended warningCount createdAt')
      .sort({ createdAt: -1 });
  }

  return mockStore.reports.map((r) => {
    const reporter = mockStore.users.find((u) => String(u._id) === String(r.reporterId)) || { name: 'Student' };
    const target = mockStore.users.find((u) => String(u._id) === String(r.targetId)) || { name: 'Reported Student' };
    return {
      ...r,
      reporterId: reporter,
      targetId: target,
    };
  });
}

async function takeAdminReportAction(reportId, action, reviewerId) {
  if (isConnected()) {
    const report = await Report.findById(reportId);
    if (!report) throw new Error('Report not found');
    const targetUser = await User.findById(report.targetId);

    let desc = '';
    if (action === 'suspend') {
      if (targetUser) {
        targetUser.isSuspended = true;
        targetUser.suspensionReason = `Safety Violation: ${report.reason}`;
        await targetUser.save();
      }
      report.status = 'action_taken';
      desc = 'Account suspended due to safety violation';
    } else if (action === 'warn') {
      if (targetUser) {
        targetUser.warningCount = (targetUser.warningCount || 0) + 1;
        await targetUser.save();
      }
      report.status = 'action_taken';
      desc = 'Safety conduct warning issued';
    } else if (action === 'dismiss') {
      report.status = 'dismissed';
      desc = 'Report dismissed';
    }
    report.reviewed = true;
    report.actionTaken = desc;
    report.reviewerId = reviewerId;
    report.resolvedAt = new Date();
    await report.save();
    return report;
  }

  // Mock store
  const report = mockStore.reports.find((r) => String(r._id) === String(reportId));
  if (!report) throw new Error('Report not found');

  const targetUser = mockStore.users.find((u) => String(u._id) === String(report.targetId));
  let desc = '';

  if (action === 'suspend') {
    if (targetUser) {
      targetUser.isSuspended = true;
      targetUser.suspensionReason = `Safety Violation: ${report.reason}`;
    }
    report.status = 'action_taken';
    desc = 'Account suspended';
  } else if (action === 'warn') {
    if (targetUser) {
      targetUser.warningCount = (targetUser.warningCount || 0) + 1;
    }
    report.status = 'action_taken';
    desc = 'Safety warning issued';
  } else if (action === 'dismiss') {
    report.status = 'dismissed';
    desc = 'Report dismissed';
  }

  report.reviewed = true;
  report.actionTaken = desc;
  report.resolvedAt = new Date();
  return report;
}

// Blocks
async function blockUser(blockerId, blockedId) {
  if (isConnected()) {
    await Block.updateOne(
      { blockerId, blockedId },
      { $setOnInsert: { blockerId, blockedId } },
      { upsert: true }
    );
    await Connection.deleteMany({
      $or: [
        { requesterId: blockerId, recipientId: blockedId },
        { requesterId: blockedId, recipientId: blockerId },
      ],
    });
    return true;
  }

  const existing = mockStore.blocks.find(
    (b) => String(b.blockerId) === String(blockerId) && String(b.blockedId) === String(blockedId)
  );
  if (!existing) {
    mockStore.blocks.push({ _id: `block_${Date.now()}`, blockerId, blockedId, createdAt: new Date() });
  }
  // sever connection
  mockStore.connections = mockStore.connections.filter(
    (c) =>
      !(
        (String(c.requesterId) === String(blockerId) && String(c.recipientId) === String(blockedId)) ||
        (String(c.requesterId) === String(blockedId) && String(c.recipientId) === String(blockerId))
      )
  );
  return true;
}

// Active Reports Count for trust score
async function getActiveReportCount(userId) {
  if (isConnected()) {
    return await Report.countDocuments({
      targetId: userId,
      status: { $in: ['pending', 'action_taken'] },
    });
  }
  return mockStore.reports.filter(
    (r) =>
      String(r.targetId) === String(userId) &&
      (r.status === 'pending' || r.status === 'action_taken')
  ).length;
}

// Mutual Connections Count for trust score
async function getMutualConnectionCount(userId) {
  if (isConnected()) {
    return await Connection.countDocuments({
      $or: [
        { requesterId: userId, status: 'accepted' },
        { recipientId: userId, status: 'accepted' },
      ],
    });
  }
  return mockStore.connections.filter(
    (c) =>
      c.status === 'accepted' &&
      (String(c.requesterId) === String(userId) || String(c.recipientId) === String(userId))
  ).length;
}

module.exports = {
  findUserById,
  findUserByEmail,
  findUserByGoogleId,
  createUser,
  updateUser,
  findProfileByUserId,
  updateOrCreateProfile,
  getCampusProfiles,
  getAcceptedMatches,
  isMutualMatch,
  isPendingConnection,
  sendConnectionRequest,
  removeConnection,
  createReport,
  getAllReports,
  takeAdminReportAction,
  blockUser,
  getActiveReportCount,
  getMutualConnectionCount,
};
