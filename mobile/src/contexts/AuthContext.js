import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext();

const API_BASE_URL = 'http://10.0.2.2:3000/api';

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored token on app load
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        if (token) {
          setUserToken(token);
        }
      } catch (e) {
        console.error('Error restoring token', e);
      }
      setIsLoading(false);
    };

    bootstrapAsync();
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();

      if (response.ok && data.token) {
        await SecureStore.setItemAsync('userToken', data.token);
        setUserToken(data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Network error connecting to server.' };
    }
  };

  const register = async (userData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await response.json();

      if (response.ok) {
        // Registration successful! The API doesn't return a token on register,
        // so we automatically call the login endpoint to authenticate them.
        return await login(userData.username, userData.password);
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Network error connecting to server.' };
    }
  };

  const logout = async () => {
    try {
      await SecureStore.deleteItemAsync('userToken');
      setUserToken(null);
    } catch (e) {
      console.error('Error deleting token', e);
    }
  };

  return (
    <AuthContext.Provider value={{ login, logout, register, userToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
