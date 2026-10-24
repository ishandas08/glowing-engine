import { useState, useEffect } from 'react';

export default function ProfileSetup() {
  const [form, setForm] = useState({ name: '', bio: '', interests: '', year: '', photos: [] });
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('/api/profiles/me', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d) setForm({ name: d.name || '', bio: d.bio || '', interests: (d.interests || []).join(','), year: d.year || '', photos: d.photos || [] });
      });
  }, []);

  async function save() {
    const body = { ...form, interests: form.interests.split(',').map((s) => s.trim()).filter(Boolean) };
    await fetch('/api/profiles/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    });
    alert('Saved');
  }

  return (
    <div>
      <h2>Profile Setup</h2>
      <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <br />
      <textarea placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
      <br />
      <input placeholder="Interests (comma)" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} />
      <br />
      <input placeholder="Year" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
      <br />
      <button onClick={save}>Save</button>
    </div>
  );
}
