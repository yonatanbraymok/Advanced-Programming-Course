import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function RegisterPage() {
  // Controlled form state fields
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const navigate = useNavigate();

  // Handle local form submission event
  const handleSubmit = (e) => {
    e.preventDefault();
    // Logic for validation and API submission will be injected in the next subtasks
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '60px auto',
      padding: '30px',
      fontFamily: 'sans-serif',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      backgroundColor: '#ffffff'
    }}>
      <h2 style={{ color: '#009de0', textAlign: 'center', marginBottom: '24px' }}>Create Wolt Account</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Username</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Display Name</label>
          <input 
            type="text" 
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Confirm Password</label>
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
        </div>

        <button 
          type="submit" 
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#009de0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Next Step
        </button>
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
        Already have an account? <span style={{ color: '#009de0', cursor: 'pointer' }} onClick={() => navigate('/login')}>Login</span>
      </p>
    </div>
  );
}