import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Navbar = () => {
  const { user, logout, activeRuleVersion } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <nav style={{ background: '#1a202c', color: '#fff', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        <strong style={{ fontSize: '18px' }}>Legal Metrology PWA</strong>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Inspections</Link>
        <Link to="/sync" style={{ color: '#fff', textDecoration: 'none' }}>Offline Queue</Link>
      </div>
      <div style={{ fontSize: '14px', display: 'flex', gap: '15px', alignItems: 'center' }}>
        <span>Role: <strong>{user.role}</strong></span>
        {activeRuleVersion && <span className="badge">Rules: {activeRuleVersion}</span>}
        <button onClick={() => { logout(); navigate('/login'); }}>Logout</button>
      </div>
    </nav>
  );
};