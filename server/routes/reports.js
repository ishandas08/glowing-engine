const express = require('express');
const router = express.Router();
const connectDB = require('../lib/db');
const Report = require('../models/Report');
const Block = require('../models/Block');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/', auth, async (req, res) => {
  await connectDB();
  const { targetId, reason } = req.body;
  if (!targetId || !reason) return res.status(400).json({ error: 'Missing fields' });
  const report = await Report.create({ reporterId: req.user.id, targetId, reason });
  res.status(201).json(report);
});

router.get('/', auth, admin, async (req, res) => {
  await connectDB();
  const reports = await Report.find().sort({ createdAt: -1 });
  res.json(reports);
});

router.post('/block', auth, async (req, res) => {
  await connectDB();
  const { targetId } = req.body;
  await Block.updateOne(
    { blockerId: req.user.id, blockedId: targetId },
    { $setOnInsert: { blockerId: req.user.id, blockedId: targetId } },
    { upsert: true }
  );
  res.json({ ok: true });
});

module.exports = router;
