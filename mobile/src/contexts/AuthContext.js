import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await SecureStore.getItemAsync('userToken');
        const storedUser = await SecureStore.getItemAsync('userData');
        if (token) {
          api.setToken(token);
          setUserToken(token);
          if (storedUser) {
            try {
              setUserData(JSON.parse(storedUser));
            } catch (e) {
              // ignore invalid cached user payload
            }
          } else {
            try {
              const user = await api.fetchCurrentUser();
              setUserData(user);
              await SecureStore.setItemAsync('userData', JSON.stringify(user));
            } catch (err) {
              console.error(err);
            }
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
      const data = await api.login({ username, password });

      if (data?.token) {
        api.setToken(data.token);
        await SecureStore.setItemAsync('userToken', data.token);
        setUserToken(data.token);

        if (data.user) {
          await SecureStore.setItemAsync('userData', JSON.stringify(data.user));
          setUserData(data.user);
        } else {
          try {
            const user = await api.fetchCurrentUser();
            setUserData(user);
            await SecureStore.setItemAsync('userData', JSON.stringify(user));
          } catch (err) {
            console.error(err);
          }
        }
        return { success: true };
      }

      return { success: false, error: 'Login failed' };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error: error.message || 'Network error connecting to server.',
      };
    }
  };

  const register = async (userDataInput) => {
    try {
      await api.register(userDataInput);
      return { success: true };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        error: error.message || 'Network error connecting to server.',
      };
    }
  };

  const logout = async () => {
    try {
      api.clearToken();
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
    <AuthContext.Provider
      value={{ login, logout, register, userToken, userData, userRole, isLoading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
