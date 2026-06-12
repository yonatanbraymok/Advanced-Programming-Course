import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';

export function CartSidebar({ isOpen, onClose }) {
  const { cartItems, restaurantId, removeFromCart, updateQuantity, clearCart, cartTotal } = useContext(CartContext);
  const { token } = useContext(AuthContext);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          restaurantId: restaurantId,
          items: cartItems.map(item => ({
            productId: item.product.id || item.product._id,
            quantity: item.quantity
          }))
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order');
      }

      clearCart();
      onClose();
      navigate('/orders');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      width: '100%',
      maxWidth: '400px',
      height: '100vh',
      backgroundColor: 'var(--bg-card)',
      boxShadow: '-4px 0 15px rgba(0,0,0,0.1)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      transition: 'transform 0.3s ease',
      borderLeft: '1px solid var(--border-color)',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Your Cart 🛒</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-main)' }}>&times;</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {error && <div style={{ color: '#ff4d4d', marginBottom: '15px', fontWeight: 'bold' }}>{error}</div>}
        
        {cartItems.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px' }}>Your cart is empty.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {cartItems.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '15px', borderBottom: '1px solid var(--border-color)' }}>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-main)' }}>{item.product.name}</h4>
                  <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>₪{(item.product.price).toFixed(2)}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button onClick={() => updateQuantity(item.product.id || item.product._id, item.quantity - 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #ccc', background: 'var(--bg-app)', color: 'var(--text-main)', cursor: 'pointer' }}>-</button>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id || item.product._id, item.quantity + 1)} style={{ width: '28px', height: '28px', borderRadius: '50%', border: '1px solid #ccc', background: 'var(--bg-app)', color: 'var(--text-main)', cursor: 'pointer' }}>+</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {cartItems.length > 0 && (
        <div style={{ padding: '20px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)' }}>
            <span>Total:</span>
            <span>₪{cartTotal.toFixed(2)}</span>
          </div>
          <button 
            onClick={handleCheckout} 
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '15px',
              backgroundColor: '#009de0',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1
            }}
          >
            {isSubmitting ? 'Processing...' : 'Checkout'}
          </button>
        </div>
      )}
    </div>
  );
}
