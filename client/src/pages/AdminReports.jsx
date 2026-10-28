import React, { useEffect, useState } from 'react';
import { AlertTriangle, ShieldCheck, UserX, CheckCircle, Clock, Filter, Eye, RefreshCw } from 'lucide-react';

export default function AdminReports({ token, onOpenTrustModal }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/reports', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to fetch admin reports');
      }
      const data = await res.json();
      setReports(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleTakeAction(reportId, action) {
    if (action === 'suspend' && !window.confirm('Are you sure you want to suspend this student account immediately?')) {
      return;
    }

    setActionLoading(reportId);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        fetchReports();
      } else {
        alert(data.error || 'Failed to apply action');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  // Filter
  const filteredReports = reports.filter((r) => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  // Metrics
  const totalReports = reports.length;
  const pendingReports = reports.filter((r) => r.status === 'pending').length;
  const actionedReports = reports.filter((r) => r.status === 'action_taken').length;
  const dismissedReports = reports.filter((r) => r.status === 'dismissed').length;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span>Campus Safety Moderation Board</span>
            <span className="badge badge-warning" style={{ fontSize: '0.8rem' }}>
              Safety Council Portal
            </span>
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Investigate student reports, review authenticity disputes, and enforce campus safety policies.
          </p>
        </div>

        <button onClick={fetchReports} className="btn btn-secondary btn-sm">
          <RefreshCw size={15} /> Refresh Queue
        </button>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="glass-card" style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Total Reports</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f8fafc', marginTop: '0.25rem' }}>{totalReports}</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #fbbf24' }}>
          <div style={{ fontSize: '0.8rem', color: '#fbbf24', textTransform: 'uppercase', fontWeight: 600 }}>Pending Review</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#fbbf24', marginTop: '0.25rem' }}>{pendingReports}</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #ef4444' }}>
          <div style={{ fontSize: '0.8rem', color: '#f87171', textTransform: 'uppercase', fontWeight: 600 }}>Action Taken</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#f87171', marginTop: '0.25rem' }}>{actionedReports}</div>
        </div>

        <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '3px solid #10b981' }}>
          <div style={{ fontSize: '0.8rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 600 }}>Dismissed</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#34d399', marginTop: '0.25rem' }}>{dismissedReports}</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {['all', 'pending', 'action_taken', 'dismissed'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
            style={{ textTransform: 'capitalize' }}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Reports Queue */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          Loading safety reports queue...
        </div>
      ) : error ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: '#f87171' }}>
          <AlertTriangle size={32} style={{ margin: '0 auto 1rem' }} />
          <p>{error}</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <CheckCircle size={36} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>No Reports in this View</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Campus safety queue is clear.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredReports.map((r) => {
            const target = r.targetId || {};
            const reporter = r.reporterId || {};
            const isSuspended = target.isSuspended;

            return (
              <div
                key={r._id}
                className="glass-card"
                style={{
                  padding: '1.5rem',
                  borderLeft:
                    r.status === 'pending'
                      ? '4px solid #fbbf24'
                      : r.status === 'action_taken'
                      ? '4px solid #ef4444'
                      : '4px solid #10b981',
                }}
              >
                {/* Top Row: Meta info */}
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <span className="badge badge-warning" style={{ textTransform: 'uppercase', fontSize: '0.72rem' }}>
                      {r.category?.replace('_', ' ') || 'General Safety'}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                      Reported: {new Date(r.createdAt).toLocaleDateString()} at {new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <span
                    className={`badge ${
                      r.status === 'pending'
                        ? 'badge-warning'
                        : r.status === 'action_taken'
                        ? 'badge-danger'
                        : 'badge-verified'
                    }`}
                  >
                    Status: {r.status?.replace('_', ' ')}
                  </span>
                </div>

                {/* Reporter & Target Summary */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', background: 'rgba(15, 23, 42, 0.5)', padding: '1rem', borderRadius: '10px', marginBottom: '1.25rem' }}>
                  {/* Target Student */}
                  <div>
                    <div style={{ fontSize: '0.725rem', color: '#f87171', textTransform: 'uppercase', fontWeight: 700 }}>
                      Reported Student (Target)
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc', marginTop: '2px' }}>
                      {target.name || 'Unknown Student'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#38bdf8' }}>{target.email}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{target.department || 'Campus Department'}</div>
                    {isSuspended && (
                      <span className="badge badge-danger" style={{ marginTop: '0.4rem', fontSize: '0.7rem' }}>
                        ACCOUNT SUSPENDED
                      </span>
                    )}
                  </div>

                  {/* Reporter Student */}
                  <div>
                    <div style={{ fontSize: '0.725rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 700 }}>
                      Reporting Student
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#f8fafc', marginTop: '2px' }}>
                      {reporter.name || 'Anonymous Reporter'}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{reporter.email}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{reporter.department || 'Campus Department'}</div>
                  </div>
                </div>

                {/* Reason & Details */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc', marginBottom: '0.25rem' }}>
                    Reason: {r.reason}
                  </div>
                  {r.details && (
                    <div style={{ fontSize: '0.85rem', color: '#cbd5e1', background: 'rgba(255, 255, 255, 0.03)', padding: '0.75rem', borderRadius: '8px' }}>
                      {r.details}
                    </div>
                  )}
                  {r.actionTaken && (
                    <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.5rem', fontWeight: 600 }}>
                      Action Recorded: {r.actionTaken}
                    </div>
                  )}
                </div>

                {/* Moderation Actions */}
                <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.65rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleTakeAction(r._id, 'dismiss')}
                    disabled={actionLoading === r._id}
                    className="btn btn-secondary btn-sm"
                  >
                    Dismiss Report
                  </button>

                  <button
                    onClick={() => handleTakeAction(r._id, 'warn')}
                    disabled={actionLoading === r._id}
                    className="btn btn-secondary btn-sm"
                    style={{ borderColor: 'rgba(245, 158, 11, 0.4)', color: '#fbbf24' }}
                  >
                    Issue Safety Warning
                  </button>

                  {!isSuspended && (
                    <button
                      onClick={() => handleTakeAction(r._id, 'suspend')}
                      disabled={actionLoading === r._id}
                      className="btn btn-danger btn-sm"
                    >
                      <UserX size={15} /> Suspend Account
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
