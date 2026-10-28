const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'affecio-trust-dev-jwt-secret-key-2026';

async function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required. Please sign in.' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;

    // Check if account is suspended
    try {
      const user = await User.findById(decoded.id).select('isSuspended suspensionReason role email name');
      if (user && user.isSuspended) {
        return res.status(403).json({
          error: `Your account has been suspended for safety review. Reason: ${user.suspensionReason || 'Violation of campus safety guidelines'}`
        });
      }
      if (user) {
        req.user.role = user.role;
        req.user.name = user.name;
        req.user.email = user.email;
      }
    } catch (dbErr) {
      // Continue with decoded token payload if db query is skipped
    }

    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }
}

module.exports = auth;
