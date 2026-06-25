import React, { useState, useCallback, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import RestaurantCard from '../components/RestaurantCard';

const API_BASE_URL = 'http://10.0.2.2:3000/api';

export default function OwnerRestaurantsScreen({ navigation }) {
  const { userToken } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useFocusEffect(
    useCallback(() => {
      fetchMyRestaurants();
    }, [userToken])
  );

  const fetchMyRestaurants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/restaurants/my`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch your restaurants');
      const data = await response.json();
      setRestaurants(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Could not fetch your restaurants.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Delete Restaurant',
      'Are you sure you want to delete this restaurant?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/restaurants/${id}`, {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${userToken}`
                }
              });
              if (!response.ok) throw new Error('Failed to delete');
              fetchMyRestaurants();
            } catch (err) {
              Alert.alert('Error', 'Could not delete restaurant');
            }
          }
        }
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={[styles.backButtonText, { color: colors.text }]}>← Back</Text>
      </TouchableOpacity>
      <Text style={[styles.title, { color: colors.text }]}>My Restaurants</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Manage your restaurant listings</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.textSecondary }}>Loading your portfolio...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={fetchMyRestaurants}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item.id || item._id}
        renderItem={({ item }) => (
          <RestaurantCard 
            restaurant={item} 
            onPress={() => {
              navigation.navigate('EditRestaurant', { restaurant: item });
            }}
          >
            <View style={[styles.cardActions, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
              <TouchableOpacity 
                style={[styles.editButton, { borderColor: '#ff4d4d', backgroundColor: '#ff4d4d' }]}
                onPress={() => handleDelete(item.id || item._id)}
              >
                <Text style={[styles.editButtonText, { color: 'white' }]}>🗑️ Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.editButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                onPress={() => navigation.navigate('EditRestaurant', { restaurant: item })}
              >
                <Text style={[styles.editButtonText, { color: colors.text }]}>Edit ✏️</Text>
              </TouchableOpacity>
            </View>
          </RestaurantCard>
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={[styles.emptyContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>You have no restaurants yet.</Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Click the button below to create your first restaurant listing and start receiving orders!
            </Text>
          </View>
        }
      />
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => navigation.navigate('EditRestaurant')}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80, // space for FAB
  },
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  backButton: {
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
  },
  cardActions: {
    marginTop: 12,
    alignItems: 'flex-end',
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 8,
  },
  editButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyContainer: {
    padding: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  errorText: {
    color: '#ff4d4d',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  fabIcon: {
    fontSize: 32,
    color: 'white',
    lineHeight: 34,
  }
});
