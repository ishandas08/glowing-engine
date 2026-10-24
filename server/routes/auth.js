const express = require('express');
const router = express.Router();
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const connectDB = require('../lib/db');
const User = require('../models/User');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'Missing credential' });
  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const domain = (process.env.ALLOWED_EMAIL_DOMAIN || '').toLowerCase();
    if (!email || !email.toLowerCase().endsWith('@' + domain)) {
      return res.status(403).json({ error: 'Email domain not allowed' });
    }
    await connectDB();
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        email,
        name: payload.name,
        picture: payload.picture,
      });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email, role: 'user' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.json({ token, user });
  } catch (e) {
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

module.exports = router;
