import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { RestaurantList } from './RestaurantList';

export function HomePage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      {user && (
        <h2 style={{ color: 'var(--text-main)', margin: '0 0 20px 0', transition: 'color 0.3s ease' }}>
          Welcome back, {user.name}! 👋
        </h2>
      )}

      {user?.role === 'restaurant_owner' && (
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => navigate('/owner/restaurants/edit')}
              style={{ padding: '12px 24px', backgroundColor: '#009de0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
            >
              + Add Restaurant
            </button>
            <button 
              onClick={() => navigate('/owner/restaurants')}
              style={{ padding: '12px 24px', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' }}
            >
              ✏️ Edit Restaurants
            </button>
        </div>
      )}
      
      {/* Render the dynamic interactive restaurant grid listing */}
      <RestaurantList />
    </div>
  );
}