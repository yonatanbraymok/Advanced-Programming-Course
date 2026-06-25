import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator, Switch } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';

const API_BASE_URL = 'http://10.0.2.2:3000/api';

export default function ProfileScreen({ navigation }) {
  const { logout, userToken } = useContext(AuthContext);
  const { colors, isDarkMode, toggleTheme } = useContext(ThemeContext);
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Unsubscribe from focus event
    const unsubscribe = navigation.addListener('focus', () => {
      if (userToken) {
        fetchProfile();
      }
    });
    return unsubscribe;
  }, [navigation, userToken]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        headers: {
          'Authorization': `Bearer ${userToken}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
      }
    } catch (error) {
      console.error('Failed to fetch profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigation.navigate('HomeTab');
  };

  if (!userToken) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.header, { color: colors.text }]}>Profile</Text>
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>You must be logged in to view your profile.</Text>
        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading && !profile) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.header, { color: colors.text }]}>My Profile</Text>
      
      {profile && (
        <View style={styles.profileHeader}>
          <Image 
            source={{ uri: (profile.profileImage && !profile.profileImage.startsWith('data:image/svg')) ? profile.profileImage : 'https://file.loading.io/resources/icon/9qk4gp.svg?v=1' }} 
            style={[styles.avatar, { backgroundColor: '#009de0' }]} 
          />
          <Text style={[styles.name, { color: colors.text }]}>{profile.name}</Text>
          <Text style={[styles.username, { color: colors.textSecondary }]}>@{profile.username}</Text>
        </View>
      )}

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('EditProfile', { profile })}>
          <Text style={[styles.rowText, { color: colors.text }]}>Edit Details</Text>
          <Text style={[styles.arrow, { color: colors.textSecondary }]}>{'>'}</Text>
        </TouchableOpacity>
        
        <View style={styles.divider} />

        <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('Orders')}>
          <Text style={[styles.rowText, { color: colors.text }]}>Order History</Text>
          <Text style={[styles.arrow, { color: colors.textSecondary }]}>{'>'}</Text>
        </TouchableOpacity>

        {profile.role === 'restaurant_owner' && (
          <>
            <View style={styles.divider} />

            <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('OwnerRestaurants')}>
              <Text style={[styles.rowText, { color: colors.text }]}>My Restaurants</Text>
              <Text style={[styles.arrow, { color: colors.textSecondary }]}>{'>'}</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={[styles.rowText, { color: colors.text }]}>Dark Mode</Text>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: colors.primary }}
            thumbColor={'#f4f3f4'}
          />
        </View>
      </View>

      <TouchableOpacity style={[styles.logoutButton, { borderColor: '#ff4d4d' }]} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 50,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  username: {
    fontSize: 16,
  },
  card: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  rowText: {
    fontSize: 18,
    fontWeight: '600',
  },
  arrow: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    my: 10,
  },
  infoText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center'
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  logoutButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 'auto',
    marginBottom: 20,
  },
  logoutText: {
    color: '#ff4d4d',
    fontSize: 18,
    fontWeight: 'bold',
  }
});
