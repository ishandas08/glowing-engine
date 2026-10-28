import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';

export default function ReportModal({ isOpen, onClose, targetUser, onSubmitReport, onBlockUser }) {
  const [category, setCategory] = useState('harassment');
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !targetUser) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!reason.trim()) {
      alert('Please state a reason for this report.');
      return;
    }

    setLoading(true);
    try {
      await onSubmitReport({
        targetId: targetUser.userId || targetUser.id || targetUser._id,
        category,
        reason,
        details,
      });

      if (alsoBlock && onBlockUser) {
        await onBlockUser(targetUser.userId || targetUser.id || targetUser._id);
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1500);
    } catch (err) {
      alert('Failed to submit report: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ background: 'rgba(239, 68, 68, 0.2)', padding: '0.5rem', borderRadius: '10px', color: '#f87171' }}>
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>
                Report Student Profile
              </h3>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                Confidential report submitted to Campus Safety Board
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

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <div style={{ width: '48px', height: '48px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
              <Check size={28} />
            </div>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Report Received
            </h4>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              Thank you for keeping our campus safe. This report has been prioritized for moderation.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                padding: '0.85rem',
                borderRadius: '8px',
                marginBottom: '1.25rem',
                fontSize: '0.875rem',
                color: '#cbd5e1',
              }}
            >
              Reporting: <strong style={{ color: '#ffffff' }}>{targetUser.name || 'Student Profile'}</strong> ({targetUser.studentEmail || 'Campus Peer'})
            </div>

            <div className="form-group">
              <label className="form-label">Report Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="harassment">Harassment or Offensive Messages</option>
                <option value="impersonation">Impersonation / Fake Student Identity</option>
                <option value="inappropriate_photos">Inappropriate or Unconsented Photos</option>
                <option value="unsolicited_contact">Stalking or Unsolicited External Contact</option>
                <option value="spam">Commercial Spam / Financial Scam</option>
                <option value="other">Other Campus Safety Violation</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Summary Reason *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Sent threatening messages after meetup request"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Additional Details / Evidence (Optional)</label>
              <textarea
                className="form-textarea"
                placeholder="Include relevant details, timestamps, or context..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
              <input
                type="checkbox"
                id="alsoBlock"
                checked={alsoBlock}
                onChange={(e) => setAlsoBlock(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: '#4f46e5' }}
              />
              <label htmlFor="alsoBlock" style={{ fontSize: '0.875rem', color: '#cbd5e1', cursor: 'pointer' }}>
                Also block this student immediately (severs all connections and hides profiles)
              </label>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="btn btn-danger">
                {loading ? 'Submitting...' : 'Submit Confidential Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
