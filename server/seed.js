require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./lib/db');
const User = require('./models/User');
const Profile = require('./models/Profile');
const Connection = require('./models/Connection');
const Report = require('./models/Report');
const Block = require('./models/Block');

const DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'kiit.ac.in';

async function seed() {
  console.log('Connecting to database for seeding...');
  await connectDB();

  console.log('Cleaning up existing test data...');
  await Promise.all([
    User.deleteMany({}),
    Profile.deleteMany({}),
    Connection.deleteMany({}),
    Report.deleteMany({}),
    Block.deleteMany({}),
  ]);

  console.log('Creating users...');

  // 1. Admin
  const adminUser = await User.create({
    googleId: 'admin_safety_001',
    email: `safety.officer@${DOMAIN}`,
    name: 'Dr. Sarah Mukherjee',
    picture: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
    role: 'admin',
    department: 'Campus Safety & Student Welfare',
  });

  await Profile.create({
    userId: adminUser._id,
    name: adminUser.name,
    avatar: adminUser.picture,
    bio: 'Official Campus Safety and Verification Officer for the Affecio Trust network.',
    year: 'Faculty & Safety Council',
    department: 'Student Affairs',
    safetyPledgeAgreed: true,
  });

  // 2. Student: Ananya Sharma (High Trust Score, CS student)
  const ananya = await User.create({
    googleId: 'student_ananya_001',
    email: `ananya.sharma@${DOMAIN}`,
    name: 'Ananya Sharma',
    picture: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    role: 'user',
    department: 'Computer Science & Engineering',
    createdAt: new Date(Date.now() - 30 * 86400000), // 30 days tenure
  });

  await Profile.create({
    userId: ananya._id,
    name: ananya.name,
    avatar: ananya.picture,
    bio: 'Tech enthusiast, classical dancer, and campus safety ambassador. Love hackathons and quiet evenings at the library cafe!',
    interests: ['AI & Privacy', 'Cybersecurity', 'Badminton', 'Dance', 'Coffee Meets'],
    year: '3rd Year (B.Tech)',
    department: 'Computer Science & Engineering',
    photos: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    ],
    socialLinks: {
      instagram: '@ananya_tech',
      phone: '+91 98765 12340',
    },
    visibility: {
      name: 'everyone',
      bio: 'everyone',
      interests: 'everyone',
      year: 'everyone',
      department: 'everyone',
      photos: 'everyone',
      socialLinks: 'matches', // Unlocked only for matches
    },
    safetyPledgeAgreed: true,
    contactShare: {
      platform: 'whatsapp',
      value: '+91 98765 12340',
      expiresAt: new Date(Date.now() + 45 * 60000), // Active for next 45 mins
    },
  });

  // 3. Student: Rohan Verma (IT student)
  const rohan = await User.create({
    googleId: 'student_rohan_002',
    email: `rohan.verma@${DOMAIN}`,
    name: 'Rohan Verma',
    picture: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
    role: 'user',
    department: 'Information Technology',
    createdAt: new Date(Date.now() - 15 * 86400000), // 15 days tenure
  });

  await Profile.create({
    userId: rohan._id,
    name: rohan.name,
    avatar: rohan.picture,
    bio: 'Robotics club coordinator. Looking for teammates for upcoming tech fests. Always prefer meeting at the SAC Hub.',
    interests: ['Robotics', 'IoT', 'Music Production', 'Indie Games'],
    year: '2nd Year (B.Tech)',
    department: 'Information Technology',
    photos: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80',
    ],
    socialLinks: {
      instagram: '@rohan_builds',
      linkedin: 'linkedin.com/in/rohanverma',
    },
    visibility: {
      name: 'everyone',
      bio: 'everyone',
      interests: 'everyone',
      year: 'everyone',
      department: 'everyone',
      photos: 'everyone',
      socialLinks: 'matches',
    },
    safetyPledgeAgreed: true,
  });

  // 4. Student: Meera Patel (Biotechnology)
  const meera = await User.create({
    googleId: 'student_meera_003',
    email: `meera.patel@${DOMAIN}`,
    name: 'Meera Patel',
    picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
    role: 'user',
    department: 'School of Biotechnology',
    createdAt: new Date(Date.now() - 40 * 86400000),
  });

  await Profile.create({
    userId: meera._id,
    name: meera.name,
    avatar: meera.picture,
    bio: 'Passionate about genetics and green campus initiatives. Avid reader and coffee enthusiast.',
    interests: ['Biotech', 'Sustainability', 'Debate Society', 'Tennis'],
    year: '4th Year (B.Tech)',
    department: 'Biotechnology',
    photos: [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500&auto=format&fit=crop&q=80',
    ],
    visibility: {
      name: 'everyone',
      bio: 'everyone',
      interests: 'everyone',
      year: 'everyone',
      department: 'everyone',
      photos: 'matches', // Photos visible only to mutual matches!
      socialLinks: 'matches',
    },
    safetyPledgeAgreed: true,
  });

  // 5. Student: Aarav Sen (Electronics)
  const aarav = await User.create({
    googleId: 'student_aarav_004',
    email: `aarav.sen@${DOMAIN}`,
    name: 'Aarav Sen',
    picture: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    role: 'user',
    department: 'Electronics & Telecommunication',
    createdAt: new Date(Date.now() - 5 * 86400000),
  });

  await Profile.create({
    userId: aarav._id,
    name: aarav.name,
    avatar: aarav.picture,
    bio: 'Circuit designer by day, guitarist by night. Up for jam sessions at the open quad lawns.',
    interests: ['Guitar', 'VLSI Design', 'Cycling', 'Astronomy'],
    year: '1st Year (B.Tech)',
    department: 'Electronics & Telecommunication',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80',
    ],
    safetyPledgeAgreed: false,
  });

  // 6. Suspicious profile with report
  const suspicious = await User.create({
    googleId: 'student_suspicious_005',
    email: `fake.user@${DOMAIN}`,
    name: 'Unverified Test Account',
    picture: '',
    role: 'user',
    warningCount: 1,
    createdAt: new Date(Date.now() - 1 * 86400000),
  });

  await Profile.create({
    userId: suspicious._id,
    name: suspicious.name,
    bio: 'DM me directly for off-campus party details.',
    interests: ['Parties'],
    year: '1st Year',
    department: 'General',
    photos: [],
    safetyPledgeAgreed: false,
  });

  // Mutual match between Ananya and Rohan
  await Connection.create({
    requesterId: ananya._id,
    recipientId: rohan._id,
    status: 'accepted',
    note: 'Hey Rohan, would love to collaborate on the campus safety hackathon!',
  });

  // Report against suspicious account
  await Report.create({
    reporterId: ananya._id,
    targetId: suspicious._id,
    category: 'spam',
    reason: 'Unsolicited promotional messages promoting unverified external links.',
    details: 'Received repeated messages asking to connect outside campus channels without verification.',
    status: 'pending',
  });

  console.log('Seeding completed successfully!');
  console.log(`Created: 1 Admin, 4 Students, 1 Reported Account, 1 Match, 1 Safety Report.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
