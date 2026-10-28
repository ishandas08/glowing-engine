import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle2, MapPin, Clock, Phone, AlertCircle, Sparkles, Check, Lock, ChevronRight } from 'lucide-react';

export default function SafetyCenter({ token, onOpenContactModal }) {
  const [checklist, setChecklist] = useState([]);
  const [safeZones, setSafeZones] = useState([]);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSafetyData();
  }, []);

  async function fetchSafetyData() {
    setLoading(true);
    try {
      const res = await fetch('/api/safety/checklist');
      const data = await res.json();
      setChecklist(data.checklist || []);
      setSafeZones(data.safeZones || []);
      setEmergencyContacts(data.emergencyContacts || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function toggleCheck(id) {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }

  const completedCount = Object.values(checkedItems).filter(Boolean).length;
  const totalCount = checklist.length || 6;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(14, 165, 233, 0.15)',
              border: '1px solid rgba(14, 165, 233, 0.3)',
              borderRadius: '999px',
              padding: '0.4rem 1rem',
              color: '#38bdf8',
              fontSize: '0.85rem',
              fontWeight: 600,
              marginBottom: '1rem',
            }}
          >
            <ShieldAlert size={16} />
            <span>Campus Safety & Prevention Protocol</span>
          </div>

          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.5rem' }}>
            Trust Before Connection Hub
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: '650px', margin: '0 auto', lineHeight: 1.6 }}>
            Practical safety tools designed to keep every student secure before, during, and after discovering peers on campus.
          </p>
        </div>

        {/* 2-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          {/* Left Column: Meet Safely Checklist */}
          <div>
            <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                    First Meetup Safety Checklist
                  </h2>
                  <p style={{ fontSize: '0.825rem', color: '#94a3b8' }}>
                    Complete before agreeing to meet any student in person
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: progressPercent === 100 ? '#10b981' : '#38bdf8' }}>
                    {completedCount}/{totalCount}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Completed</div>
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '999px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                <div
                  style={{
                    width: `${progressPercent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #06b6d4, #10b981)',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                {checklist.map((item) => {
                  const isChecked = !!checkedItems[item.id];
                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleCheck(item.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.85rem',
                        padding: '0.85rem',
                        background: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        border: isChecked ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.06)',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      <div
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '6px',
                          border: isChecked ? 'none' : '2px solid rgba(255, 255, 255, 0.25)',
                          background: isChecked ? '#10b981' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          marginTop: '2px',
                          flexShrink: 0,
                        }}
                      >
                        {isChecked && <Check size={15} />}
                      </div>

                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem', color: isChecked ? '#34d399' : '#f8fafc' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px', lineHeight: 1.4 }}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Ghost Contact Tool Card */}
            <div className="glass-card" style={{ padding: '1.75rem', borderLeft: '4px solid #0ea5e9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <Clock size={22} style={{ color: '#38bdf8' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Ghost Contact — Expiring Info</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                Never permanently expose your real phone number or social handles. Generate a self-destructing contact share that expires automatically in 15 mins, 1 hour, or 24 hours.
              </p>
              <button
                onClick={() => onOpenContactModal(null, true)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                <Clock size={16} /> Manage / Create Ghost Contact
              </button>
            </div>
          </div>

          {/* Right Column: Safe Zones & Emergency SOS */}
          <div>
            {/* Campus Safe Zones */}
            <div className="glass-card" style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <MapPin size={22} style={{ color: '#10b981' }} />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Verified Campus Safe Zones</h2>
              </div>
              <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
                High-visibility public locations with CCTV surveillance and security presence.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {safeZones.map((zone) => (
                  <div
                    key={zone.id}
                    style={{
                      background: 'rgba(15, 23, 42, 0.6)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>{zone.name}</h4>
                      <span className="badge badge-trust" style={{ fontSize: '0.7rem' }}>{zone.hours}</span>
                    </div>

                    <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.35rem', fontStyle: 'italic' }}>
                      {zone.tip}
                    </p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.75rem' }}>
                      {zone.safetyFeatures.map((f, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: 'rgba(16, 185, 129, 0.1)',
                            color: '#34d399',
                            fontSize: '0.7rem',
                            padding: '0.15rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                          }}
                        >
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Emergency Speed Dial */}
            <div className="glass-card" style={{ padding: '1.75rem', borderLeft: '4px solid #ef4444' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Phone size={22} style={{ color: '#f87171' }} />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>24/7 Campus Emergency Speed Dial</h3>
              </div>
              <p style={{ fontSize: '0.825rem', color: '#94a3b8', marginBottom: '1rem' }}>
                Keep these numbers accessible during all campus social discovery activities:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {emergencyContacts.map((contact, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(239, 68, 68, 0.08)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>
                        {contact.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Available {contact.available}</div>
                    </div>
                    <a
                      href={`tel:${contact.phone}`}
                      className="btn btn-danger btn-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      {contact.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
