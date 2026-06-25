import React, { createContext, useState, useEffect } from 'react';

// Create the AuthContext to be used across components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token and user data on app mount with defensive guarding
  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    const storedUser = localStorage.getItem('user_data');

    // Hardened check to ensure storedUser is neither null nor the string literal undefined
    if (storedToken && storedUser && storedUser !== 'undefined') {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        // Clear corrupted storage items gracefully if parsing fails
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
      }
    }
    setLoading(false);
  }, []);

  // Helper function to handle login success
  const login = (jwtToken, userData) => {
    localStorage.setItem('jwt_token', jwtToken);
    localStorage.setItem('user_data', JSON.stringify(userData));
    setToken(jwtToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
  };

  const updateUser = (newUserData) => {
    localStorage.setItem('user_data', JSON.stringify(newUserData));
    setUser(newUserData);
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
}