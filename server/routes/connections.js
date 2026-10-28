const express = require('express');
const router = express.Router();
const connectDB = require('../lib/db');
const dataService = require('../lib/dataService');
const auth = require('../middleware/auth');

// GET /api/connections
router.get('/', auth, async (req, res) => {
  try {
    await connectDB();
    const currentUserId = req.user.id;
    const matchIds = await dataService.getAcceptedMatches(currentUserId);

    const matches = await Promise.all(
      matchIds.map(async (uid) => {
        const u = await dataService.findUserById(uid);
        return {
          user: u,
        };
      })
    );

    res.json({ matches, incomingPending: [], outgoingPending: [] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/connections/request
router.post('/request', auth, async (req, res) => {
  try {
    await connectDB();
    const { targetUserId, note } = req.body;
    const currentUserId = req.user.id;

    if (!targetUserId) return res.status(400).json({ error: 'Target user ID is required' });
    if (String(targetUserId) === String(currentUserId)) {
      return res.status(400).json({ error: 'Cannot connect with yourself' });
    }

    const result = await dataService.sendConnectionRequest(currentUserId, targetUserId, note);
    res.status(200).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/connections/:targetUserId
router.delete('/:targetUserId', auth, async (req, res) => {
  try {
    await connectDB();
    await dataService.removeConnection(req.user.id, req.params.targetUserId);
    res.json({ message: 'Connection removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
