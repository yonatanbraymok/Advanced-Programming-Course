import React, { useState, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

function RegisterPage() {
  // Controlled form state fields
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [locationX, setLocationX] = useState('');
  const [locationY, setLocationY] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [step, setStep] = useState(1);
  
  // State for storing the base64 image data string
  const [profileImage, setProfileImage] = useState('');
  
  // Validation and server errors state holding messages
  const [errors, setErrors] = useState({});
  
  // Success state flag to control post-registration visual confirmation banner
  const [isSuccess, setIsSuccess] = useState(false);
  
  // React useRef hook to interact with the hidden file input element
  const fileInputRef = useRef(null);
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Handle image selection and conversion to base64 data string
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger click on the hidden input field using the useRef token reference
  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Validate fields according to the assignment hardening specifications
  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Username is required';
    }

    if (!displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^\+?[0-9]{9,15}$/;
      if (!phoneRegex.test(phone)) {
        newErrors.phone = 'Please enter a valid phone number (e.g., +972501234567)';
      }
    }

    if (role === 'customer') {
      if (locationX === '' || isNaN(Number(locationX))) {
        newErrors.locationX = 'Valid X coordinate is required';
      }

      if (locationY === '' || isNaN(Number(locationY))) {
        newErrors.locationY = 'Valid Y coordinate is required';
      }
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(password)) {
      newErrors.password = 'Password must be at least 8 characters long and include uppercase, lowercase, and a digit';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle asynchronous form submission to the Express REST API
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    if (!validateForm()) {
      return;
    }

    // Fallback to a default safe Wolt-styled blue W avatar if left blank
    const defaultWoltAvatar = 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23009de0%22/><text x=%2250%22 y=%2265%22 font-family=%22Arial, sans-serif%22 font-size=%2245%22 font-weight=%22bold%22 fill=%22white%22 text-anchor=%22middle%22>W</text></svg>';

    const payload = {
      username: username.trim(),
      password: password,
      name: displayName.trim(),
      phone: phone.trim(),
      profileImage: profileImage || defaultWoltAvatar,
      role: role
    };

    if (role === 'customer') {
      payload.location = {
        x: Number(locationX),
        y: Number(locationY)
      };
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ server: data.error || 'Registration failed. Please try again.' });
        return;
      }

      // Automatically log the user in after successful registration
      try {
        const loginResponse = await fetch('/api/tokens', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: payload.username, password: payload.password })
        });
        const loginData = await loginResponse.json();
        if (loginResponse.ok && loginData.token && loginData.user) {
          login(loginData.token, loginData.user);
        }
      } catch (err) {
        // Fallback to manual login if auto-login fails gracefully
      }

      setIsSuccess(true);
      
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (err) {
      setErrors({ server: 'Network error. Cannot connect to the server backend.' });
    }
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '60px auto',
      padding: '30px',
      fontFamily: 'sans-serif',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      borderRadius: '8px',
      backgroundColor: 'var(--bg-card)',
      color: 'var(--text-main)',
      transition: 'background-color 0.3s ease, color 0.3s ease'
    }}>
      <h2 style={{ color: '#009de0', textAlign: 'center', marginBottom: '24px' }}>Create Wolt Account</h2>
      
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

      {isSuccess && (
        <div style={{
          backgroundColor: '#e6f7ed',
          color: '#2e7d32',
          padding: '12px',
          borderRadius: '4px',
          marginBottom: '16px',
          fontSize: '14px',
          border: '1px solid #2e7d32',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          Registration successful! Redirecting to Dashboard... 🚀
        </div>
      )}

      <form onSubmit={handleSubmit} autoComplete="off">
        {step === 1 ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>I am registering as a...</label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div 
                  onClick={() => !isSuccess && setRole('customer')}
                  style={{
                    flex: 1,
                    padding: '16px',
                    textAlign: 'center',
                    borderRadius: '8px',
                    border: role === 'customer' ? '2px solid #009de0' : '2px solid var(--border-color)',
                    backgroundColor: role === 'customer' ? 'rgba(0,157,224,0.05)' : 'var(--bg-app)',
                    cursor: isSuccess ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>👤</span>
                  <span style={{ fontWeight: 'bold', color: role === 'customer' ? '#009de0' : 'var(--text-main)', fontSize: '14px' }}>Customer</span>
                </div>
                <div 
                  onClick={() => !isSuccess && setRole('restaurant_owner')}
                  style={{
                    flex: 1,
                    padding: '16px',
                    textAlign: 'center',
                    borderRadius: '8px',
                    border: role === 'restaurant_owner' ? '2px solid #009de0' : '2px solid var(--border-color)',
                    backgroundColor: role === 'restaurant_owner' ? 'rgba(0,157,224,0.05)' : 'var(--bg-app)',
                    cursor: isSuccess ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🏪</span>
                  <span style={{ fontWeight: 'bold', color: role === 'restaurant_owner' ? '#009de0' : 'var(--text-main)', fontSize: '14px' }}>Restaurant Owner</span>
                </div>
              </div>
            </div>
            
            <button 
              type="button" 
              onClick={() => setStep(2)}
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
              Continue to Details
            </button>
          </div>
        ) : (
          <div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Username</label>
          <input 
            type="text" 
            placeholder="Enter a Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isSuccess}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: errors.username ? '1px solid #ff4d4d' : '1px solid var(--border-color)', 
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-main)',
              boxSizing: 'border-box',
              transition: 'background-color 0.3s ease, color 0.3s ease'
            }}
          />
          {errors.username && <span style={{ color: '#ff4d4d', fontSize: '13px', display: 'block', marginTop: '4px' }}>{errors.username}</span>}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Display Name</label>
          <input 
            type="text" 
            placeholder="Enter a Display Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            disabled={isSuccess}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: errors.displayName ? '1px solid #ff4d4d' : '1px solid var(--border-color)', 
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-main)',
              boxSizing: 'border-box',
              transition: 'background-color 0.3s ease, color 0.3s ease'
            }}
          />
          {errors.displayName && <span style={{ color: '#ff4d4d', fontSize: '13px', display: 'block', marginTop: '4px' }}>{errors.displayName}</span>}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Phone Number</label>
          <input 
            type="tel" 
            placeholder="+972501234567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isSuccess}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: errors.phone ? '1px solid #ff4d4d' : '1px solid var(--border-color)', 
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-main)',
              boxSizing: 'border-box',
              transition: 'background-color 0.3s ease, color 0.3s ease',
              fontFamily: 'monospace',
              fontSize: '16px',
              letterSpacing: '1px'
            }}
          />
          {errors.phone && <span style={{ color: '#ff4d4d', fontSize: '13px', display: 'block', marginTop: '4px' }}>{errors.phone}</span>}
        </div>

        {role === 'customer' && (
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Location (X)</label>
            <input 
              type="number" 
              step="any"
              name="locationX"
              autoComplete="nope"
              placeholder="X Coordinate"
              value={locationX}
              onChange={(e) => setLocationX(e.target.value)}
              disabled={isSuccess}
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '4px', 
                border: errors.locationX ? '1px solid #ff4d4d' : '1px solid var(--border-color)', 
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-main)',
                boxSizing: 'border-box',
                transition: 'background-color 0.3s ease, color 0.3s ease'
              }}
            />
            {errors.locationX && <span style={{ color: '#ff4d4d', fontSize: '13px', display: 'block', marginTop: '4px' }}>{errors.locationX}</span>}
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Location (Y)</label>
            <input 
              type="number" 
              step="any"
              name="locationY"
              autoComplete="nope"
              placeholder="Y Coordinate"
              value={locationY}
              onChange={(e) => setLocationY(e.target.value)}
              disabled={isSuccess}
              style={{ 
                width: '100%', 
                padding: '10px', 
                borderRadius: '4px', 
                border: errors.locationY ? '1px solid #ff4d4d' : '1px solid var(--border-color)', 
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-main)',
                boxSizing: 'border-box',
                transition: 'background-color 0.3s ease, color 0.3s ease'
              }}
            />
            {errors.locationY && <span style={{ color: '#ff4d4d', fontSize: '13px', display: 'block', marginTop: '4px' }}>{errors.locationY}</span>}
          </div>
        </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          {/* Dummy hidden input to absorb Chrome's aggressive password manager heuristic */}
          <input type="text" name="fakeusernameremembered" style={{ position: 'absolute', opacity: 0, height: 0, width: 0, border: 'none', pointerEvents: 'none' }} tabIndex="-1" aria-hidden="true" />
          
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Password</label>
          <input 
            type="password" 
            autoComplete="new-password"
            placeholder="Min 8 chars, 1 uppercase, 1 digit"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSuccess}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: errors.password ? '1px solid #ff4d4d' : '1px solid var(--border-color)', 
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-main)',
              boxSizing: 'border-box',
              transition: 'background-color 0.3s ease, color 0.3s ease'
            }}
          />
          {errors.password && <span style={{ color: '#ff4d4d', fontSize: '13px', display: 'block', marginTop: '4px' }}>{errors.password}</span>}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: 'bold' }}>Confirm Password</label>
          <input 
            type="password" 
            autoComplete="new-password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSuccess}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '4px', 
              border: errors.confirmPassword ? '1px solid #ff4d4d' : '1px solid var(--border-color)', 
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-main)',
              boxSizing: 'border-box',
              transition: 'background-color 0.3s ease, color 0.3s ease'
            }}
          />
          {errors.confirmPassword && <span style={{ color: '#ff4d4d', fontSize: '13px', display: 'block', marginTop: '4px' }}>{errors.confirmPassword}</span>}
        </div>

        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <label style={{ display: 'block', marginBottom: '2px', fontWeight: 'bold', textAlign: 'left' }}>Profile Photo</label>
          <span style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'left' }}>Optional - a default avatar will be assigned if left blank</span>
          <input 
            type="file" 
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            disabled={isSuccess}
            style={{ display: 'none' }}
          />

          {profileImage ? (
            <div style={{ marginBottom: '12px' }}>
              <img 
                src={profileImage} 
                alt="Profile Preview" 
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #009de0' }} 
              />
            </div>
          ) : null}

          <button 
            type="button" 
            onClick={triggerFileSelect}
            disabled={isSuccess}
            style={{
              padding: '8px 16px',
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              cursor: isSuccess ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              transition: 'background-color 0.3s ease, color 0.3s ease'
            }}
          >
            {profileImage ? 'Change Photo' : 'Select Profile Photo'}
          </button>
        </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button" 
                onClick={() => setStep(1)}
                disabled={isSuccess}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-main)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isSuccess ? 'not-allowed' : 'pointer'
                }}
              >
                Back
              </button>
              <button 
                type="submit" 
                disabled={isSuccess}
                style={{
                  flex: 2,
                  padding: '12px',
                  backgroundColor: isSuccess ? '#b3e0f5' : '#009de0',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: isSuccess ? 'not-allowed' : 'pointer'
                }}
              >
                {isSuccess ? 'Registering...' : 'Complete Registration'}
              </button>
            </div>
          </div>
        )}
      </form>
      
      <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '14px', color: 'var(--text-muted)' }}>
        Already have an account? <span style={{ color: '#009de0', cursor: 'pointer' }} onClick={() => !isSuccess && navigate('/login')}>Login</span>
      </p>
    </div>
  );
}
export { RegisterPage };