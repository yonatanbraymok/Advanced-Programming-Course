import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';

export function OrderDetailModal({ orderId, onClose }) {
  const { token } = useContext(AuthContext);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch order details');
        }
        
        setOrderDetails(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (orderId && token) {
      fetchOrderDetails();
    }
  }, [orderId, token]);

  if (!orderId) return null;

  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 2000,
        backdropFilter: 'blur(4px)',
        fontFamily: 'sans-serif'
      }}
      onClick={onClose}
    >
      <div 
        style={{
          backgroundColor: 'var(--bg-card)',
          padding: '30px',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '500px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Order Details</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '28px', cursor: 'pointer', color: 'var(--text-muted)' }}>&times;</button>
        </div>

        {loading && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>Loading items...</p>}
        {error && <p style={{ color: '#ff4d4d', fontWeight: 'bold', padding: '20px', backgroundColor: 'rgba(255,77,77,0.1)', borderRadius: '8px' }}>{error}</p>}

        {orderDetails && !loading && !error && (
          <div>
            <div style={{ marginBottom: '25px', padding: '15px', backgroundColor: 'var(--bg-app)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
               <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>Order ID: <span style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>#{orderDetails.id}</span></p>
               <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)' }}>Status: <span style={{ color: '#009de0', fontWeight: 'bold', textTransform: 'capitalize' }}>{orderDetails.status || 'Processing'}</span></p>
               <p style={{ margin: 0, color: 'var(--text-muted)' }}>Date: <span style={{ color: 'var(--text-main)' }}>{new Date(orderDetails.createdAt).toLocaleString()}</span></p>
            </div>

            <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '10px', color: 'var(--text-main)', marginBottom: '15px' }}>Items Ordered</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orderDetails.items && orderDetails.items.map((item, index) => (
                <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-main)', fontSize: '15px' }}>{item.name || 'Menu Item'}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ fontWeight: 'bold', color: '#009de0' }}>
                    ₪{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', paddingTop: '15px', borderTop: '2px solid var(--border-color)' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)' }}>Total</span>
              <span style={{ fontSize: '28px', fontWeight: 'black', color: '#009de0' }}>₪{(orderDetails.totalPrice || 0).toFixed(2)}</span>
            </div>
            
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '14px',
                marginTop: '30px',
                backgroundColor: '#009de0',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
