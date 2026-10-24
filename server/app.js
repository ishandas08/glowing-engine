const express = require('express');
const cors = require('cors');
const connectDB = require('./lib/db');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/safety', require('./routes/safety'));

app.get('/api/health', (req, res) => res.json({ ok: true }));

module.exports = app;
