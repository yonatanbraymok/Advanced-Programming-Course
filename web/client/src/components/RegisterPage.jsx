import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export function RegisterPage() {
  // Controlled form state fields
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // State for storing the base64 image data string for live preview and upload
  const [profileImage, setProfileImage] = useState('');
  
  // Validation errors state holding error messages for each field
  const [errors, setErrors] = useState({});
  
  // React useRef hook to interact directly with the hidden file input element
  const fileInputRef = useRef(null);
  
  const navigate = useNavigate();

  // Handle image selection and conversion to base64 data string
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Sets the base64 string state once file reading is fully complete
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

    // Ensure a profile photo has been uploaded by the user
    if (!profileImage) {
      newErrors.profileImage = 'A profile image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Form data is fully verified including the image string metadata
    console.log('Form is completely valid:', { username, displayName, profileImageLength: profileImage.length });
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
        <div style={{ marginBottom: '16px' }}>
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

        {/* Photo File Picker with useRef and Live Preview */}
        <div style={{ marginBottom: '24px', textAlign: 'center' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', textAlign: 'left' }}>Profile Photo</label>
          
          {/* Hidden HTML input file element mapped to fileInputRef */}
          <input 
            type="file" 
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageChange}
            style={{ display: 'none' }}
          />

          {/* Conditional rendering for live profile photo image preview */}
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
            style={{
              padding: '8px 16px',
              backgroundColor: '#f2f2f2',
              color: '#333',
              border: errors.profileImage ? '1px solid #ff4d4d' : '1px solid #ccc',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {profileImage ? 'Change Photo' : 'Select Profile Photo'}
          </button>
          {errors.profileImage && <span style={{ color: '#ff4d4d', fontSize: '13px', display: 'block', marginTop: '4px' }}>{errors.profileImage}</span>}
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