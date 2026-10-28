const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const connectDB = require('../lib/db');
const dataService = require('../lib/dataService');
const auth = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'affecio-trust-dev-jwt-secret-key-2026';
const ALLOWED_DOMAIN = (process.env.ALLOWED_EMAIL_DOMAIN || 'kiit.ac.in').toLowerCase().trim();
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const client = googleClientId ? new OAuth2Client(googleClientId) : null;

// Google OAuth ID token verification
router.post('/google', async (req, res) => {
  const { credential, email: mockEmail, name: mockName } = req.body;

  try {
    let email = '';
    let name = '';
    let picture = '';
    let googleSub = '';

    if (credential && client) {
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: googleClientId,
      });
      const payload = ticket.getPayload();
      email = (payload.email || '').toLowerCase().trim();
      name = payload.name || email.split('@')[0];
      picture = payload.picture || '';
      googleSub = payload.sub;
    } else if (mockEmail) {
      // Local development or simulated Google One-Tap
      email = mockEmail.toLowerCase().trim();
      name = mockName || email.split('@')[0];
      picture = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80';
      googleSub = `google-sim-${email.replace(/[^a-zA-Z0-9]/g, '-')}`;
    } else {
      return res.status(400).json({ error: 'Missing Google authentication credential' });
    }

    if (!email || !email.endsWith('@' + ALLOWED_DOMAIN)) {
      return res.status(403).json({
        error: `Restricted Access: Only verified institutional emails from @${ALLOWED_DOMAIN} are allowed. (${email} was rejected)`,
      });
    }

    await connectDB();
    let user = await dataService.findUserByGoogleId(googleSub);
    if (!user) {
      user = await dataService.findUserByEmail(email);
      if (user) {
        user = await dataService.updateUser(user._id, { googleId: googleSub });
      } else {
        user = await dataService.createUser({
          googleId: googleSub,
          email,
          name,
          picture,
          role: email.startsWith('safety.') || email.startsWith('admin.') ? 'admin' : 'user',
        });

        await dataService.updateOrCreateProfile(user._id, {
          name: user.name,
          avatar: user.picture,
          bio: 'Hey, I am a verified student here on campus!',
        });
      }
    }

    if (user.isSuspended) {
      return res.status(403).json({
        error: `Account suspended. Reason: ${user.suspensionReason || 'Safety misconduct report'}`,
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        role: user.role,
      },
    });
  } catch (e) {
    console.error('Google auth error:', e.message);
    res.status(401).json({ error: 'Google authentication error: ' + e.message });
  }
});

// Campus Login & Demo Endpoint
router.post('/demo-login', async (req, res) => {
  const { accountType, email: rawEmail, name: rawName, department: rawDept } = req.body;
  await connectDB();

  const presets = {
    student_ananya: {
      googleId: 'demo-google-ananya-001',
      email: `ananya.sharma@${ALLOWED_DOMAIN}`,
      name: 'Ananya Sharma',
      role: 'user',
      department: 'Computer Science & Engineering',
      year: '3rd Year (B.Tech)',
      bio: 'Tech enthusiast, classical dancer, and campus safety ambassador. Always verify before connecting!',
      interests: ['AI & Privacy', 'Cybersecurity', 'Badminton', 'Dance', 'Coffee Meets'],
      photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    },
    student_rohan: {
      googleId: 'demo-google-rohan-002',
      email: `rohan.verma@${ALLOWED_DOMAIN}`,
      name: 'Rohan Verma',
      role: 'user',
      department: 'Information Technology',
      year: '2nd Year (B.Tech)',
      bio: 'Campus robotics club lead. Looking to collaborate on hackathons and chill at the central library.',
      interests: ['Robotics', 'Music Production', 'Hackathons', 'Anime'],
      photos: ['https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80'],
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
    },
    admin_safety: {
      googleId: 'demo-google-admin-003',
      email: `campus.safety@${ALLOWED_DOMAIN}`,
      name: 'Dr. Sarah Mukherjee (Campus Safety Officer)',
      role: 'admin',
      department: 'Dean of Student Welfare & Campus Safety',
      year: 'Faculty & Safety Board',
      bio: 'Official Campus Safety and Verification Officer for Affecio Trust network.',
      interests: ['Campus Safety', 'Digital Ethics', 'Student Welfare'],
      photos: ['https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80'],
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
    },
  };

  let choice;

  if (rawEmail) {
    const email = rawEmail.toLowerCase().trim();
    if (!email.endsWith('@' + ALLOWED_DOMAIN)) {
      return res.status(403).json({
        error: `Restricted Access: Only verified institutional emails from @${ALLOWED_DOMAIN} are allowed. (${email} was rejected)`,
      });
    }
    const name = rawName && rawName.trim() ? rawName.trim() : email.split('@')[0];
    const role = email.startsWith('safety.') || email.startsWith('admin.') ? 'admin' : 'user';
    choice = {
      googleId: `google-verified-${email.replace(/[^a-zA-Z0-9]/g, '-')}`,
      email,
      name,
      role,
      department: rawDept || 'School of Engineering',
      year: '3rd Year (B.Tech)',
      bio: 'Verified student on the Affecio Trust campus network.',
      interests: ['Campus Discovery', 'AI & Privacy', 'Peer Safety'],
      photos: ['https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    };
  } else {
    choice = presets[accountType] || presets.student_ananya;
  }

  let user = await dataService.findUserByEmail(choice.email);
  if (!user) {
    user = await dataService.createUser({
      googleId: choice.googleId,
      email: choice.email,
      name: choice.name,
      picture: choice.avatar,
      role: choice.role,
      department: choice.department,
    });
  } else {
    user = await dataService.updateUser(user._id, { role: choice.role, department: choice.department });
  }

  let profile = await dataService.findProfileByUserId(user._id);
  if (!profile) {
    profile = await dataService.updateOrCreateProfile(user._id, {
      name: choice.name,
      bio: choice.bio,
      interests: choice.interests,
      year: choice.year,
      department: choice.department,
      photos: choice.photos,
      avatar: choice.avatar,
      safetyPledgeAgreed: true,
      socialLinks: {
        instagram: choice.role === 'admin' ? '' : `@${choice.name.toLowerCase().replace(/\s+/g, '_')}`,
        phone: choice.role === 'admin' ? '+91 674 2725113 (Campus SOS)' : '+91 98765 43210',
      },
    });
  }

  const token = jwt.sign(
    { id: user._id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      picture: user.picture || choice.avatar,
      role: user.role,
    },
  });
});

// Current user profile & auth check
router.get('/me', auth, async (req, res) => {
  try {
    await connectDB();
    const user = await dataService.findUserById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const profile = await dataService.findProfileByUserId(req.user.id);
    res.json({ user, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Sign safety pledge
router.post('/safety-pledge', auth, async (req, res) => {
  try {
    await connectDB();
    const profile = await dataService.updateOrCreateProfile(req.user.id, { safetyPledgeAgreed: true });
    res.json({ success: true, profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
