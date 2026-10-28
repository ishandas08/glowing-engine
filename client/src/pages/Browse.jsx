import React, { useEffect, useState } from 'react';
import { ShieldCheck, Lock, UserCheck, UserPlus, AlertTriangle, Eye, Clock, Search, Filter, ShieldAlert, Sparkles, MessageCircle } from 'lucide-react';

export default function Browse({ token, onOpenTrustModal, onOpenReportModal, onOpenContactModal }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [minTrust, setMinTrust] = useState(0);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  useEffect(() => {
    fetchProfiles();
  }, []);

  async function fetchProfiles() {
    setLoading(true);
    try {
      const res = await fetch('/api/profiles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to fetch profiles');
      }
      const data = await res.json();
      setProfiles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendConnectionRequest(targetUserId) {
    try {
      const res = await fetch('/api/connections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetUserId, note: 'Safety-verified campus connection request' }),
      });
      const data = await res.json();
      if (res.ok) {
        showFeedback(data.message || 'Connection request sent!');
        fetchProfiles();
      } else {
        alert(data.error || 'Failed to connect');
      }
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDisconnect(targetUserId) {
    if (!window.confirm('Are you sure you want to disconnect from this peer? Private match-only fields will be relocked.')) return;
    try {
      const res = await fetch(`/api/connections/${targetUserId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        showFeedback('Disconnected from peer.');
        fetchProfiles();
      }
    } catch (err) {
      alert(err.message);
    }
  }

  function showFeedback(msg) {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(''), 3000);
  }

  // Filter profiles
  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.interests || []).some((i) => i.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesYear = filterYear === 'all' || p.year === filterYear;
    const matchesTrust = (p.trustScore || 0) >= minTrust;

    return matchesSearch && matchesYear && matchesTrust;
  });

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span>Campus Discovery</span>
            <span className="badge badge-verified" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              <ShieldCheck size={14} /> Verified Student Network
            </span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Browse peers, review authenticity signals, and connect safely with mutual privacy protection.
          </p>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              color: '#34d399',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            {feedbackMsg}
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1.25rem',
          marginBottom: '2rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          alignItems: 'center',
        }}
      >
        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search by name, department, or interest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <div>
          <select className="form-select" value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
            <option value="all">All Academic Years</option>
            <option value="1st Year (B.Tech)">1st Year</option>
            <option value="2nd Year (B.Tech)">2nd Year</option>
            <option value="3rd Year (B.Tech)">3rd Year</option>
            <option value="4th Year (B.Tech)">4th Year</option>
            <option value="Faculty & Safety Board">Faculty / Staff</option>
          </select>
        </div>

        <div>
          <select className="form-select" value={minTrust} onChange={(e) => setMinTrust(Number(e.target.value))}>
            <option value="0">Any Trust Score (0+)</option>
            <option value="60">Verified Students (60%+)</option>
            <option value="75">Highly Trusted (75%+)</option>
            <option value="90">Campus Ambassadors (90%+)</option>
          </select>
        </div>
      </div>

      {/* Profile Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
          <div style={{ fontSize: '1.1rem' }}>Verifying campus credentials and loading profiles...</div>
        </div>
      ) : error ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: '#f87171' }}>
          <AlertTriangle size={32} style={{ margin: '0 auto 1rem' }} />
          <p>{error}</p>
          <button onClick={fetchProfiles} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            Retry Loading
          </button>
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <Lock size={36} style={{ color: '#64748b', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Profiles Found</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
            Try broadening your search or trust filters to discover more students.
          </p>
        </div>
      ) : (
        <div className="grid-cards">
          {filteredProfiles.map((p) => {
            const userId = p.userId ? (p.userId._id || p.userId) : p._id;
            const isMatch = p.isMatch;
            const isPending = p.connectionStatus === 'pending';

            return (
              <div
                key={p._id}
                className="glass-card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1.5rem',
                  border: isMatch ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Match Banner if connected */}
                {isMatch && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white',
                      padding: '0.2rem 0.85rem',
                      fontSize: '0.7rem',
                      fontWeight: 800,
                      letterSpacing: '0.05em',
                      borderBottomLeftRadius: '10px',
                    }}
                  >
                    CONNECTED MATCH
                  </div>
                )}

                <div>
                  {/* Avatar & Header */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                      <img
                        src={p.avatar || (p.photos && p.photos[0]) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                        alt={p.name}
                        style={{
                          width: '68px',
                          height: '68px',
                          borderRadius: '16px',
                          objectFit: 'cover',
                          border: '2px solid rgba(255, 255, 255, 0.12)',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '-4px',
                          right: '-4px',
                          background: '#10b981',
                          color: 'white',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 5px rgba(0,0,0,0.4)',
                        }}
                        title="Verified Institutional Email"
                      >
                        <ShieldCheck size={13} />
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>
                        {p.name || 'Anonymous Student'}
                      </h3>
                      <div style={{ fontSize: '0.8rem', color: '#38bdf8', marginTop: '2px' }}>
                        {p.studentEmail || 'student@kiit.ac.in'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                        {p.department || 'Campus Department'} {p.year ? `• ${p.year}` : ''}
                      </div>
                    </div>
                  </div>

                  {/* Trust Score Button (Click to inspect breakdown) */}
                  <div style={{ marginBottom: '1rem' }}>
                    <button
                      onClick={() => onOpenTrustModal(p)}
                      className="trust-score-badge"
                      style={{ width: '100%', justifyContent: 'space-between', padding: '0.45rem 0.85rem' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <ShieldCheck size={16} />
                        <span>Trust Score: <strong>{p.trustScore || 80}/100</strong></span>
                      </div>
                      <span style={{ fontSize: '0.75rem', textDecoration: 'underline', opacity: 0.85 }}>
                        Inspect Breakdown &rarr;
                      </span>
                    </button>
                  </div>

                  {/* Bio with privacy lock check */}
                  <div style={{ marginBottom: '1rem' }}>
                    {p.bio === '[Locked — Connect to view]' ? (
                      <div
                        style={{
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: '1px dashed rgba(255, 255, 255, 0.15)',
                          borderRadius: '8px',
                          padding: '0.75rem',
                          fontSize: '0.825rem',
                          color: '#94a3b8',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                        }}
                      >
                        <Lock size={15} style={{ color: '#818cf8', flexShrink: 0 }} />
                        <span>Bio protected — visible to mutual matches only.</span>
                      </div>
                    ) : (
                      <p style={{ fontSize: '0.875rem', color: '#cbd5e1', lineHeight: 1.5 }}>
                        {p.bio || 'Verified student on Affecio Trust.'}
                      </p>
                    )}
                  </div>

                  {/* Interests */}
                  {p.interests && p.interests.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.25rem' }}>
                      {p.interests.map((interest, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: 'rgba(255, 255, 255, 0.06)',
                            color: '#cbd5e1',
                            fontSize: '0.75rem',
                            padding: '0.2rem 0.55rem',
                            borderRadius: '6px',
                          }}
                        >
                          {interest}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Social Links / Expiring Contact if matched */}
                  {isMatch && (
                    <div
                      style={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        marginBottom: '1.25rem',
                        fontSize: '0.825rem',
                      }}
                    >
                      <div style={{ fontWeight: 600, color: '#34d399', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <UserCheck size={15} /> Match Unlocked Details
                      </div>
                      {p.socialLinks?.instagram && (
                        <div style={{ color: '#cbd5e1' }}>Instagram: <strong style={{ color: '#ffffff' }}>{p.socialLinks.instagram}</strong></div>
                      )}
                      {p.socialLinks?.phone && (
                        <div style={{ color: '#cbd5e1' }}>Phone: <strong style={{ color: '#ffffff' }}>{p.socialLinks.phone}</strong></div>
                      )}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {isMatch ? (
                      <button
                        onClick={() => onOpenContactModal(p, false)}
                        className="btn btn-primary"
                        style={{ flex: 1, fontSize: '0.85rem' }}
                      >
                        <Clock size={15} /> Expiring Contact
                      </button>
                    ) : isPending ? (
                      <button disabled className="btn btn-secondary" style={{ flex: 1, fontSize: '0.85rem', opacity: 0.7 }}>
                        Request Pending
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSendConnectionRequest(userId)}
                        className="btn btn-primary"
                        style={{ flex: 1, fontSize: '0.85rem' }}
                      >
                        <UserPlus size={15} /> Connect Safely
                      </button>
                    )}

                    {isMatch && (
                      <button
                        onClick={() => handleDisconnect(userId)}
                        className="btn btn-secondary btn-sm"
                        title="Disconnect"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>

                  {/* Safety & Moderation Actions */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.25rem' }}>
                    <button
                      onClick={() => onOpenReportModal(p)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#94a3b8',
                        fontSize: '0.775rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3rem',
                        cursor: 'pointer',
                        padding: '0.2rem 0',
                      }}
                      onMouseEnter={(e) => (e.target.style.color = '#f87171')}
                      onMouseLeave={(e) => (e.target.style.color = '#94a3b8')}
                    >
                      <ShieldAlert size={14} /> Report Profile
                    </button>

                    <div style={{ fontSize: '0.725rem', color: '#64748b' }}>
                      Affecio Safety Verified
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
