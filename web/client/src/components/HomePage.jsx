import React, { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { RestaurantList } from './RestaurantList';

export function HomePage() {
  const { user } = useContext(AuthContext);

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif' }}>
      {user && (
        <h2 style={{ color: 'var(--text-main)', margin: '0 0 20px 0', transition: 'color 0.3s ease' }}>
          Welcome back, {user.name}! 👋
        </h2>
      )}
      
      {/* Render the dynamic interactive restaurant grid listing */}
      <RestaurantList />
    </div>
  );
}