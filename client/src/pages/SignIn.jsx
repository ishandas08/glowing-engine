import { useState } from 'react';

export default function SignIn() {
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  async function handleCredential(resp) {
    const r = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: resp.credential }),
    });
    const data = await r.json();
    if (data.token) {
      localStorage.setItem('token', data.token);
      setToken(data.token);
    } else {
      alert(data.error);
    }
  }
  return (
    <div>
      <h2>Sign In</h2>
      <p>Use Google sign-in restricted to college domain.</p>
      <button onClick={() => alert('Wire Google Identity Services button here')}>Sign in with Google</button>
      {token && <p>Logged in.</p>}
    </div>
  );
}
