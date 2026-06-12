import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import { ProductCard } from './ProductCard';

export function RestaurantDetailPage() {
  // Get restaurant id from URL
  const { id } = useParams();
  
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { token } = useContext(AuthContext);
  const { addToCart } = useContext(CartContext);
  const navigate = useNavigate();

  // Fetch restaurant details
  useEffect(() => {
    const fetchRestaurantDetail = async () => {
      try {
        const response = await fetch(`/api/restaurants/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to load restaurant details');
          setLoading(false);
          return;
        }

        // Fetch menu
        const menuResponse = await fetch(`/api/restaurants/${id}/products`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });

        const menuData = await menuResponse.json();

        setRestaurant(data);
        setMenuItems(menuData || []);
      } catch (err) {
        setError('Network error. Failed to connect to the server.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchRestaurantDetail();
    }
  }, [id, token]);

  if (loading) {
    return <h3 style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-main)', fontFamily: 'sans-serif' }}>Loading menu options...</h3>;
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

      {/* Restaurant Header */}
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
              padding: '30px 70px 30px 30px',
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              borderTopRightRadius: '150px',
              boxShadow: '4px -4px 15px rgba(0,0,0,0.15)'
            }}>
              <h2 style={{ margin: '0 0 6px 0', fontSize: '28px', fontWeight: 'bold', color: '#009de0' }}>{restaurant.name}</h2>
              <p style={{ margin: '0 0 8px 0', fontSize: '15px', fontWeight: 'bold' }}>
                {restaurant.cuisine} • ⭐️ {restaurant.rating || 'N/A'}
              </p>
              {restaurant.location && (
                <p style={{ margin: '0 0 6px 0', fontSize: '14px', color: 'var(--text-muted)' }}>
                  📍 Location: [{restaurant.location.x}, {restaurant.location.y}]
                </p>
              )}
              {restaurant.distance !== undefined && (() => {
                const baseTime = 15 + Math.round(restaurant.distance * 5);
                return (
                  <div style={{ marginTop: '16px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ backgroundColor: 'var(--bg-app)', border: '1px solid var(--border-color)', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                      📍 {restaurant.distance.toFixed(1)} km away
                    </span>
                    <span style={{ backgroundColor: '#009de0', color: 'white', padding: '6px 14px', borderRadius: '20px', fontSize: '13px', fontWeight: 'bold' }}>
                      🛵 {Math.max(0, baseTime - 5)}-{baseTime + 5} mins
                    </span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* About Segment */}
          {restaurant.description && (
            <div style={{
              backgroundColor: 'var(--bg-card)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '30px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              border: '1px solid var(--border-color)'
            }}>
              <h3 style={{ margin: '0 0 12px 0', color: '#009de0' }}>About {restaurant.name}</h3>
              <p style={{ margin: 0, color: 'var(--text-main)', lineHeight: '1.6', fontSize: '15px' }}>
                {restaurant.description}
              </p>
            </div>
          )}

          {/* Menu Items */}
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', color: 'var(--text-main)' }}>
            Menu Items
          </h3>

          {!menuItems || menuItems.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No menu items listed for this restaurant yet.</p>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              marginTop: '20px'
            }}>
              {menuItems.map((item) => (
                <ProductCard 
                  key={item.id || item._id} 
                  item={item} 
                  restaurantId={restaurant.id || restaurant._id} 
                  onAddToCart={addToCart} 
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}