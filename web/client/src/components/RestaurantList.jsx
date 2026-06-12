import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export function RestaurantList() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // States for search inputs and backend global search data tracking
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ restaurants: [], products: [] });
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch the active baseline restaurants array for initial browse mode
  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch('/api/restaurants', {
          method: 'GET',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
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

    fetchRestaurants();
  }, [token]);

  // Query the global search endpoint whenever the input field changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ restaurants: [], products: [] });
      return;
    }

    // Debounce network pipeline traffic to improve client rendering metrics
    const delayDebounceFn = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const response = await fetch(`/api/search/${encodeURIComponent(searchQuery.trim())}`, {
          method: 'GET',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        });

        const data = await response.json();
        if (response.ok) {
          setSearchResults({
            restaurants: data.restaurants || [],
            products: data.products || []
          });
        }
      } catch (err) {
        // Fallback to empty records gracefully on server timeout triggers
        setSearchResults({ restaurants: [], products: [] });
      } finally {
        setSearchLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, token]);

  // Fixed cuisine categories dynamically required by the user
  const cuisines = ['All', 'Burgers', 'Asian', 'Italian', 'Other'];

  // Client-side filtering configuration active only during general browsing mode
  const filteredRestaurants = restaurants.filter((restaurant) => {
    return selectedCuisine === 'All' || restaurant.cuisine === selectedCuisine;
  });

  if (loading) {
    return <h3 style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-main)', fontFamily: 'sans-serif' }}>Loading available restaurants...</h3>;
  }

  if (error) {
    return <div style={{ color: '#ff4d4d', textAlign: 'center', marginTop: '40px', fontWeight: 'bold' }}>{error}</div>;
  }

  const isSearching = searchQuery.trim().length > 0;

  return (
    <div style={{ padding: '20px 0' }}>
      {/* Search Input Module Row Frame */}
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
            Search Restaurants & Dishes
          </label>
          <input 
            type="text"
            placeholder="Search for restaurants or specific food items..."
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

        {/* Hide Cuisine filters dynamically when a global search query is active */}
        {!isSearching && (
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
        )}
      </div>

      {/* Conditional Rendering Layer: Server Search Mode vs Base Browse Mode */}
      {isSearching ? (
        <div>
          <h3 style={{ color: 'var(--text-main)', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
            Search Results for "{searchQuery}"
          </h3>

          {searchLoading ? (
            <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>Searching database collections...</p>
          ) : (
            <div>
              {/* SECTION A: Matching Restaurants Row Block */}
              <h4 style={{ color: '#009de0', marginTop: '24px', marginBottom: '12px' }}>
                Matching Restaurants ({searchResults.restaurants.length})
              </h4>
              {searchResults.restaurants.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No restaurants found matching criteria.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                  {searchResults.restaurants.map((restaurant) => (
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
                        style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                      />
                      <div style={{ padding: '16px' }}>
                        <h4 style={{ margin: '0 0 6px 0', color: 'var(--text-main)' }}>{restaurant.name}</h4>
                        <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                          {restaurant.cuisine || 'International'} • ⭐️ {restaurant.rating || 'N/A'}
                        </p>
                        {restaurant.distance !== undefined && (
                          <div style={{ marginBottom: '8px', display: 'inline-block', backgroundColor: '#e6f7ff', color: '#009de0', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                            📍 {restaurant.distance.toFixed(1)} km away
                          </div>
                        )}
                        <br />
                        <span style={{ color: '#009de0', fontSize: '13px', fontWeight: 'bold' }}>View Menu →</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '30px 0' }} />

              {/* SECTION B: Matching Products/Dishes Row Block */}
              <h4 style={{ color: '#009de0', marginTop: '20px', marginBottom: '12px' }}>
                Matching Dishes ({searchResults.products.length})
              </h4>
              {searchResults.products.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No specific dishes match your keyword.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {searchResults.products.map((product) => (
                    <div 
                      key={product.id || product._id}
                      onClick={() => {
                        // Navigate safely to the parent restaurant card if reference ID parameter links exist
                        if (product.restaurantId) {
                          navigate(`/restaurant/${product.restaurantId}`);
                        } else {
                          alert(`Found dish: ${product.name}. Head to its matching restaurant menu to order!`);
                        }
                      }}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '14px',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-app)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-card)'}
                    >
                      <div>
                        <h5 style={{ margin: '0 0 4px 0', color: 'var(--text-main)' }}>{product.name}</h5>
                        <p style={{ margin: '0 0 6px 0', color: 'var(--text-muted)', fontSize: '13px' }}>{product.description}</p>
                        <span style={{ color: '#009de0', fontWeight: 'bold', fontSize: '14px' }}>₪{(product.price || 0).toFixed(2)}</span>
                      </div>
                      {product.image && (
                        <img src={product.image} alt={product.name} style={{ width: '60px', height: '60px', borderRadius: '4px', objectFit: 'cover' }} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Normal Baseline Browsing Catalog Layout View */
        <div>
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', color: 'var(--text-main)' }}>
            {selectedCuisine !== 'All' ? `${selectedCuisine} Spots` : 'Popular Restaurants'} ({filteredRestaurants.length})
          </h3>
          
          {filteredRestaurants.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', marginTop: '16px' }}>No restaurants match your selected cuisine filter.</p>
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
                    <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                      {restaurant.cuisine || 'International'} • ⭐️ {restaurant.rating || 'N/A'}
                    </p>
                    {restaurant.distance !== undefined && (
                      <div style={{ marginBottom: '12px', display: 'inline-block', backgroundColor: '#e6f7ff', color: '#009de0', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>
                        📍 {restaurant.distance.toFixed(1)} km away
                      </div>
                    )}
                    <br />
                    <span style={{ color: '#009de0', fontSize: '14px', fontWeight: 'bold' }}>View Menu →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}