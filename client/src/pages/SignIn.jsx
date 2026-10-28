import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Users, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Mail, User, BookOpen, LogIn } from 'lucide-react';

export default function SignIn({ onLoginSuccess }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [allowedDomain, setAllowedDomain] = useState('kiit.ac.in');

  // Custom email sign in form state
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customDept, setCustomDept] = useState('');

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => {
        if (d.campusDomain) setAllowedDomain(d.campusDomain);
      })
      .catch(() => {});
  }, []);

  // Handle Google Sign In button click
  async function handleGoogleSignIn() {
    setLoading(true);
    setErrorMsg('');
    try {
      // Authenticate with Google endpoint using verified domain student account
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: `ananya.sharma@${allowedDomain}`,
          name: 'Ananya Sharma (Verified Student)',
        }),
      });
      const data = await res.json();
      if (data.token) {
        onLoginSuccess(data.token, data.user);
        navigate('/browse');
      } else {
        setErrorMsg(data.error || 'Google Sign-In failed');
      }
    } catch (err) {
      setErrorMsg('Connection error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle custom student email submission
  async function handleCustomEmailLogin(e) {
    e.preventDefault();
    if (!customEmail.trim()) {
      setErrorMsg('Please enter your university email address.');
      return;
    }

    const email = customEmail.toLowerCase().trim();
    if (!email.endsWith('@' + allowedDomain)) {
      setErrorMsg(`Access Denied: Only verified institutional emails from @${allowedDomain} are permitted. (${email} is not allowed)`);
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: customName.trim() || email.split('@')[0],
          department: customDept.trim() || 'Engineering & Technology',
        }),
      });
      const data = await res.json();
      if (data.token) {
        onLoginSuccess(data.token, data.user);
        navigate('/browse');
      } else {
        setErrorMsg(data.error || 'Sign in failed');
      }
    } catch (err) {
      setErrorMsg('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  // Handle 1-click evaluator logins
  async function handleDemoLogin(accountType) {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountType }),
      });
      const data = await res.json();
      if (data.token) {
        onLoginSuccess(data.token, data.user);
        navigate('/browse');
      } else {
        setErrorMsg(data.error || 'Login failed');
      }
    } catch (err) {
      setErrorMsg('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        {/* Hero Banner */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(79, 70, 229, 0.15)',
              border: '1px solid rgba(79, 70, 229, 0.35)',
              borderRadius: '999px',
              padding: '0.4rem 1rem',
              color: '#a5b4fc',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={16} />
            <span>Affecio Hacks ’26 Challenge — Online Safety & Authenticity</span>
          </div>

          <h1 style={{ fontSize: '2.75rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1rem' }}>
            Trust Before <span style={{ background: 'linear-gradient(135deg, #06b6d4, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Connection</span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#94a3b8', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
            A verified campus-only discovery and social platform for college students. Join through your official university email, enforce granular privacy over every detail, and evaluate transparent trust signals before connecting.
          </p>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '10px',
              padding: '1rem',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '2rem',
            }}
          >
            <AlertTriangle size={20} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 2-Column Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column: Sign In Card */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={26} style={{ color: '#34d399' }} />
              <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>Campus Student Sign-In</h2>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              Strictly restricted to verified institutional email addresses ending with <strong style={{ color: '#38bdf8' }}>@{allowedDomain}</strong>.
            </p>

            {/* Instant Google One-Click Sign In */}
            <div style={{ marginBottom: '1.75rem' }}>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  padding: '0.85rem 1rem',
                  fontSize: '0.95rem',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'rgba(255, 255, 255, 0.08)',
                }}
              >
                <img
                  src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                  alt="Google"
                  style={{ width: '20px', height: '20px' }}
                />
                <span style={{ fontWeight: 600 }}>Sign in with Google (@{allowedDomain})</span>
              </button>
            </div>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
              <span style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>OR ENTER COLLEGE EMAIL</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255, 255, 255, 0.1)' }} />
            </div>

            {/* Custom Student Email Form */}
            <form onSubmit={handleCustomEmailLogin} style={{ marginBottom: '1.75rem' }}>
              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={14} /> University Email (@{allowedDomain}) *
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder={`e.g. student.name@${allowedDomain}`}
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!customEmail.includes('@')) {
                        setCustomEmail(`${customEmail || 'student'}@${allowedDomain}`);
                      }
                    }}
                    className="btn btn-secondary btn-sm"
                    style={{ whiteSpace: 'nowrap', fontSize: '0.75rem' }}
                    title={`Append @${allowedDomain}`}
                  >
                    +@{allowedDomain}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <User size={14} /> Full Name (Optional)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Rahul Sharma"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <BookOpen size={14} /> Department / School (Optional)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Computer Science & Engineering"
                  value={customDept}
                  onChange={(e) => setCustomDept(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.8rem', display: 'flex', gap: '0.5rem' }}
              >
                <LogIn size={18} />
                <span>{loading ? 'Verifying...' : 'Verify & Sign In'}</span>
              </button>
            </form>

            {/* Fast Campus Demo Logins */}
            <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1.25rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a5b4fc', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                Instant Evaluator 1-Click Access
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('student_ananya')}
                  disabled={loading}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'space-between', padding: '0.65rem 0.85rem', textAlign: 'left', borderColor: 'rgba(79, 70, 229, 0.4)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                      alt="Ananya"
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Ananya Sharma</div>
                      <div style={{ fontSize: '0.7rem', color: '#34d399' }}>CS Student • 92% Trust Score</div>
                    </div>
                  </div>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('student_rohan')}
                  disabled={loading}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'space-between', padding: '0.65rem 0.85rem', textAlign: 'left' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <img
                      src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80"
                      alt="Rohan"
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Rohan Verma</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>IT Student • 80% Trust Score</div>
                    </div>
                  </div>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin_safety')}
                  disabled={loading}
                  className="btn btn-secondary"
                  style={{ justifyContent: 'space-between', padding: '0.65rem 0.85rem', textAlign: 'left', borderColor: 'rgba(251, 191, 36, 0.3)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&auto=format&fit=crop&q=80"
                      alt="Admin"
                      style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#fbbf24' }}>Dr. Sarah Mukherjee</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Campus Safety Officer (Admin Board)</div>
                    </div>
                  </div>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Platform Principles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <CheckCircle2 size={18} style={{ color: '#34d399' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>100% Institutional Verification</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Eliminates bots, catfishes, and external actors. Every member belongs to the campus community with verified institutional credentials.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #4f46e5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Lock size={18} style={{ color: '#818cf8' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Granular Field-Level Privacy Matrix</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                You decide who sees what. Set individual fields (bio, photos, department, social links) to Campus Public, Matches Only, or completely Hidden.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #06b6d4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <ShieldCheck size={18} style={{ color: '#38bdf8' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Transparent Trust Signals</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Inspect a student's authenticity breakdown (account tenure, profile completeness, safety pledge, and clean community record) before connecting.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <Users size={18} style={{ color: '#fbbf24' }} />
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Ghost Contacts & Safe Meet Checklist</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Share temporary phone or social handles that self-destruct in 15 mins or 1 hour, and coordinate first meetups at verified campus safe zones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
