import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function OwnerRestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyRestaurants = async () => {
      try {
        const response = await fetch('/api/restaurants/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch your restaurants');
        }
        
        const data = await response.json();
        setRestaurants(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyRestaurants();
  }, [token]);

  if (loading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-main)' }}>Loading your portfolio...</div>;
  }

  if (error) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#ff4d4d' }}>Error: {error}</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif', color: 'var(--text-main)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h2 style={{ margin: 0 }}>My Restaurants</h2>
      </div>

      {restaurants.length === 0 ? (
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          padding: '60px 40px', 
          borderRadius: '8px', 
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          border: '1px dashed var(--border-color)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-main)' }}>You have no restaurants related to you yet.</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Click the button above to create your first restaurant listing and start receiving orders!</p>
          <button 
            onClick={() => navigate('/owner/restaurants/edit')}
            style={{ padding: '12px 24px', backgroundColor: '#009de0', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}
          >
            Create Restaurant
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {restaurants.map(restaurant => (
            <div key={restaurant.id} style={{ 
              backgroundColor: 'var(--bg-card)', 
              borderRadius: '8px', 
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              transition: 'transform 0.2s ease',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <img 
                src={restaurant.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600'} 
                alt={restaurant.name} 
                style={{ width: '100%', height: '160px', objectFit: 'cover' }}
              />
              <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 8px 0' }}>{restaurant.name}</h3>
                <p style={{ color: 'var(--text-muted)', margin: '0 0 16px 0', fontSize: '14px' }}>{restaurant.cuisine}</p>
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
                  <button 
                    onClick={() => navigate(`/owner/restaurants/edit/${restaurant.id}`)}
                    style={{ padding: '6px 16px', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}
                  >
                    Edit ✏️
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Restaurant Card */}
          <div 
            onClick={() => navigate('/owner/restaurants/edit')}
            style={{ 
              backgroundColor: 'transparent', 
              borderRadius: '8px', 
              border: '2px dashed var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              minHeight: '260px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#009de0'; e.currentTarget.style.backgroundColor = 'rgba(0,157,224,0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <span style={{ fontSize: '48px', color: '#009de0', marginBottom: '8px', lineHeight: '1' }}>+</span>
            <span style={{ color: 'var(--text-main)', fontWeight: 'bold', fontSize: '18px' }}>Add Restaurant</span>
          </div>

        </div>
      )}
    </div>
  );
}

export { OwnerRestaurantList };
