const express = require('express');
const router = express.Router();
const connectDB = require('../lib/db');
const dataService = require('../lib/dataService');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { calculateTrust } = require('../lib/trust');

// POST /api/reports - Submit a safety or authenticity report
router.post('/', auth, async (req, res) => {
  try {
    await connectDB();
    const { targetId, reason, category, details } = req.body;
    if (!targetId || !reason) {
      return res.status(400).json({ error: 'Target student ID and reason are required' });
    }

    if (String(targetId) === String(req.user.id)) {
      return res.status(400).json({ error: 'You cannot report your own account' });
    }

    const report = await dataService.createReport(
      req.user.id,
      targetId,
      category,
      reason,
      details
    );

    res.status(201).json({
      message: 'Report submitted successfully. Our campus safety team has been notified.',
      report,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports - Admin portal list of all reports with trust metrics
router.get('/', auth, admin, async (req, res) => {
  try {
    await connectDB();
    const reports = await dataService.getAllReports();

    const enriched = await Promise.all(
      reports.map(async (r) => {
        let targetTrust = null;
        const targetUserId = r.targetId?._id || r.targetId;
        if (targetUserId) {
          targetTrust = await calculateTrust(targetUserId);
        }
        return {
          ...(r.toObject ? r.toObject() : r),
          targetTrust,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/reports/:id - Admin moderation action
router.patch('/:id', auth, admin, async (req, res) => {
  try {
    await connectDB();
    const { action } = req.body; // action: 'dismiss' | 'warn' | 'suspend'
    const reportId = req.params.id;

    const report = await dataService.takeAdminReportAction(reportId, action, req.user.id);
    res.json({ message: 'Moderation action applied successfully', report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reports/block - Block a user and sever connections
router.post('/block', auth, async (req, res) => {
  try {
    await connectDB();
    const { targetId } = req.body;
    if (!targetId) return res.status(400).json({ error: 'targetId is required' });

    await dataService.blockUser(req.user.id, targetId);
    res.json({ ok: true, message: 'User blocked. All connections severed and profile hidden.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
