import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';

export function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  // If user session is not active, do not render the navigation top bar
  if (!user) return null;

  return (
    <header style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '12px 30px',
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-color)',
      transition: 'background-color 0.3s ease, border-color 0.3s ease',
      fontFamily: 'sans-serif'
    }}>
      {/* Right Side: Wolt Branded Link directing back to Dashboard Home */}
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ color: '#009de0', margin: 0, fontSize: '24px', fontWeight: 'bold' }}>Wolt</h1>
        </Link>
      </div>

      {/* Left Side Theme Toggle, Session Logout, and Profile Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          type="button"
          onClick={toggleTheme}
          style={{
            padding: '8px 14px',
            backgroundColor: 'var(--bg-app)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease, color 0.3s ease'
          }}
        >
          Theme: {theme}
        </button>

        <button 
          type="button"
          onClick={logout}
          style={{
            padding: '8px 14px',
            backgroundColor: '#ff4d4d',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 'bold'
          }}
        >
          Logout
        </button>

        {user.profileImage && (
          <img 
            src={user.profileImage} 
            alt="User Profile" 
            title={`Logged in as ${user.name}`}
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              objectFit: 'cover', 
              border: '2px solid #009de0',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }} 
          />
        )}
      </div>
    </header>
  );
}