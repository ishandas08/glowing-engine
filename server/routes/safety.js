const express = require('express');
const router = express.Router();
const connectDB = require('../lib/db');
const dataService = require('../lib/dataService');
const auth = require('../middleware/auth');

const SAFETY_CHECKLIST = [
  {
    id: 'public_spot',
    title: 'Meet in an Approved Public Campus Space',
    description: 'Always select a high-visibility, well-lit location with regular foot traffic and staff (e.g. Student Activity Center or Library Cafe).',
    category: 'location',
  },
  {
    id: 'buddy_alert',
    title: 'Inform a Trusted Roommate or Friend',
    description: 'Share where you are meeting, who you are meeting with, and agree on a check-in text 30 minutes in.',
    category: 'communication',
  },
  {
    id: 'phone_battery',
    title: 'Check Phone Charge & Campus SOS Numbers',
    description: 'Ensure phone has at least 50% charge and campus security emergency helpline is on speed dial.',
    category: 'prep',
  },
  {
    id: 'own_transport',
    title: 'Arrange Your Own Independent Transportation',
    description: 'Do not rely on the other person for your ride to or from the meetup so you can leave whenever you wish.',
    category: 'mobility',
  },
  {
    id: 'no_pressure',
    title: 'Maintain Boundaries & Comfort',
    description: 'Never feel pressured to share sensitive personal details or continue a conversation that makes you uncomfortable.',
    category: 'boundaries',
  },
  {
    id: 'trust_signals',
    title: 'Review Verified Trust Signals First',
    description: 'Confirm the student has a valid institutional badge and no community misconduct flags before meeting.',
    category: 'verification',
  },
];

const CAMPUS_SAFE_ZONES = [
  {
    id: 'library_cafe',
    name: 'Central Library Cafe & Reading Lounge',
    type: 'Cafe / Academic',
    hours: '8:00 AM – 11:00 PM',
    safetyFeatures: ['Active CCTV Coverage', 'Campus Guard at Entrance', 'High Footfall', 'WiFi Access'],
    tip: 'Ideal for quiet conversation, study dates, and project collabs.',
  },
  {
    id: 'sac_hub',
    name: 'Student Activity Center (SAC) Food Court',
    type: 'Food Court & Social Hub',
    hours: '9:00 AM – 10:30 PM',
    safetyFeatures: ['Well-lit Seating Area', 'Multiple Food Outlets', 'Open Space', 'Peer Presence'],
    tip: 'Perfect for lively casual coffee or quick snack meetups.',
  },
  {
    id: 'sports_complex',
    name: 'Campus Sports Complex & Juice Bar',
    type: 'Recreation & Sports',
    hours: '6:00 AM – 9:00 PM',
    safetyFeatures: ['Security Staff', 'Open Grounds', 'First Aid Station'],
    tip: 'Great for badminton, running buddies, or active outdoor hangouts.',
  },
  {
    id: 'central_quad',
    name: 'Central Quadrangle & Open Amphitheater',
    type: 'Open Lawn & Promenade',
    hours: '7:00 AM – 8:30 PM',
    safetyFeatures: ['Central Campus Lighting', 'Campus Security Patrols', 'Open Visibility'],
    tip: 'Spacious outdoor environment during daytime and sunset hours.',
  },
];

const EMERGENCY_CONTACTS = [
  { name: 'Campus Security Control Room', phone: '+91 674 2725113', available: '24/7' },
  { name: 'Women Student Safety Helpline', phone: '+91 674 2740326', available: '24/7' },
  { name: 'Campus Health Center & Ambulance', phone: '+91 674 2725400', available: '24/7' },
  { name: 'National Emergency SOS', phone: '112', available: '24/7' },
];

// GET /api/safety/checklist
router.get('/checklist', (req, res) => {
  res.json({
    checklist: SAFETY_CHECKLIST,
    safeZones: CAMPUS_SAFE_ZONES,
    emergencyContacts: EMERGENCY_CONTACTS,
  });
});

// POST /api/safety/contact-share - Create or update expiring contact share
router.post('/contact-share', auth, async (req, res) => {
  try {
    await connectDB();
    const { platform, value, minutes } = req.body;

    if (!value || !value.trim()) {
      return res.status(400).json({ error: 'Contact detail cannot be empty' });
    }

    const duration = parseInt(minutes, 10) || 60;
    const maxDuration = 1440;
    const actualMinutes = Math.min(Math.max(5, duration), maxDuration);

    const expiresAt = new Date(Date.now() + actualMinutes * 60000);

    const contactShare = {
      platform: platform || 'whatsapp',
      value: value.trim(),
      expiresAt,
      createdAt: new Date(),
    };

    await dataService.updateOrCreateProfile(req.user.id, { contactShare });

    res.json({
      ok: true,
      message: `Expiring contact created. Self-destructs in ${actualMinutes} minutes.`,
      contactShare: {
        platform: contactShare.platform,
        expiresAt: contactShare.expiresAt,
        remainingSeconds: Math.floor((expiresAt.getTime() - Date.now()) / 1000),
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/safety/contact-share - Revoke active contact share immediately
router.delete('/contact-share', auth, async (req, res) => {
  try {
    await connectDB();
    await dataService.updateOrCreateProfile(req.user.id, { contactShare: null });
    res.json({ ok: true, message: 'Expiring contact share revoked immediately.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/safety/contact-share/:userId - Access contact share if active and not expired
router.get('/contact-share/:userId', auth, async (req, res) => {
  try {
    await connectDB();
    const targetUserId = req.params.userId;
    const profile = await dataService.findProfileByUserId(targetUserId);

    if (!profile || !profile.contactShare || !profile.contactShare.expiresAt) {
      return res.json({ active: false, message: 'No active contact share available.' });
    }

    const now = new Date();
    const expiresAt = new Date(profile.contactShare.expiresAt);

    if (expiresAt <= now) {
      return res.json({
        active: false,
        expired: true,
        message: 'This contact share has expired for safety reasons.',
      });
    }

    const remainingSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));

    res.json({
      active: true,
      platform: profile.contactShare.platform,
      value: profile.contactShare.value,
      expiresAt: profile.contactShare.expiresAt,
      remainingSeconds,
      warning: 'This contact was shared temporarily. Please treat it with confidentiality and respect.',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
