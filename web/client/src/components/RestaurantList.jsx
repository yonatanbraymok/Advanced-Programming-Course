import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search query and cuisine filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  
  // Extract the current authenticated JWT token from the global context
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch the active restaurants array from the server API endpoints
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('/api/restaurants', {
          method: 'GET',
          headers: {
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

  // Extract unique cuisine categories dynamically from the loaded dataset
  const cuisines = ['All', ...new Set(restaurants.map(r => r.cuisine).filter(Boolean))];

  // Derive the filtered restaurants list based on active user query metrics
  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch = restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCuisine = selectedCuisine === 'All' || restaurant.cuisine === selectedCuisine;
    return matchesSearch && matchesCuisine;
  });

  if (loading) {
    return <h3 style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-main)' }}>Loading available restaurants...</h3>;
  }

  if (error) {
    return <div style={{ color: '#ff4d4d', textAlign: 'center', marginTop: '40px', fontWeight: 'bold' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '20px 0' }}>
      {/* APC-164-1b: Interactive Search and Filter Control Tray */}
      <div style={{ 
        marginBottom: '24px', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '16px',
        backgroundColor: 'var(--bg-card)',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        transition: 'background-color 0.3s ease'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-main)' }}>
            Search Restaurants
          </label>
          <input 
            type="text"
            placeholder="Type restaurant name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-main)',
              boxSizing: 'border-box',
              fontSize: '15px',
              transition: 'background-color 0.3s ease, color 0.3s ease'
            }}
          />
        </div>

        {/* Dynamic Category Pill Filters */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: 'var(--text-main)' }}>
            Filter by Cuisine
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {cuisines.map((cuisine) => {
              const isActive = selectedCuisine === cuisine;
              return (
                <button
                  key={cuisine}
                  type="button"
                  onClick={() => setSelectedCuisine(cuisine)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid #009de0',
                    backgroundColor: isActive ? '#009de0' : 'var(--bg-app)',
                    color: isActive ? '#ffffff' : 'var(--text-main)',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {cuisine}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', color: 'var(--text-main)' }}>
        {selectedCuisine !== 'All' ? `${selectedCuisine} Spots` : 'Popular Restaurants'} ({filteredRestaurants.length})
      </h3>
      
      {filteredRestaurants.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>No restaurants match your search criteria.</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '20px',
          marginTop: '20px'
        }}>
          {filteredRestaurants.map((restaurant) => (
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
                transition: 'transform 0.2s ease, background-color 0.3s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
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