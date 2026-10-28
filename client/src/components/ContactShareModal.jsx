import React, { useState, useEffect } from 'react';
import { Clock, X, Lock, Phone, MessageSquare, Instagram, AlertCircle, Trash2, CheckCircle2 } from 'lucide-react';

export default function ContactShareModal({ isOpen, onClose, targetUser, isSelf, token }) {
  const [loading, setLoading] = useState(false);
  const [activeShare, setActiveShare] = useState(null);
  const [remainingSec, setRemainingSec] = useState(0);

  // Form states for creating share
  const [platform, setPlatform] = useState('whatsapp');
  const [value, setValue] = useState('');
  const [minutes, setMinutes] = useState('60');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (!isSelf && targetUser) {
      loadTargetContact();
    }
  }, [isOpen, targetUser, isSelf]);

  // Live countdown timer
  useEffect(() => {
    if (remainingSec <= 0) return;
    const interval = setInterval(() => {
      setRemainingSec((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingSec]);

  async function loadTargetContact() {
    setLoading(true);
    try {
      const res = await fetch(`/api/safety/contact-share/${targetUser.userId || targetUser._id || targetUser.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.active) {
        setActiveShare(data);
        setRemainingSec(data.remainingSeconds || 0);
      } else {
        setActiveShare(data);
        setRemainingSec(0);
      }
    } catch (err) {
      console.error('Failed to load contact share:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateShare(e) {
    e.preventDefault();
    if (!value.trim()) {
      alert('Please enter your contact details');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/safety/contact-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ platform, value, minutes: parseInt(minutes, 10) }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage('Expiring contact share activated successfully!');
        setTimeout(() => {
          setMessage('');
          onClose();
        }, 1200);
      } else {
        alert(data.error || 'Failed to create share');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRevokeShare() {
    if (!window.confirm('Are you sure you want to revoke this expiring contact share immediately?')) return;
    setLoading(true);
    try {
      const res = await fetch('/api/safety/contact-share', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.ok) {
        alert('Contact share revoked.');
        onClose();
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen) return null;

  function formatTime(totalSeconds) {
    if (totalSeconds <= 0) return 'Expired';
    const hours = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(14, 165, 233, 0.2)', padding: '0.5rem', borderRadius: '10px', color: '#38bdf8' }}>
              <Clock size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                {isSelf ? 'Ghost Contact Generator' : 'Expiring Contact Share'}
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Privacy-first timed access to sensitive contact information
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

        {/* Self: Generator form */}
        {isSelf ? (
          <form onSubmit={handleCreateShare}>
            {message && (
              <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <CheckCircle2 size={16} />
                <span>{message}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Contact Platform</label>
              <select
                className="form-select"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
              >
                <option value="whatsapp">WhatsApp Number</option>
                <option value="phone">Phone / SMS</option>
                <option value="instagram">Instagram Handle</option>
                <option value="telegram">Telegram Handle</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Contact Detail</label>
              <input
                type="text"
                className="form-input"
                placeholder={platform === 'instagram' ? '@your_handle' : '+91 98765 43210'}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Auto-Expire Duration</label>
              <select
                className="form-select"
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
              >
                <option value="15">15 Minutes (Quick meetup)</option>
                <option value="60">1 Hour (Standard coffee meet)</option>
                <option value="360">6 Hours (Campus event / Evening)</option>
                <option value="1440">24 Hours (Full day project collab)</option>
              </select>
            </div>

            <div
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '8px',
                padding: '0.85rem',
                fontSize: '0.8rem',
                color: '#94a3b8',
                marginBottom: '1.25rem',
              }}
            >
              When expired, this detail is automatically wiped from read responses. Other students will no longer see your number or handle.
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleRevokeShare}
                className="btn btn-secondary btn-sm"
                style={{ color: '#f87171' }}
              >
                <Trash2 size={15} /> Revoke Current
              </button>
              <button type="submit" disabled={loading} className="btn btn-primary">
                {loading ? 'Generating...' : 'Activate Ghost Contact'}
              </button>
            </div>
          </form>
        ) : (
          /* Viewing another student's contact */
          <div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                Verifying safety tokens...
              </div>
            ) : activeShare && activeShare.active && remainingSec > 0 ? (
              <div>
                <div
                  style={{
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: '12px',
                    padding: '1.25rem',
                    textAlign: 'center',
                    marginBottom: '1.25rem',
                  }}
                >
                  <div style={{ fontSize: '0.8rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                    Active Expiring Contact
                  </div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.03em' }}>
                    {activeShare.value}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.35rem' }}>
                    Platform: <strong style={{ textTransform: 'capitalize', color: '#38bdf8' }}>{activeShare.platform}</strong>
                  </div>

                  {/* Countdown */}
                  <div
                    style={{
                      marginTop: '1rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      background: 'rgba(0, 0, 0, 0.4)',
                      padding: '0.4rem 0.85rem',
                      borderRadius: '999px',
                      color: '#fbbf24',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}
                  >
                    <Clock size={15} />
                    <span>Expires in: {formatTime(remainingSec)}</span>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: '8px',
                    padding: '0.85rem',
                    fontSize: '0.8rem',
                    color: '#fca5a5',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                  }}
                >
                  <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <strong>Campus Safety Reminder:</strong> This contact detail was shared on a timed basis. Do not broadcast or save this number without explicit mutual consent.
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ width: '48px', height: '48px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', color: '#94a3b8' }}>
                  <Lock size={22} />
                </div>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.4rem' }}>
                  No Active Contact Share
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.4 }}>
                  {activeShare && activeShare.expired
                    ? 'The temporary contact share for this student has expired.'
                    : 'This student has not currently published an expiring contact token.'}
                </p>
              </div>
            )}

            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ width: '100%', marginTop: '1.25rem' }}
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
