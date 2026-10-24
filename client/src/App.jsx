import { Routes, Route, Link } from 'react-router-dom';
import SignIn from './pages/SignIn.jsx';
import ProfileSetup from './pages/ProfileSetup.jsx';
import Browse from './pages/Browse.jsx';
import AdminReports from './pages/AdminReports.jsx';

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">Home</Link> | <Link to="/signin">Sign In</Link> | <Link to="/profile">Profile</Link> | <Link to="/browse">Browse</Link> | <Link to="/admin">Admin</Link>
      </nav>
      <Routes>
        <Route path="/" element={<div>Welcome to Affecio Trust</div>} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/profile" element={<ProfileSetup />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/admin" element={<AdminReports />} />
      </Routes>
    </div>
  );
}
