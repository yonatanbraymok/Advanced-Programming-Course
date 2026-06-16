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
      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username: username.trim(), password })
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ server: data.error || 'Invalid username or password' });
        setLoading(false);
        return;
      }

      login(data.token, data.user);
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
      backgroundColor: 'var(--bg-card)',
      color: 'var(--text-main)',
      transition: 'background-color 0.3s ease, color 0.3s ease'
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
        <div className="floating-label-group">
          <input
            type="text"
            className={`floating-input ${errors.username ? 'error' : ''}`}
            placeholder=" "
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
          />
          <label className="floating-label">Username</label>
          {errors.username && <span style={{ color: '#ff4d4d', fontSize: '13px', display: 'block', marginTop: '4px' }}>{errors.username}</span>}
        </div>

        {/* Password Field */}
        <div className="floating-label-group">
          <input
            type="password"
            className={`floating-input ${errors.password ? 'error' : ''}`}
            placeholder=" "
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />
          <label className="floating-label">Password</label>
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

      <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
        New to Wolt? <span style={{ color: '#009de0', cursor: 'pointer' }} onClick={() => navigate('/register')}>Create an account</span>
      </p>
    </div>
  );
}