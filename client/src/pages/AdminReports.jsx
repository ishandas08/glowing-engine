import { useEffect, useState } from 'react';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('/api/reports', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then(setReports)
      .catch(() => setReports([]));
  }, []);

  return (
    <div>
      <h2>Admin Reports</h2>
      {reports.map((r) => (
        <div key={r._id} style={{ border: '1px solid #ccc', margin: 8, padding: 8 }}>
          <p>Target: {r.targetId}</p>
          <p>Reason: {r.reason}</p>
          <p>Reviewed: {String(r.reviewed)}</p>
        </div>
      ))}
    </div>
  );
}
