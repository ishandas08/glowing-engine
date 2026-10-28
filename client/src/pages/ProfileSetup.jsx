import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Globe, Users, Save, CheckCircle2, Award, Sparkles, RefreshCw } from 'lucide-react';

export default function ProfileSetup({ token, currentUser, onOpenTrustModal }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [form, setForm] = useState({
    name: '',
    bio: '',
    department: '',
    year: '3rd Year (B.Tech)',
    interests: '',
    avatar: '',
    socialLinks: { instagram: '', phone: '' },
    visibility: {
      name: 'everyone',
      bio: 'everyone',
      department: 'everyone',
      year: 'everyone',
      interests: 'everyone',
      photos: 'everyone',
      socialLinks: 'matches',
    },
    safetyPledgeAgreed: false,
  });

  const [trustData, setTrustData] = useState({ score: 70, level: 'Verified Student' });

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const res = await fetch('/api/profiles/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data) {
        setForm({
          name: data.name || '',
          bio: data.bio || '',
          department: data.department || '',
          year: data.year || '3rd Year (B.Tech)',
          interests: (data.interests || []).join(', '),
          avatar: data.avatar || '',
          socialLinks: data.socialLinks || { instagram: '', phone: '' },
          visibility: {
            name: data.visibility?.name || 'everyone',
            bio: data.visibility?.bio || 'everyone',
            department: data.visibility?.department || 'everyone',
            year: data.visibility?.year || 'everyone',
            interests: data.visibility?.interests || 'everyone',
            photos: data.visibility?.photos || 'everyone',
            socialLinks: data.visibility?.socialLinks || 'matches',
          },
          safetyPledgeAgreed: !!data.safetyPledgeAgreed,
        });

        if (data.trustScore !== undefined) {
          setTrustData({
            score: data.trustScore,
            level: data.trustLevel,
            breakdown: data.trustBreakdown,
            verifiedBadges: data.verifiedBadges,
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const interestsArray = form.interests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const body = {
        name: form.name,
        bio: form.bio,
        department: form.department,
        year: form.year,
        avatar: form.avatar,
        interests: interestsArray,
        socialLinks: form.socialLinks,
        visibility: form.visibility,
      };

      const res = await fetch('/api/profiles/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const updated = await res.json();
      if (res.ok) {
        setMessage('Profile and privacy matrix saved successfully!');
        if (updated.trustScore !== undefined) {
          setTrustData({
            score: updated.trustScore,
            level: updated.trustLevel,
            breakdown: updated.trustBreakdown,
            verifiedBadges: updated.verifiedBadges,
          });
        }
        setTimeout(() => setMessage(''), 3000);
      } else {
        alert(updated.error || 'Failed to save');
      }
    } catch (err) {
      alert('Error saving profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSignPledge() {
    try {
      const res = await fetch('/api/auth/safety-pledge', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setForm((prev) => ({ ...prev, safetyPledgeAgreed: true }));
        setMessage('Signed Anti-Harassment & Safe Meet Pledge! +5 Trust Points added.');
        fetchProfile();
      }
    } catch (err) {
      alert(err.message);
    }
  }

  const updateVis = (field, val) => {
    setForm((prev) => ({
      ...prev,
      visibility: { ...prev.visibility, [field]: val },
    }));
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <span>Profile & Privacy Controls</span>
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
              Control your identity visibility and maximize your verified campus trust score.
            </p>
          </div>

          {/* Trust Meter Widget */}
          <div
            className="glass-card"
            style={{
              padding: '0.85rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
              borderColor: 'rgba(79, 70, 229, 0.4)',
            }}
            onClick={() => onOpenTrustModal(trustData)}
            title="Click to view detailed breakdown"
          >
            <div>
              <div style={{ fontSize: '0.725rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>
                Your Trust Score
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399', lineHeight: 1 }}>
                {trustData.score}/100
              </div>
            </div>
            <div className="badge badge-trust">
              <ShieldCheck size={14} />
              <span>{trustData.level}</span>
            </div>
          </div>
        </div>

        {/* Success message banner */}
        {message && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#34d399',
              padding: '0.85rem 1.25rem',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              marginBottom: '2rem',
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={20} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
            {/* Left Card: Basic Information */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Globe size={20} style={{ color: '#38bdf8' }} /> Student Identity
              </h2>

              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your campus name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department / School *</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.department}
                  onChange={(e) => setForm({ ...form, department: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Academic Year</label>
                <select
                  className="form-select"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                >
                  <option value="1st Year (B.Tech)">1st Year (B.Tech)</option>
                  <option value="2nd Year (B.Tech)">2nd Year (B.Tech)</option>
                  <option value="3rd Year (B.Tech)">3rd Year (B.Tech)</option>
                  <option value="4th Year (B.Tech)">4th Year (B.Tech)</option>
                  <option value="Postgraduate / M.Tech">Postgraduate / M.Tech</option>
                  <option value="Faculty & Safety Board">Faculty & Safety Board</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">About You / Campus Bio</label>
                <textarea
                  className="form-textarea"
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  placeholder="Describe your interests, study habits, clubs, or preferred safe meeting spots on campus..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Interests & Hobbies (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.interests}
                  onChange={(e) => setForm({ ...form, interests: e.target.value })}
                  placeholder="e.g. AI & Privacy, Badminton, Photography, Hackathons"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Profile Photo URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={form.avatar}
                  onChange={(e) => setForm({ ...form, avatar: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                />
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.35rem' }}>
                  Paste direct image URL or leave default.
                </div>
              </div>

              {/* Anti-Harassment Pledge */}
              <div
                style={{
                  background: form.safetyPledgeAgreed ? 'rgba(16, 185, 129, 0.1)' : 'rgba(79, 70, 229, 0.1)',
                  border: form.safetyPledgeAgreed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(79, 70, 229, 0.3)',
                  borderRadius: '10px',
                  padding: '1rem',
                  marginTop: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: form.safetyPledgeAgreed ? '#34d399' : '#f8fafc' }}>
                      {form.safetyPledgeAgreed ? 'Safety Code Signed' : 'Sign Campus Safety Pledge'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      Pledge adherence to mutual respect, verified authenticity, and zero-harassment.
                    </div>
                  </div>
                  {!form.safetyPledgeAgreed ? (
                    <button type="button" onClick={handleSignPledge} className="btn btn-primary btn-sm">
                      <Award size={15} /> Sign (+5 pts)
                    </button>
                  ) : (
                    <div className="badge badge-verified">
                      <CheckCircle2 size={13} /> Active
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Card: Granular Privacy Matrix */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Lock size={20} style={{ color: '#818cf8' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Granular Privacy Matrix</h2>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Configure visibility for each piece of personal information. The server strictly enforces these rules before transmitting data to peers.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Field: Bio */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Campus Bio Visibility</span>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>{form.visibility.bio}</span>
                  </div>
                  <select
                    className="form-select"
                    value={form.visibility.bio}
                    onChange={(e) => updateVis('bio', e.target.value)}
                  >
                    <option value="everyone">Everyone on Campus</option>
                    <option value="matches">Matches / Mutual Connections Only</option>
                    <option value="hidden">Hidden (Only Me)</option>
                  </select>
                </div>

                {/* Field: Department */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Department Visibility</span>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>{form.visibility.department}</span>
                  </div>
                  <select
                    className="form-select"
                    value={form.visibility.department}
                    onChange={(e) => updateVis('department', e.target.value)}
                  >
                    <option value="everyone">Everyone on Campus</option>
                    <option value="matches">Matches / Mutual Connections Only</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>

                {/* Field: Interests */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Interests Visibility</span>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>{form.visibility.interests}</span>
                  </div>
                  <select
                    className="form-select"
                    value={form.visibility.interests}
                    onChange={(e) => updateVis('interests', e.target.value)}
                  >
                    <option value="everyone">Everyone on Campus</option>
                    <option value="matches">Matches / Mutual Connections Only</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>

                {/* Field: Photos */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Photo Gallery Visibility</span>
                    <span style={{ fontSize: '0.75rem', color: '#38bdf8' }}>{form.visibility.photos}</span>
                  </div>
                  <select
                    className="form-select"
                    value={form.visibility.photos}
                    onChange={(e) => updateVis('photos', e.target.value)}
                  >
                    <option value="everyone">Everyone on Campus</option>
                    <option value="matches">Matches / Mutual Connections Only</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </div>

                {/* Field: Social & External Handles */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>External Social Handles</span>
                    <span style={{ fontSize: '0.75rem', color: '#fbbf24' }}>{form.visibility.socialLinks}</span>
                  </div>
                  <select
                    className="form-select"
                    value={form.visibility.socialLinks}
                    onChange={(e) => updateVis('socialLinks', e.target.value)}
                  >
                    <option value="matches">Matches / Mutual Connections Only (Recommended)</option>
                    <option value="hidden">Completely Hidden</option>
                    <option value="everyone">Everyone on Campus</option>
                  </select>
                </div>

                {/* Social inputs */}
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '1rem', borderRadius: '8px' }}>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>Instagram Handle</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.socialLinks.instagram || ''}
                      onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, instagram: e.target.value } })}
                      placeholder="@your_campus_id"
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label" style={{ fontSize: '0.8rem' }}>WhatsApp / Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={form.socialLinks.phone || ''}
                      onChange={(e) => setForm({ ...form, socialLinks: { ...form.socialLinks, phone: e.target.value } })}
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div style={{ marginTop: '2rem' }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '0.85rem' }}
                >
                  <Save size={18} />
                  <span>{saving ? 'Saving Changes...' : 'Save Profile & Privacy Settings'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
