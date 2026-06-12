import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';

export function HomePage() {
  // Consume user data and the logout action from the global AuthContext
  const { user, logout } = useContext(AuthContext);
  
  // Consume theme preferences from the global ThemeContext
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#009de0' }}>Wolt Customer Dashboard 🏠</h2>
      
      {/* Profile summary card displaying dynamically injected user details */}
      {user && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px', 
          margin: '24px 0',
          padding: '20px',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          maxWidth: '500px',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-main)',
          transition: 'background-color 0.3s ease, color 0.3s ease'
        }}>
          {user.profileImage && (
            <img 
              src={user.profileImage} 
              alt="User Profile" 
              style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #009de0' }} 
            />
          )}
          <div>
            <h3 style={{ margin: '0 0 4px 0' }}>Welcome back, {user.name}!</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '14px' }}>Account ID: {user.username}</p>
          </div>
        </div>
      )}

      {/* Internal application navigation layout */}
      <nav style={{ marginBottom: '30px', fontSize: '16px' }}>
        <Link to="/orders" style={{ color: '#009de0', textDecoration: 'none', fontWeight: 'bold' }}>View Order History</Link> 
        <span style={{ margin: '0 12px', color: 'var(--border-color)' }}>|</span> 
        <Link to="/restaurant/123" style={{ color: '#009de0', textDecoration: 'none', fontWeight: 'bold' }}>Browse Sample Restaurant</Link>
      </nav>

      {/* Application settings and session controls control tray */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          type="button"
          onClick={toggleTheme}
          style={{
            padding: '10px 16px',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-main)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease, color 0.3s ease'
          }}
        >
          Toggle Layout Theme (Active: {theme})
        </button>

        <button 
          type="button"
          onClick={logout}
          style={{
            padding: '10px 16px',
            backgroundColor: '#ff4d4d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Logout Session
        </button>
      </div>
    </div>
  );
}