import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export function EditProfilePage() {
  const { user, token, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    locX: 0,
    locY: 0,
    profileImage: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const defaultWoltAvatar = 'data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%22100%22 height=%22100%22 viewBox=%220 0 100 100%22><circle cx=%2250%22 cy=%2250%22 r=%2250%22 fill=%22%23009de0%22/><text x=%2250%22 y=%2265%22 font-family=%22Arial, sans-serif%22 font-size=%2245%22 font-weight=%22bold%22 fill=%22white%22 text-anchor=%22middle%22>W</text></svg>';

  useEffect(() => {
    // If not logged in, redirect home
    if (!user) {
      navigate('/');
      return;
    }

    // Pre-fill form from user context (which is already loaded)
    setFormData(prev => ({
      ...prev,
      username: user.username || '',
      name: user.name || '',
      phone: user.phone || '',
      locX: user.location?.x || 0,
      locY: user.location?.y || 0,
      profileImage: user.profileImage || ''
    }));

    // Optionally fetch /me to get fresh data including location and phone
    fetch('/api/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.json())
    .then(data => {
      if (!data.error) {
        setFormData(prev => ({
          ...prev,
          username: data.username || '',
          name: data.name || '',
          phone: data.phone || '',
          locX: data.location?.x || 0,
          locY: data.location?.y || 0,
          profileImage: data.profileImage || ''
        }));
      }
    })
    .catch(console.error);

  }, [user, navigate, token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const payload = {
      username: formData.username,
      name: formData.name,
      phone: formData.phone,
      profileImage: formData.profileImage,
      location: {
        x: Number(formData.locX) || 0,
        y: Number(formData.locY) || 0
      }
    };

    if (formData.password) {
      payload.password = formData.password;
    }

    try {
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (response.ok) {
        setSuccess('Profile updated successfully!');
        // Update the context so the navbar reflects the new name/image instantly
        updateUser({
          ...user,
          username: data.username,
          name: data.name,
          profileImage: data.profileImage
        });
      } else {
        setError(data.error || 'Update failed');
      }
    } catch (err) {
      setError('Network error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-app)', minHeight: '100vh', color: 'var(--text-main)', fontFamily: 'sans-serif', paddingBottom: '40px' }}>
      <main style={{ maxWidth: '600px', margin: '40px auto', padding: '0 20px' }}>
        <div style={{ 
          backgroundColor: 'var(--bg-card)', 
          padding: '40px', 
          borderRadius: '16px', 
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid var(--border-color)'
        }}>
          <h2 style={{ color: '#009de0', textAlign: 'center', marginBottom: '30px', fontSize: '28px' }}>
            Edit Profile
          </h2>

          {error && (
            <div style={{ backgroundColor: '#fee2e2', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ backgroundColor: '#dcfce7', color: '#22c55e', padding: '12px', borderRadius: '8px', marginBottom: '20px', textAlign: 'center', fontWeight: 'bold' }}>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
              <img 
                src={formData.profileImage || defaultWoltAvatar} 
                alt="Avatar Preview" 
                style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #009de0', backgroundColor: '#009de0' }}
              />
              <div style={{ marginTop: '10px' }}>
                <input 
                  type="file" 
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <button 
                  type="button" 
                  onClick={triggerFileSelect}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    transition: 'background-color 0.3s ease, color 0.3s ease'
                  }}
                >
                  Change Photo
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-secondary)' }}>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-secondary)' }}>Display Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-secondary)' }}>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+972501234567"
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  fontSize: '16px',
                  fontFamily: 'monospace',
                  letterSpacing: '1px'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-secondary)' }}>Location X</label>
                <input
                  type="number"
                  name="locX"
                  value={formData.locX}
                  onChange={handleChange}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '16px'
                  }}
                />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-secondary)' }}>Location Y</label>
                <input
                  type="number"
                  name="locY"
                  value={formData.locY}
                  onChange={handleChange}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-app)',
                    color: 'var(--text-main)',
                    fontSize: '16px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-secondary)' }}>New Password (leave blank to keep current)</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 chars, 1 uppercase, 1 digit"
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  fontSize: '16px'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text-secondary)' }}>Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  fontSize: '16px'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '10px',
                padding: '16px',
                backgroundColor: '#009de0',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.2s ease'
              }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
