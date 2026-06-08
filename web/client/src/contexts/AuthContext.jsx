import React, { createContext, useState, useEffect } from 'react';

// Create the AuthContext to be used across components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token and user data on app mount
  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    const storedUser = localStorage.getItem('user_data');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
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

  // Helper function to handle logout
  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    setToken(null);
    setUser(null);
  };

  // Provide authentication state and helpers to the application tree
  return (
    <AuthContext.Provider value={{ token, user, login, logout, isAuthenticated: !!token, loading }}>
      {children}
    </AuthContext.Provider>
  );
}