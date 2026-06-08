import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export function LoginPage() {
  // Controlled fields for user credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // State for tracking client or server side validation errors
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Consume the global login trigger from our AuthContext infrastructure
  const { login } = useContext(AuthContext);
  
  const navigate = useNavigate();

  // Basic client side validation before reaching out to the API backend
  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle authentication form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Hit the tokens endpoint to verify credentials and receive a JWT
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Capture invalid credentials or backend exceptions gracefully
        setErrors({ server: data.error || 'Invalid username or password' });
        setLoading(false);
        return;
      }

      // Save token and user details to global state and localStorage via the context hook
      login(data.token, data.user);
      
      // Redirect authenticated session directly back to the app main dashboard
      navigate('/');

    } catch (err) {
      setErrors({ server: 'Network error. Could not establish backend connection.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '80px auto',
      padding: '30px',
      fontFamily: 'sans-serif',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      backgroundColor: '#ffffff'
    }}>
      <h2 style={{ color: '#009de0', textAlign: 'center', marginBottom: '24px' }}>Login to Wolt</h2>

      {/* Server Error Message Alert Block */}
      {errors.server && (
        <div style={{
          backgroundColor: '#ffe6e6',
          color: '#ff4d4d',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '16px',
          fontSize: '14px',
          border: '1px solid #ff4d4d',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          {errors.server}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Username Field */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Username</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: errors.username ? '1px solid #ff4d4d' : '1px solid #ccc', 
              boxSizing: 'border-box' 
            }}
          />
          {errors.username && <span style={{ color: '#ff4d4d', fontSize: '13px', display: 'block', marginTop: '4px' }}>{errors.username}</span>}
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: errors.password ? '1px solid #ff4d4d' : '1px solid #ccc', 
              boxSizing: 'border-box' 
            }}
          />
          {errors.password && <span style={{ color: '#ff4d4d', fontSize: '13px', display: 'block', marginTop: '4px' }}>{errors.password}</span>}
        </div>

        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#b3e0f5' : '#009de0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px' }}>
        New to Wolt? <span style={{ color: '#009de0', cursor: 'pointer' }} onClick={() => navigate('/register')}>Create an account</span>
      </p>
    </div>
  );
}