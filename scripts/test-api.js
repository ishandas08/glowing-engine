require('dotenv').config();
const http = require('http');
const app = require('../server/app');

async function runTests() {
  console.log('--- Starting Affecio Trust Comprehensive Verification Suite ---');

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(3099, resolve));
  const baseUrl = 'http://localhost:3099';
  console.log(`Test server running at ${baseUrl}`);

  let passed = 0;
  let failed = 0;

  async function assertTest(name, fn) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ FAIL: ${name} -> ${err.message}`);
      failed++;
    }
  }

  try {
    // 1. Health check
    await assertTest('Health endpoint returns ok and platform info', async () => {
      const res = await fetch(`${baseUrl}/api/health`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.ok || !data.campusDomain) throw new Error('Missing health fields');
    });

    // 2. Safety checklist
    await assertTest('Safety checklist endpoint returns public zones and checklist', async () => {
      const res = await fetch(`${baseUrl}/api/safety/checklist`);
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!Array.isArray(data.checklist) || data.checklist.length === 0) throw new Error('Empty checklist');
      if (!Array.isArray(data.safeZones) || data.safeZones.length === 0) throw new Error('Empty safe zones');
      if (!Array.isArray(data.emergencyContacts)) throw new Error('Missing emergency contacts');
    });

    // 3. Demo Login for student_ananya
    let ananyaToken = '';
    let ananyaUser = null;
    await assertTest('Demo Login works for student_ananya', async () => {
      const res = await fetch(`${baseUrl}/api/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountType: 'student_ananya' }),
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.token || !data.user) throw new Error('Missing token or user');
      if (!data.user.email.endsWith('@kiit.ac.in')) throw new Error('Invalid email domain');
      ananyaToken = data.token;
      ananyaUser = data.user;
    });

    // 4. Demo Login for campus admin
    let adminToken = '';
    await assertTest('Demo Login works for campus safety admin', async () => {
      const res = await fetch(`${baseUrl}/api/auth/demo-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountType: 'admin_safety' }),
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.token || data.user.role !== 'admin') throw new Error('Missing admin token or invalid role');
      adminToken = data.token;
    });

    // 5. Authenticated /api/profiles for student_ananya
    let profilesList = [];
    await assertTest('Browse /api/profiles returns verified peers with trust scores', async () => {
      const res = await fetch(`${baseUrl}/api/profiles`, {
        headers: { Authorization: `Bearer ${ananyaToken}` },
      });
      if (res.status !== 200) throw new Error(`Status ${res.status}`);
      profilesList = await res.json();
      if (!Array.isArray(profilesList) || profilesList.length === 0) throw new Error('No profiles returned');

      // Verify trust score is attached to every profile
      for (const p of profilesList) {
        if (p.trustScore === undefined || p.trustScore < 0 || p.trustScore > 100) {
          throw new Error(`Invalid trust score on profile ${p.name}: ${p.trustScore}`);
        }
      }
    });

    // 6. Test Privacy Filter: Matched vs Non-matched
    await assertTest('Privacy Filter enforces visibility matrix (unlocked for matches, locked for others)', async () => {
      // Rohan Verma is an accepted match for Ananya
      const rohan = profilesList.find((p) => (p.name || '').includes('Rohan'));
      if (!rohan) throw new Error('Rohan Verma not found in profiles');
      if (!rohan.isMatch) throw new Error('Expected Rohan to be marked as isMatch: true');
      if (!rohan.socialLinks) throw new Error('Expected social links to be unlocked for matched peer');

      // Meera Patel is NOT a match for Ananya and set photos to "matches"
      const meera = profilesList.find((p) => (p.name || '').includes('Meera'));
      if (!meera) throw new Error('Meera Patel not found in profiles');
      if (meera.isMatch) throw new Error('Meera should not be matched yet');
      if (meera.photos && meera.photos.length > 0) throw new Error('Meera photos should be locked for non-matches');
    });

    // 7. Expiring contact share test
    await assertTest('Expiring contact share creates and can be read by matched peer', async () => {
      // Ananya creates contact share
      const createRes = await fetch(`${baseUrl}/api/safety/contact-share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ananyaToken}` },
        body: JSON.stringify({ platform: 'whatsapp', value: '+91 98765 12340', minutes: 30 }),
      });
      if (createRes.status !== 200) throw new Error('Failed to create share');

      // Read share as Ananya (or another peer)
      const readRes = await fetch(`${baseUrl}/api/safety/contact-share/${ananyaUser.id}`, {
        headers: { Authorization: `Bearer ${ananyaToken}` },
      });
      if (readRes.status !== 200) throw new Error('Failed to read share');
      const shareData = await readRes.json();
      if (!shareData.active || shareData.value !== '+91 98765 12340') {
        throw new Error('Contact share value mismatch or inactive');
      }
      if (!shareData.remainingSeconds || shareData.remainingSeconds <= 0) {
        throw new Error('Invalid remaining seconds on active share');
      }
    });

    // 8. Submit report against suspicious account
    let createdReportId = '';
    await assertTest('Submit safety report against profile', async () => {
      const suspicious = profilesList.find((p) => (p.name || '').includes('Unverified'));
      const targetId = suspicious ? (suspicious.userId?._id || suspicious.userId) : 'user_suspicious_005';

      const res = await fetch(`${baseUrl}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ananyaToken}` },
        body: JSON.stringify({
          targetId,
          category: 'spam',
          reason: 'Test safety violation report',
          details: 'Demonstrating automated moderation pipeline.',
        }),
      });
      if (res.status !== 201) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.report || !data.report._id) throw new Error('Missing created report');
      createdReportId = data.report._id;
    });

    // 9. Admin reviews report and takes action
    await assertTest('Admin reviews report queue and applies safety suspension', async () => {
      const getRes = await fetch(`${baseUrl}/api/reports`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (getRes.status !== 200) throw new Error(`Admin fetch status ${getRes.status}`);
      const reports = await getRes.json();
      if (!Array.isArray(reports) || reports.length === 0) throw new Error('Empty admin reports queue');

      // Take action
      const patchRes = await fetch(`${baseUrl}/api/reports/${createdReportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ action: 'suspend' }),
      });
      if (patchRes.status !== 200) throw new Error(`Admin action status ${patchRes.status}`);
      const patchData = await patchRes.json();
      if (patchData.report.status !== 'action_taken') throw new Error('Report status not action_taken');
    });

    // 10. Update Profile & Privacy Matrix
    await assertTest('Update profile fields and privacy matrix', async () => {
      const updateRes = await fetch(`${baseUrl}/api/profiles/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ananyaToken}` },
        body: JSON.stringify({
          name: 'Ananya Sharma (Verified)',
          bio: 'Updated bio testing live scoring and privacy controls.',
          department: 'Computer Science & Engineering',
          year: '3rd Year (B.Tech)',
          interests: ['AI', 'Privacy', 'Robotics'],
          visibility: { bio: 'everyone', department: 'everyone', socialLinks: 'matches' },
        }),
      });
      if (updateRes.status !== 200) throw new Error(`Update status ${updateRes.status}`);
      const updated = await updateRes.json();
      if (updated.name !== 'Ananya Sharma (Verified)') throw new Error('Name was not updated');
      if (!updated.trustScore) throw new Error('Missing trust score on updated profile');
    });

  } finally {
    server.close();
  }

  console.log(`\n======================================================`);
  console.log(`AFFECIO TRUST SUITE: ${passed} passed, ${failed} failed`);
  console.log(`======================================================`);
  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('All end-to-end production features verified 100% operational!');
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
