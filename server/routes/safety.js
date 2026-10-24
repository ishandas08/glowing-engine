const express = require('express');
const router = express.Router();
const connectDB = require('../lib/db');
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

const CHECKLIST = [
  'Meet in a public place',
  'Tell a friend your plans',
  'Keep your phone charged',
  'Trust your instincts',
];

router.get('/checklist', (req, res) => res.json(CHECKLIST));

router.post('/contact-share', auth, async (req, res) => {
  await connectDB();
  const { value, minutes } = req.body;
  const expiresAt = new Date(Date.now() + (minutes || 60) * 60000);
  await Profile.updateOne({ userId: req.user.id }, { $set: { contactShare: { value, expiresAt } } });
  res.json({ ok: true, expiresAt });
});

router.get('/contact-share/:userId', auth, async (req, res) => {
  await connectDB();
  const profile = await Profile.findOne({ userId: req.params.userId });
  if (!profile || !profile.contactShare || !profile.contactShare.expiresAt) return res.json(null);
  if (new Date(profile.contactShare.expiresAt) < new Date()) return res.json(null);
  res.json(profile.contactShare);
});

module.exports = router;
