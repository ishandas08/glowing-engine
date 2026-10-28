const express = require('express');
const router = express.Router();
const connectDB = require('../lib/db');
const dataService = require('../lib/dataService');
const auth = require('../middleware/auth');
const { calculateTrust } = require('../lib/trust');

function applyPrivacyFilter(profileDoc, viewerId, isMatch) {
  const isOwner = String(profileDoc.userId?._id || profileDoc.userId) === String(viewerId);
  if (isOwner) {
    return profileDoc;
  }

  const p = profileDoc.toObject ? profileDoc.toObject() : { ...profileDoc };
  const vis = p.visibility || {};

  const check = (fieldName, defaultVal = '') => {
    const setting = vis[fieldName] || 'everyone';
    if (setting === 'hidden') {
      return null;
    }
    if (setting === 'matches' && !isMatch) {
      return '[Locked — Connect to view]';
    }
    return p[fieldName] !== undefined ? p[fieldName] : defaultVal;
  };

  return {
    ...p,
    name: check('name', 'Anonymous Student'),
    bio: check('bio', ''),
    interests: vis.interests === 'hidden' ? [] : (vis.interests === 'matches' && !isMatch ? ['[Connect to view interests]'] : p.interests || []),
    year: check('year', ''),
    department: check('department', ''),
    photos: vis.photos === 'hidden' ? [] : (vis.photos === 'matches' && !isMatch ? [] : p.photos || []),
    avatar: p.avatar || (p.photos && p.photos[0]) || '',
    socialLinks: isOwner || (isMatch && vis.socialLinks !== 'hidden') ? p.socialLinks : null,
    contactShare: undefined,
  };
}

// GET /api/profiles - Browse campus profiles with privacy & trust signals
router.get('/', auth, async (req, res) => {
  try {
    await connectDB();
    const currentUserId = req.user.id;

    const acceptedMatchIds = new Set(await dataService.getAcceptedMatches(currentUserId));
    const profiles = await dataService.getCampusProfiles(currentUserId);

    const enriched = await Promise.all(
      profiles.map(async (prof) => {
        const targetUserId = prof.userId ? (prof.userId._id || prof.userId) : prof.userId;
        const isMatch = acceptedMatchIds.has(String(targetUserId));
        const isPending = await dataService.isPendingConnection(currentUserId, targetUserId);

        const trustData = await calculateTrust(targetUserId);
        const filtered = applyPrivacyFilter(prof, currentUserId, isMatch);

        return {
          ...filtered,
          isMatch,
          connectionStatus: isMatch ? 'connected' : (isPending ? 'pending' : 'none'),
          trustScore: trustData.score,
          trustLevel: trustData.level,
          trustBadgeColor: trustData.badgeColor,
          verifiedBadges: trustData.verifiedBadges,
          trustBreakdown: trustData.breakdown,
          studentEmail: prof.userId ? prof.userId.email : '',
          isVerifiedStudent: true,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error('Error fetching profiles:', err);
    res.status(500).json({ error: 'Failed to fetch profiles: ' + err.message });
  }
});

// GET /api/profiles/me - Current user's own profile
router.get('/me', auth, async (req, res) => {
  try {
    await connectDB();
    let profile = await dataService.findProfileByUserId(req.user.id);
    const user = await dataService.findUserById(req.user.id);

    if (!profile) {
      profile = await dataService.updateOrCreateProfile(req.user.id, {
        name: user ? user.name : '',
        avatar: user ? user.picture : '',
      });
    }

    const trustData = await calculateTrust(req.user.id);

    res.json({
      ...(profile.toObject ? profile.toObject() : profile),
      user: user ? {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        department: user.department,
        createdAt: user.createdAt,
      } : null,
      trustScore: trustData.score,
      trustLevel: trustData.level,
      trustBadgeColor: trustData.badgeColor,
      verifiedBadges: trustData.verifiedBadges,
      trustBreakdown: trustData.breakdown,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/profiles/me - Update profile & privacy controls
router.put('/me', auth, async (req, res) => {
  try {
    await connectDB();
    const { name, bio, interests, year, department, photos, avatar, socialLinks, visibility } = req.body;

    const update = {
      updatedAt: new Date(),
    };

    if (name !== undefined) update.name = name.trim();
    if (bio !== undefined) update.bio = bio.trim();
    if (interests !== undefined) update.interests = Array.isArray(interests) ? interests : [];
    if (year !== undefined) update.year = year;
    if (department !== undefined) update.department = department;
    if (photos !== undefined) update.photos = Array.isArray(photos) ? photos : [];
    if (avatar !== undefined) update.avatar = avatar;
    if (socialLinks !== undefined) update.socialLinks = socialLinks;
    if (visibility !== undefined) update.visibility = visibility;

    const profile = await dataService.updateOrCreateProfile(req.user.id, update);

    if (name || department) {
      await dataService.updateUser(req.user.id, {
        ...(name && { name }),
        ...(department && { department }),
        ...(avatar && { picture: avatar }),
      });
    }

    const trustData = await calculateTrust(req.user.id);

    res.json({
      ...(profile.toObject ? profile.toObject() : profile),
      trustScore: trustData.score,
      trustLevel: trustData.level,
      trustBreakdown: trustData.breakdown,
      verifiedBadges: trustData.verifiedBadges,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/profiles/:userId - View another student's profile
router.get('/:userId', auth, async (req, res) => {
  try {
    await connectDB();
    const targetUserId = req.params.userId;
    const currentUserId = req.user.id;

    const targetUser = await dataService.findUserById(targetUserId);
    if (!targetUser || targetUser.isSuspended) {
      return res.status(404).json({ error: 'Student profile not found or inactive' });
    }

    let profile = await dataService.findProfileByUserId(targetUserId);
    if (!profile) {
      profile = { userId: targetUserId, name: targetUser.name, bio: '' };
    }

    const isMatch = await dataService.isMutualMatch(currentUserId, targetUserId);
    const isPending = await dataService.isPendingConnection(currentUserId, targetUserId);

    const trustData = await calculateTrust(targetUserId);
    const filtered = applyPrivacyFilter(profile, currentUserId, isMatch);

    res.json({
      ...filtered,
      isMatch,
      connectionStatus: isMatch ? 'connected' : (isPending ? 'pending' : 'none'),
      trustScore: trustData.score,
      trustLevel: trustData.level,
      trustBadgeColor: trustData.badgeColor,
      verifiedBadges: trustData.verifiedBadges,
      trustBreakdown: trustData.breakdown,
      studentEmail: targetUser.email,
      isVerifiedStudent: true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
