import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import SignIn from './pages/SignIn.jsx';
import Browse from './pages/Browse.jsx';
import ProfileSetup from './pages/ProfileSetup.jsx';
import SafetyCenter from './pages/SafetyCenter.jsx';
import AdminReports from './pages/AdminReports.jsx';
import TrustModal from './components/TrustModal.jsx';
import ReportModal from './components/ReportModal.jsx';
import ContactShareModal from './components/ContactShareModal.jsx';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [trustModal, setTrustModal] = useState({ isOpen: false, profileData: null });
  const [reportModal, setReportModal] = useState({ isOpen: false, targetUser: null });
  const [contactModal, setContactModal] = useState({ isOpen: false, targetUser: null, isSelf: false });

  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      verifyUser();
    }
  }, [token]);

  async function verifyUser() {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        handleLogout();
      }
    } catch (err) {
      console.warn('Auth verify skipped (offline / dev):', err.message);
    }
  }

  function handleLoginSuccess(newToken, user) {
    setToken(newToken);
    setCurrentUser(user);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(user));
  }

  function handleLogout() {
    setToken('');
    setCurrentUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  }

  // Modal Triggers
  function handleOpenTrustModal(profileData) {
    setTrustModal({ isOpen: true, profileData });
  }

  function handleOpenReportModal(targetUser) {
    setReportModal({ isOpen: true, targetUser });
  }

  function handleOpenContactModal(targetUser, isSelf = false) {
    setContactModal({ isOpen: true, targetUser, isSelf });
  }

  // Submit report action
  async function handleSubmitReport(reportData) {
    const res = await fetch('/api/reports', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(reportData),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit report');
    }
    return await res.json();
  }

  // Block user action
  async function handleBlockUser(targetId) {
    const res = await fetch('/api/reports/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ targetId }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to block user');
    }
    return await res.json();
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenTrustModal={handleOpenTrustModal}
      />

      <main style={{ flex: 1 }}>
        <Routes>
          <Route
            path="/"
            element={<Navigate to={token ? '/browse' : '/signin'} replace />}
          />

          <Route
            path="/signin"
            element={
              token ? (
                <Navigate to="/browse" replace />
              ) : (
                <SignIn onLoginSuccess={handleLoginSuccess} />
              )
            }
          />

          <Route
            path="/browse"
            element={
              token ? (
                <Browse
                  token={token}
                  currentUser={currentUser}
                  onOpenTrustModal={handleOpenTrustModal}
                  onOpenReportModal={handleOpenReportModal}
                  onOpenContactModal={handleOpenContactModal}
                />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />

          <Route
            path="/profile"
            element={
              token ? (
                <ProfileSetup
                  token={token}
                  currentUser={currentUser}
                  onOpenTrustModal={handleOpenTrustModal}
                />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />

          <Route
            path="/safety"
            element={
              token ? (
                <SafetyCenter
                  token={token}
                  onOpenContactModal={handleOpenContactModal}
                />
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />

          <Route
            path="/admin"
            element={
              token ? (
                currentUser?.role === 'admin' ? (
                  <AdminReports token={token} onOpenTrustModal={handleOpenTrustModal} />
                ) : (
                  <div className="container" style={{ paddingTop: '4rem', textAlign: 'center' }}>
                    <h2 style={{ color: '#f87171' }}>Access Restricted</h2>
                    <p style={{ color: '#94a3b8' }}>Only Campus Safety Officers can access this moderation portal.</p>
                  </div>
                )
              ) : (
                <Navigate to="/signin" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Global Modals */}
      <TrustModal
        isOpen={trustModal.isOpen}
        onClose={() => setTrustModal({ isOpen: false, profileData: null })}
        profileData={trustModal.profileData}
      />

      <ReportModal
        isOpen={reportModal.isOpen}
        onClose={() => setReportModal({ isOpen: false, targetUser: null })}
        targetUser={reportModal.targetUser}
        onSubmitReport={handleSubmitReport}
        onBlockUser={handleBlockUser}
      />

      <ContactShareModal
        isOpen={contactModal.isOpen}
        onClose={() => setContactModal({ isOpen: false, targetUser: null, isSelf: false })}
        targetUser={contactModal.targetUser}
        isSelf={contactModal.isSelf}
        token={token}
      />

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '1.5rem', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>
        <div className="container">
          Affecio Hacks ’26 • “Trust Before Connection” Platform • KIIT Campus Safety Network
        </div>
      </footer>
    </div>
  );
}
