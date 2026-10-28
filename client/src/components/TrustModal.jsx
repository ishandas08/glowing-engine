import React from 'react';
import { ShieldCheck, X, Check, AlertCircle, Award, Users, Calendar, Lock } from 'lucide-react';

export default function TrustModal({ isOpen, onClose, profileData }) {
  if (!isOpen || !profileData) return null;

  const score = profileData.trustScore !== undefined ? profileData.trustScore : 85;
  const breakdown = profileData.trustBreakdown || {};
  const badges = profileData.verifiedBadges || [];

  // Color logic
  let scoreColor = '#34d399'; // Green
  if (score < 50) scoreColor = '#f87171'; // Red
  else if (score < 75) scoreColor = '#fbbf24'; // Yellow
  else if (score < 90) scoreColor = '#818cf8'; // Indigo

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(79, 70, 229, 0.2)', padding: '0.5rem', borderRadius: '10px', color: '#818cf8' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                Trust & Authenticity Signals
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Transparent verification before connecting
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* User Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '1rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <img
              src={profileData.avatar || profileData.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={profileData.name}
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc' }}>{profileData.name || 'Verified Student'}</div>
              <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>
                {profileData.studentEmail || (profileData.user && profileData.user.email) || 'student@kiit.ac.in'}
              </div>
            </div>
          </div>

          {/* Score Badge */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
              {score}
              <span style={{ fontSize: '0.9rem', color: '#64748b' }}>/100</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: scoreColor, fontWeight: 600, marginTop: '2px' }}>
              {profileData.trustLevel || 'Verified Peer'}
            </div>
          </div>
        </div>

        {/* Verified Badges */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
            Authenticity Badges
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {badges.map((b, idx) => (
              <span key={idx} className="badge badge-verified" style={{ padding: '0.35rem 0.65rem' }}>
                <Check size={13} />
                <span>{b.label}</span>
              </span>
            ))}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem' }}>
            Trust Calculation Breakdown
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {Object.entries(breakdown).map(([key, item]) => {
              const isDeduction = item.points < 0;
              return (
                <div
                  key={key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.6rem 0.85rem',
                    background: isDeduction ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '8px',
                    border: isDeduction ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <span style={{ fontSize: '0.875rem', color: isDeduction ? '#fca5a5' : '#cbd5e1' }}>
                    {item.label}
                  </span>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: isDeduction ? '#ef4444' : '#10b981',
                    }}
                  >
                    {item.points > 0 ? `+${item.points}` : item.points}
                    {item.max ? ` / ${item.max}` : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Privacy & Safety Note */}
        <div
          style={{
            background: 'rgba(14, 165, 233, 0.1)',
            border: '1px solid rgba(14, 165, 233, 0.2)',
            borderRadius: '10px',
            padding: '0.85rem',
            display: 'flex',
            gap: '0.65rem',
            alignItems: 'flex-start',
          }}
        >
          <Lock size={18} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '0.78rem', color: '#bae6fd', lineHeight: 1.4 }}>
            Affecio Trust calculates authenticity without collecting sensitive biometric or facial recognition data. Scores reflect official institutional verification, peer reputation, and active community safety adherence.
          </p>
        </div>

        <button
          onClick={onClose}
          className="btn btn-secondary"
          style={{ width: '100%', marginTop: '1.25rem' }}
        >
          Close Breakdown
        </button>
      </div>
    </div>
  );
}
