import { useEffect, useState } from 'react';

export default function Browse() {
  const [profiles, setProfiles] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('/api/profiles', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setProfiles)
      .catch(() => setProfiles([]));
  }, []);

  return (
    <div>
      <h2>Browse Profiles</h2>
      {profiles.map((p) => (
        <div key={p._id} style={{ border: '1px solid #ccc', margin: 8, padding: 8 }}>
          <strong>{p.name}</strong> <span>Verified Student</span>
          <p>{p.bio}</p>
        </div>
      ))}
    </div>
  );
}
