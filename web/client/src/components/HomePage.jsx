import React, { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { RestaurantList } from './RestaurantList';

export function HomePage() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#009de0', margin: 0 }}>Wolt Customer Dashboard 🏠</h2>
        
        {/* Application settings and session controls tray */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            type="button"
            onClick={toggleTheme}
            style={{
              padding: '8px 14px',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold'
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
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 'bold'
            }}
          >
            Logout
          </button>
        </div>
      </div>
      
      {user && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '20px', 
          margin: '24px 0',
          padding: '16px',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          maxWidth: '400px',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-main)'
        }}>
          {user.profileImage && (
            <img 
              src={user.profileImage} 
              alt="User Profile" 
              style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #009de0' }} 
            />
          )}
          <div>
            <h3 style={{ margin: '0 0 4px 0' }}>Welcome, {user.name}!</h3>
            <RouterLink to="/orders" style={{ color: '#009de0', textDecoration: 'none', fontSize: '14px', fontWeight: 'bold' }}>View Order History 📦</RouterLink>
          </div>
        </div>
      )}

      {/* Render the real dynamic restaurant grid listings */}
      <RestaurantList />
    </div>
  );
}