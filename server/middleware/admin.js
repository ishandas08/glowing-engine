function admin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Campus Safety Administrator credentials required.' });
  }
  next();
}

module.exports = admin;
