import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export function RestaurantDetailPage() {
  // Extract the dynamic id parameter from the active route URL
  const { id } = useParams();
  
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch specific restaurant profile details from the backend MVC controllers
  useEffect(() => {
    const fetchRestaurantDetail = async () => {
      try {
        const response = await fetch(`/api/restaurants/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to load restaurant details');
          setLoading(false);
          return;
        }

        setRestaurant(data);
      } catch (err) {
        setError('Network error. Failed to connect to the restaurant API pipeline.');
      } finally {
        setLoading(false);
      }
    };

    if (token && id) {
      fetchRestaurantDetail();
    }
  }, [id, token]);

  if (loading) {
    return <h3 style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-main)' }}>Loading menu options...</h3>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <p style={{ color: '#ff4d4d', fontWeight: 'bold' }}>{error}</p>
        <button type="button" onClick={() => navigate('/')} style={{ color: '#009de0', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <button 
        type="button" 
        onClick={() => navigate('/')} 
        style={{
          display: 'inline-block',
          marginBottom: '20px',
          padding: '8px 16px',
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-main)',
          border: '1px solid var(--border-color)',
          borderRadius: '20px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'all 0.2s ease'
        }}
      >
        ← Back to Restaurants
      </button>

      {/* Restaurant Header Jumbotron Card */}
      {restaurant && (
        <>
          <div style={{
            position: 'relative',
            borderRadius: '12px',
            overflow: 'hidden',
            marginBottom: '30px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
          }}>
            <img 
              src={restaurant.image || 'https://via.placeholder.com/800x300?text=Wolt+Menu'} 
              alt={restaurant.name} 
              style={{ width: '100%', height: '260px', objectFit: 'cover' }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '24px',
              background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0))',
              color: '#ffffff'
            }}>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '28px' }}>{restaurant.name}</h2>
              <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
                {restaurant.cuisine} • ⭐️ {restaurant.rating || 'N/A'}
              </p>
            </div>
          </div>

          {/* Menu Items Interactive Grid Layout */}
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', color: 'var(--text-main)' }}>
            Menu Items
          </h3>

          {!restaurant.menu || restaurant.menu.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No menu items listed for this restaurant yet.</p>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginTop: '20px'
            }}>
              {restaurant.menu.map((item) => (
                <div 
                  key={item.id || item._id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '16px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    transition: 'background-color 0.3s ease, border-color 0.3s ease'
                  }}
                >
                  <div style={{ flex: 1, paddingRight: '16px' }}>
                    <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main)' }}>{item.name}</h4>
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                      {item.description || 'No description available.'}
                    </p>
                    <span style={{ color: '#009de0', fontWeight: 'bold', fontSize: '16px' }}>
                      ₪{(item.price || 0).toFixed(2)}
                    </span>
                  </div>
                  
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      style={{ width: '80px', height: '80px', borderRadius: '6px', objectFit: 'cover' }}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}