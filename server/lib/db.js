const mongoose = require('mongoose');

let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null, isMock: false };

async function connectDB() {
  if (cached.conn) return cached.conn;

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/affecio-trust';

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 2000,
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log('Connected to MongoDB successfully');
      cached.isMock = false;
      return m;
    }).catch((err) => {
      console.warn(`[Affecio Resilient Mode] MongoDB not available (${err.message}).`);
      console.warn('-> Switched to built-in in-memory store for instant demonstration & local testing.');
      cached.isMock = true;
      cached.promise = null;
      return null;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.isMock = true;
    cached.promise = null;
  }

  return cached.conn;
}

connectDB.isMock = () => {
  return !mongoose.connection || mongoose.connection.readyState !== 1;
};

module.exports = connectDB;
