import React from 'react';

export function OrderCard({ order, onViewDetails }) {
  return (
    <div 
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

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px' }}>
        <div>
          <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'block' }}>Total Amount</span>
          <span style={{ fontSize: '18px', fontWeight: 'bold', color: '#009de0' }}>
            ₪{(order.totalPrice || 0).toFixed(2)}
          </span>
        </div>
        <button
          onClick={() => onViewDetails(order.id || order._id)}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--bg-app)',
            color: '#009de0',
            border: '1px solid #009de0',
            borderRadius: '6px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease, color 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#009de0';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--bg-app)';
            e.currentTarget.style.color = '#009de0';
          }}
        >
          View Details
        </button>
      </div>
    </div>
  );
}
