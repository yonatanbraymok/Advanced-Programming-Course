import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function RestaurantEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const isEditMode = Boolean(id);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [locationX, setLocationX] = useState('');
  const [locationY, setLocationY] = useState('');
  const [image, setImage] = useState('');
  
  const [menu, setMenu] = useState([]);

  const [loading, setLoading] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchRestaurant = async () => {
        try {
          const response = await fetch(`/api/restaurants/${id}`);
          if (!response.ok) throw new Error('Failed to load restaurant');
          const data = await response.json();
          
          setName(data.name || '');
          setDescription(data.description || '');
          setCuisine(data.cuisine || '');
          setLocationX(data.location?.x ?? '');
          setLocationY(data.location?.y ?? '');
          setImage(data.image || '');
          setMenu(data.menu || []);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      fetchRestaurant();
    }
  }, [id, isEditMode]);

  const handleAddMenuItem = () => {
    setMenu([...menu, {
      id: 'prod_temp_' + Date.now(),
      name: '',
      description: '',
      price: '',
      image: ''
    }]);
  };

  const handleMenuChange = (index, field, value) => {
    const updatedMenu = [...menu];
    updatedMenu[index][field] = value;
    setMenu(updatedMenu);
  };

  const handleRemoveMenuItem = (index) => {
    const updatedMenu = [...menu];
    updatedMenu.splice(index, 1);
    setMenu(updatedMenu);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    // Format menu items
    const formattedMenu = menu.map(item => ({
      ...item,
      price: Number(item.price) || 0
    }));

    const payload = {
      name,
      description,
      cuisine,
      location: { x: Number(locationX), y: Number(locationY) },
      image,
      menu: formattedMenu
    };

    try {
      const url = isEditMode ? `/api/restaurants/${id}` : '/api/restaurants';
      const method = isEditMode ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save restaurant');
      }

      navigate('/owner/restaurants');
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-main)' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif', color: 'var(--text-main)' }}>
      <button 
        onClick={() => navigate('/owner/restaurants')}
        style={{ marginBottom: '20px', padding: '8px 16px', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer' }}
      >
        ← Back to My Restaurants
      </button>

      <h2 style={{ marginBottom: '24px' }}>{isEditMode ? 'Edit Restaurant' : 'Create New Restaurant'}</h2>

      {error && <div style={{ padding: '12px', backgroundColor: '#ffe6e6', color: '#ff4d4d', borderRadius: '4px', marginBottom: '24px', fontWeight: 'bold' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ backgroundColor: 'var(--bg-card)', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
        
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#009de0' }}>Basic Details</h3>
        
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Restaurant Name *</label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', boxSizing: 'border-box' }} />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Description</label>
          <textarea rows="3" value={description} onChange={e => setDescription(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', boxSizing: 'border-box', fontFamily: 'inherit' }} />
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Cuisine</label>
            <select value={cuisine} onChange={e => setCuisine(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', boxSizing: 'border-box' }}>
              <option value="Burgers">Burgers</option>
              <option value="Asian">Asian</option>
              <option value="Italian">Italian</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Header Image URL</label>
            <input type="url" value={image} onChange={e => setImage(e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', boxSizing: 'border-box' }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '32px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Location (X)</label>
            <input type="number" step="any" value={locationX} onChange={e => setLocationX(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', boxSizing: 'border-box' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Location (Y)</label>
            <input type="number" step="any" value={locationY} onChange={e => setLocationY(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', boxSizing: 'border-box' }} />
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '32px 0' }} />

        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#009de0' }}>Menu Items</h3>
        
        {menu.map((item, index) => (
          <div key={index} style={{ backgroundColor: 'var(--bg-app)', padding: '20px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ margin: 0 }}>Meal #{index + 1}</h4>
              <button type="button" onClick={() => handleRemoveMenuItem(index)} style={{ padding: '4px 8px', backgroundColor: '#ff4d4d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Remove</button>
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Meal Name</label>
                <input type="text" required value={item.name} onChange={e => handleMenuChange(index, 'name', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', boxSizing: 'border-box' }} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Price (₪)</label>
                <input type="number" required step="0.01" min="0" value={item.price} onChange={e => handleMenuChange(index, 'price', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', boxSizing: 'border-box' }} />
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Description</label>
              <input type="text" value={item.description} onChange={e => handleMenuChange(index, 'description', e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', boxSizing: 'border-box' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: 'bold' }}>Image URL</label>
              <input type="url" value={item.image} onChange={e => handleMenuChange(index, 'image', e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', boxSizing: 'border-box' }} />
            </div>
          </div>
        ))}

        <button 
          type="button" 
          onClick={handleAddMenuItem}
          style={{ width: '100%', padding: '12px', backgroundColor: 'var(--bg-app)', color: '#009de0', border: '2px dashed #009de0', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '32px' }}
        >
          <span>+ Add Meal</span>
        </button>

        <button 
          type="submit" 
          disabled={saving}
          style={{ width: '100%', padding: '16px', backgroundColor: '#009de0', color: 'white', border: 'none', borderRadius: '8px', cursor: saving ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '18px', boxShadow: '0 4px 12px rgba(0,157,224,0.3)' }}
        >
          {saving ? 'Saving...' : 'Save Restaurant'}
        </button>

      </form>
    </div>
  );
}

export { RestaurantEditor };
