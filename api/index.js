const app = require('../server/app');
const connectDB = require('../server/lib/db');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Vercel serverless DB connect error:', err.message);
  }
  return app(req, res);
};
