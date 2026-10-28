import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Compass, User, Lock, AlertTriangle, LogOut, CheckCircle2, ChevronDown } from 'lucide-react';

export default function Navbar({ currentUser, onLogout, onSelectDemoUser, onOpenTrustModal }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <Link to="/browse" className="nav-brand">
          <div className="nav-logo-icon">
            <Shield size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Affecio</span>
              <span style={{ color: '#06b6d4', fontWeight: 600 }}>Trust</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '-2px' }}>
              Trust Before Connection
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        {currentUser && (
          <div className="nav-links">
            <Link to="/browse" className={`nav-link ${isActive('/browse') ? 'active' : ''}`}>
              <Compass size={17} />
              <span>Campus Browse</span>
            </Link>

            <Link to="/safety" className={`nav-link ${isActive('/safety') ? 'active' : ''}`}>
              <Lock size={17} />
              <span>Safety Center</span>
            </Link>

            <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
              <User size={17} />
              <span>My Profile & Privacy</span>
            </Link>

            {currentUser.role === 'admin' && (
              <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>
                <AlertTriangle size={17} style={{ color: '#fbbf24' }} />
                <span style={{ color: '#fbbf24' }}>Admin Reports</span>
              </Link>
            )}
          </div>
        )}

        {/* Right side Profile & Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
              {/* Trust Score Pill */}
              <button
                onClick={() => onOpenTrustModal(currentUser.id || currentUser._id)}
                className="trust-score-badge"
                title="View your verified trust score breakdown"
              >
                <CheckCircle2 size={14} />
                <span>Verified @kiit.ac.in</span>
              </button>

              {/* User Avatar & Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <img
                  src={currentUser.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={currentUser.name}
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid rgba(79, 70, 229, 0.4)',
                  }}
                />
                <div style={{ display: 'none', md: 'block', textAlign: 'left' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1.2 }}>
                    {currentUser.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                    {currentUser.role === 'admin' ? 'Safety Officer' : 'Verified Student'}
                  </div>
                </div>
              </div>

              {/* Logout */}
              <button
                onClick={onLogout}
                className="btn btn-secondary btn-sm"
                title="Sign out of campus network"
                style={{ padding: '0.45rem 0.65rem' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/signin" className="btn btn-primary btn-sm">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
