import React, { useState, useEffect, useCallback, useContext } from 'react';
import { View, Text, TextInput, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { CartContext } from '../contexts/CartContext';
import RestaurantCard from '../components/RestaurantCard';

// Using 10.0.2.2 which is the special alias to your host loopback interface in the Android Emulator
const API_BASE_URL = 'http://10.0.2.2:3000/api';

const CUISINES = ['All', 'Burgers', 'Asian', 'Italian', 'Other'];

export default function HomeScreen({ navigation }) {
  const { userToken } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const { cartCount } = useContext(CartContext);

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  // Fetch initial restaurants on focus
  useFocusEffect(
    useCallback(() => {
      fetchRestaurants();
    }, [userToken])
  );

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/restaurants`, {
        headers: {
          'Content-Type': 'application/json',
          ...(userToken && { 'Authorization': `Bearer ${userToken}` })
        }
      });
      if (!response.ok) throw new Error('Failed to fetch restaurants');
      const data = await response.json();
      setRestaurants(Array.isArray(data) ? data : data.restaurants || []);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the server. Make sure the Node backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // Debounced Search Effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await fetch(`${API_BASE_URL}/search/${encodeURIComponent(searchQuery.trim())}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(userToken && { 'Authorization': `Bearer ${userToken}` })
          }
        });
        const data = await response.json();
        if (response.ok) {
          setSearchResults(data.restaurants || []);
        }
      } catch (err) {
        console.error('Search error', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const filteredRestaurants = restaurants.filter(r => 
    selectedCuisine === 'All' || r.cuisine === selectedCuisine
  );

  const displayData = searchQuery.trim().length > 0 ? searchResults : filteredRestaurants;

  const handleCartPress = () => {
    if (!userToken) {
      Alert.alert(
        "Login Required",
        "You need to log in to view your cart. Do you want to log in now?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Log In", onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }
    navigation.navigate('Cart');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <Text style={[styles.title, { color: colors.text }]}>Discovery</Text>
        <View style={styles.headerRightControls}>
          <TouchableOpacity style={[styles.cartIconContainer, { backgroundColor: colors.surface }]} onPress={handleCartPress}>
            <Text style={styles.cartIconText}>🛒</Text>
            {cartCount > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          {!userToken && (
            <TouchableOpacity style={[styles.headerLoginBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Login')}>
              <Text style={styles.headerLoginText}>Log In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search for restaurants or dishes..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {searchQuery.trim().length === 0 && (
        <View style={styles.cuisineContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={CUISINES}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.cuisinePill,
                  { backgroundColor: colors.border },
                  selectedCuisine === item && { backgroundColor: colors.primary }
                ]}
                onPress={() => setSelectedCuisine(item)}
              >
                <Text style={[
                  styles.cuisineText,
                  { color: colors.textSecondary },
                  selectedCuisine === item && styles.cuisineTextActive
                ]}>
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {searchQuery.trim().length > 0 && (
        <Text style={[styles.resultsText, { color: colors.primary }]}>
          Search results for "{searchQuery}"
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{marginTop: 10, color: colors.textSecondary}}>Loading restaurants...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={[styles.retryButton, { backgroundColor: colors.primary }]} onPress={fetchRestaurants}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id || item._id}
        renderItem={({ item }) => (
          <RestaurantCard 
            restaurant={item} 
            onPress={() => {
              navigation.navigate('Restaurant', { restaurant: item });
            }} 
          />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No restaurants found.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cartIconText: {
    fontSize: 20,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerLoginBtn: {
    backgroundColor: '#009de0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  headerLoginText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#202125',
  },
  searchContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
    color: '#202125',
  },
  cuisineContainer: {
    marginBottom: 10,
  },
  cuisinePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    marginRight: 10,
  },
  cuisinePillActive: {
    backgroundColor: '#009de0',
  },
  cuisineText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#707070',
  },
  cuisineTextActive: {
    color: '#fff',
  },
  resultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#009de0',
    marginBottom: 10,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 30,
    fontSize: 16,
  },
  errorText: {
    color: '#ff4d4d',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: '#009de0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
