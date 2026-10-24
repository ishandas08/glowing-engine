const express = require('express');
const router = express.Router();
const connectDB = require('../lib/db');
const Profile = require('../models/Profile');
const auth = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
  await connectDB();
  const profile = await Profile.findOne({ userId: req.user.id });
  res.json(profile || null);
});

router.put('/me', auth, async (req, res) => {
  await connectDB();
  const { name, bio, interests, year, photos, visibility } = req.body;
  const update = { name, bio, interests, year, photos };
  if (visibility) update.visibility = visibility;
  const profile = await Profile.findOneAndUpdate(
    { userId: req.user.id },
    { $set: update, $setOnInsert: { userId: req.user.id } },
    { upsert: true, new: true }
  );
  res.json(profile);
});

router.get('/:userId', auth, async (req, res) => {
  await connectDB();
  const profile = await Profile.findOne({ userId: req.params.userId });
  if (!profile) return res.status(404).json({ error: 'Not found' });
  res.json(profile);
});

module.exports = router;
