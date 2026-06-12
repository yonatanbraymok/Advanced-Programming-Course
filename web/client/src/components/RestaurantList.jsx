import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Extract the current authenticated JWT token from the global context
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch the active restaurants array from the server MVC API endpoints
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('/api/restaurants', {
          method: 'GET',
          headers: {
            // Secure request handshake by appending the active user token
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to fetch restaurants');
          setLoading(false);
          return;
        }

        // Backend returns an array of restaurants directly or under a data key
        setRestaurants(Array.isArray(data) ? data : data.restaurants || []);
      } catch (err) {
        setError('Network error. Failed to load restaurant listings.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRestaurants();
    }
  }, [token]);

  if (loading) {
    return <h3 style={{ textAlign: 'center', marginTop: '40px' }}>Loading available restaurants...</h3>;
  }

  if (error) {
    return <div style={{ color: '#ff4d4d', textAlign: 'center', marginTop: '40px', fontWeight: 'bold' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>Popular Restaurants</h3>
      
      {restaurants.length === 0 ? (
        <p>No restaurants available at the moment.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {restaurants.map((restaurant) => (
            <div 
              key={restaurant.id || restaurant._id}
              onClick={() => navigate(`/restaurant/${restaurant.id || restaurant._id}`)}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                transition: 'transform 0.2s ease'
              }}
            >
              {/* Restaurant Banner Image */}
              <img 
                src={restaurant.image || 'https://via.placeholder.com/300x150?text=Wolt+Restaurant'} 
                alt={restaurant.name}
                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
              />
              <div style={{ padding: '16px' }}>
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-main)' }}>{restaurant.name}</h4>
                <p style={{ margin: '0 0 12px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                  {restaurant.cuisine || 'International'} • ⭐️ {restaurant.rating || 'N/A'}
                </p>
                <span style={{ color: '#009de0', fontSize: '14px', fontWeight: 'bold' }}>View Menu →</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}