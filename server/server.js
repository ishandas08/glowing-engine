require('dotenv').config();
const app = require('./app');
const connectDB = require('./lib/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectDB();
    console.log('Database connected successfully.');
  } catch (err) {
    console.warn('Database connection warning: Running in resilient mode. Ensure MongoDB is active if using live database.');
  }

  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  AFFECIO TRUST — Campus Safety & Authenticity API`);
    console.log(`  Server listening on: http://localhost:${PORT}`);
    console.log(`  Allowed Domain: @${process.env.ALLOWED_EMAIL_DOMAIN || 'kiit.ac.in'}`);
    console.log(`  Health Check:   http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

startServer();
