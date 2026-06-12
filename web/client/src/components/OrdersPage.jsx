import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { OrderCard } from './OrderCard';
import { OrderDetailModal } from './OrderDetailModal';

export function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
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
    return <h3 style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-main)', fontFamily: 'sans-serif' }}>Loading your order history...</h3>;
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
            <OrderCard 
              key={order.id || order._id} 
              order={order} 
              onViewDetails={(id) => setSelectedOrderId(id)} 
            />
          ))}
        </div>
      )}

      {selectedOrderId && (
        <OrderDetailModal 
          orderId={selectedOrderId} 
          onClose={() => setSelectedOrderId(null)} 
        />
      )}
    </div>
  );
}