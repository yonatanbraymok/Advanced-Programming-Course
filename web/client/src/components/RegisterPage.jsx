import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function RegisterPage() {
  // Controlled form state fields
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Validation errors state holding error messages for each field
  const [errors, setErrors] = useState({});
  
  const navigate = useNavigate();

  // Validate fields according to the assignment hardening specifications
  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    // Display name validation
    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    // Password strength check: minimum 8 characters, uppercase, lowercase, and a digit
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(password)) {
      newErrors.password = 'Password must be at least 8 characters long and include uppercase, lowercase, and a digit';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    // Returns true only if there are no validation errors detected
    return Object.keys(newErrors).length === 0;
  };

  // Handle local form submission event with validation guarding
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Blocks submission if any field fails client side validation metrics
      return;
    }

    // Form is completely valid on client side, ready for the next subtasks
    console.log('Form is valid. Ready to register:', { username, displayName });
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
        {/* Username Field */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Username</label>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

        {/* Display Name Field */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Display Name</label>
          <input 
            type="text" 
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: errors.displayName ? '1px solid #ff4d4d' : '1px solid #ccc', 
              boxSizing: 'border-box' 
            }}
          />
          {errors.displayName && <span style={{ color: '#ff4d4d', fontSize: '13px', display: 'block', marginTop: '4px' }}>{errors.displayName}</span>}
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

        {/* Confirm Password Field */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Confirm Password</label>
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: errors.confirmPassword ? '1px solid #ff4d4d' : '1px solid #ccc', 
              boxSizing: 'border-box' 
            }}
          />
          {errors.confirmPassword && <span style={{ color: '#ff4d4d', fontSize: '13px', display: 'block', marginTop: '4px' }}>{errors.confirmPassword}</span>}
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