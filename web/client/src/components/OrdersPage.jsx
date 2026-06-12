import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Fetch all orders associated with the currently authenticated user session
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to retrieve order logs');
          setLoading(false);
          return;
        }

        setOrders(Array.isArray(data) ? data : data.orders || []);
      } catch (err) {
        setError('Network error. Failed to connect to the orders API backend.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchOrders();
    }
  }, [token]);

  if (loading) {
    return <h3 style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-main)' }}>Loading your order history...</h3>;
  }

  return (
    <div style={{ padding: '30px', fontFamily: 'sans-serif', maxWidth: '750px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ color: 'var(--text-main)', margin: 0, transition: 'color 0.3s ease' }}>Your Orders 📦</h2>
        <button 
          type="button"
          onClick={() => navigate('/')}
          style={{
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
          ← Back to Shopping
        </button>
      </div>

      {error && <p style={{ color: '#ff4d4d', fontWeight: 'bold', textAlign: 'center' }}>{error}</p>}

      {orders.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          marginTop: '20px',
          transition: 'background-color 0.3s ease, border-color 0.3s ease'
        }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', margin: '0 0 16px 0' }}>You haven't placed any orders yet.</p>
          <button 
            type="button" 
            onClick={() => navigate('/')}
            style={{ padding: '10px 20px', backgroundColor: '#009de0', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Explore Restaurants
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {orders.map((order) => (
            <div 
              key={order.id || order._id}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '20px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                transition: 'background-color 0.3s ease, border-color 0.3s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block' }}>ORDER ID</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '14px' }}>#{order.id || order._id}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ 
                    padding: '4px 12px', 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    backgroundColor: order.status === 'completed' ? '#e6f7ed' : '#fff3cd',
                    color: order.status === 'completed' ? '#2e7d32' : '#856404'
                  }}>
                    {order.status || 'processing'}
                  </span>
                </div>
              </div>

              {/* Order Items List Breakdown Nested Segment */}
              <div style={{ marginBottom: '16px' }}>
                {order.items && order.items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-main)', marginBottom: '6px' }}>
                    <span>{item.quantity}x {item.name || 'Menu Product Item'}</span>
                    <span style={{ color: 'var(--text-muted)' }}>₪{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>Total Amount</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#009de0' }}>
                  ₪{(order.totalPrice || 0).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}