require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

// Flexible CORS for local dev and production
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, serverless)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(null, true); // Allow all for hackathon convenience
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/connections', require('./routes/connections'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/safety', require('./routes/safety'));

// System Health & Diagnostics
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    platform: 'Affecio Trust — Trust Before Connection',
    campusDomain: process.env.ALLOWED_EMAIL_DOMAIN || 'kiit.ac.in',
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || 'development',
  });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Campus Server Error',
  });
});

module.exports = app;
