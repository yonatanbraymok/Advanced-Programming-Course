import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

export const AuthContext = createContext();

const API_BASE_URL = 'http://10.0.2.2:3000/api';

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored token on app load
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const storedUser = await SecureStore.getItemAsync('userData');
        if (token) {
          setUserToken(token);
          if (storedUser) {
            try { setUserData(JSON.parse(storedUser)); } catch(e) {}
          } else {
            try {
              const res = await fetch(`${API_BASE_URL}/users/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (res.ok) {
                const u = await res.json();
                setUserData(u);
                await SecureStore.setItemAsync('userData', JSON.stringify(u));
              }
            } catch(err) { console.error(err); }
          }
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
        if (data.user) {
          await SecureStore.setItemAsync('userData', JSON.stringify(data.user));
          setUserData(data.user);
        } else {
          try {
            const res = await fetch(`${API_BASE_URL}/users/me`, {
              headers: { 'Authorization': `Bearer ${data.token}` }
            });
            if (res.ok) {
              const u = await res.json();
              setUserData(u);
              await SecureStore.setItemAsync('userData', JSON.stringify(u));
            }
          } catch(err) {}
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error(error);
      return { success: false, error: 'Network error connecting to server.' };
    }
  };

  const register = async (userDataInput) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userDataInput)
      });
      const data = await response.json();

      if (response.ok) {
        return await login(userDataInput.username, userDataInput.password);
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
      await SecureStore.deleteItemAsync('userData');
      setUserToken(null);
      setUserData(null);
    } catch (e) {
      console.error('Error deleting token', e);
    }
  };

  const userRole = userData?.role || 'customer';

  return (
    <AuthContext.Provider value={{ login, logout, register, userToken, userData, userRole, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
