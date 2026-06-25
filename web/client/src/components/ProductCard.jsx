import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export function ProductCard({ item, restaurantId, onAddToCart }) {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleAddClick = () => {
    if (!token) {
      const confirmLogin = window.confirm("You must be logged in to order. Would you like to log in now?");
      if (confirmLogin) {
        navigate('/login');
      }
      return;
    }
    onAddToCart(restaurantId, item);
  };
  return (
    <div 
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
      
      <img 
        src={item.image || 'https://blogs.biomedcentral.com/on-medicine/wp-content/uploads/sites/6/2019/09/iStock-1131794876.t5d482e40.m800.xtDADj9SvTVFjzuNeGuNUUGY4tm5d6UGU5tkKM0s3iPk-620x342.jpg'} 
        alt={item.name} 
        style={{ width: '80px', height: '80px', borderRadius: '6px', objectFit: 'cover' }}
      />
      <button 
        onClick={handleAddClick}
        style={{
          marginLeft: '16px',
          padding: '8px 16px',
          backgroundColor: '#009de0',
          color: 'white',
          border: 'none',
          borderRadius: '20px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
          transition: 'background-color 0.2s ease'
        }}
      >
        + Add
      </button>
    </div>
  );
}
