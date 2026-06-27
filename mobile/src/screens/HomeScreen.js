import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  SectionList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import { CartContext } from '../contexts/CartContext';
import RestaurantCard from '../components/RestaurantCard';
import * as api from '../services/api';

const CUISINES = ['All', 'Burgers', 'Asian', 'Italian', 'Other'];
const EMPTY_SEARCH_RESULTS = { restaurants: [], products: [] };

export default function HomeScreen({ navigation }) {
  const { userToken } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const { cartCount } = useContext(CartContext);

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(EMPTY_SEARCH_RESULTS);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCuisine, setSelectedCuisine] = useState('All');

  const isSearchActive = searchQuery.trim().length > 0;

  useFocusEffect(
    useCallback(() => {
      fetchRestaurants();
    }, [userToken])
  );

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const data = await api.fetchRestaurants();
      setRestaurants(Array.isArray(data) ? data : data.restaurants || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not connect to the server. Make sure the Node backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isSearchActive) {
      setSearchResults(EMPTY_SEARCH_RESULTS);
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const data = await api.searchRestaurants(searchQuery.trim());
        setSearchResults({
          restaurants: data.restaurants || [],
          products: data.products || [],
        });
      } catch (err) {
        console.error('Search error', err);
        setSearchResults(EMPTY_SEARCH_RESULTS);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, isSearchActive]);

  const filteredRestaurants = restaurants.filter(
    (r) => selectedCuisine === 'All' || r.cuisine === selectedCuisine
  );

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(EMPTY_SEARCH_RESULTS);
  };

  const handleCartPress = () => {
    if (!userToken) {
      Alert.alert(
        'Login Required',
        'You need to log in to view your cart. Do you want to log in now?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log In', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }
    navigation.navigate('Cart');
  };

  const navigateToRestaurant = (restaurantId) => {
    navigation.navigate('Restaurant', { restaurantId });
  };

  const renderSearchRow = ({ item, section }) => {
    const isRestaurant = section.title === 'Restaurants';
    const restaurantId = isRestaurant
      ? item.id || item._id
      : item.restaurantId;

    return (
      <TouchableOpacity
        style={[styles.searchRow, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigateToRestaurant(restaurantId)}
      >
        <Text style={[styles.searchRowTitle, { color: colors.text }]}>{item.name}</Text>
        {item.description ? (
          <Text style={[styles.searchRowDesc, { color: colors.subtext }]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        <Text style={[styles.title, { color: colors.text }]}>Discovery</Text>
        <View style={styles.headerRightControls}>
          <TouchableOpacity
            style={[styles.cartIconContainer, { backgroundColor: colors.card }]}
            onPress={handleCartPress}
          >
            <Text style={styles.cartIconText}>🛒</Text>
            {cartCount > 0 && (
              <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          {!userToken && (
            <TouchableOpacity
              style={[styles.headerLoginBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.headerLoginText}>Log In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card, shadowColor: colors.text }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.text, flex: 1 }]}
          placeholder="Search for restaurants or dishes..."
          placeholderTextColor={colors.subtext}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {isSearching && <ActivityIndicator size="small" color={colors.primary} />}
        {isSearchActive && (
          <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={22} color={colors.subtext} />
          </TouchableOpacity>
        )}
      </View>

      {!isSearchActive && (
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
                  selectedCuisine === item && { backgroundColor: colors.primary },
                ]}
                onPress={() => setSelectedCuisine(item)}
              >
                <Text
                  style={[
                    styles.cuisineText,
                    { color: colors.subtext },
                    selectedCuisine === item && styles.cuisineTextActive,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {isSearchActive && (
        <Text style={[styles.resultsText, { color: colors.primary }]}>
          Search results for "{searchQuery}"
        </Text>
      )}
    </View>
  );

  const searchSections = [
    { title: 'Restaurants', data: searchResults.restaurants },
    { title: 'Menu Items', data: searchResults.products },
  ].filter((section) => section.data.length > 0);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.subtext }}>Loading restaurants...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={fetchRestaurants}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {isSearchActive ? (
        <SectionList
          sections={searchSections}
          keyExtractor={(item, index) => item.id || item._id || `${item.name}-${index}`}
          renderItem={renderSearchRow}
          renderSectionHeader={({ section: { title } }) => (
            <Text style={[styles.sectionHeader, { color: colors.text }]}>{title}</Text>
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            !isSearching ? (
              <Text style={[styles.emptyText, { color: colors.subtext }]}>No results found.</Text>
            ) : null
          }
          stickySectionHeadersEnabled={false}
        />
      ) : (
        <FlatList
          data={filteredRestaurants}
          keyExtractor={(item) => item.id || item._id}
          renderItem={({ item }) => (
            <RestaurantCard
              restaurant={item}
              onPress={() => navigateToRestaurant(item.id || item._id)}
            />
          )}
          ListHeaderComponent={renderHeader}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.subtext }]}>No restaurants found.</Text>
          }
        />
      )}
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
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    fontSize: 16,
    paddingVertical: 4,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  cuisineContainer: {
    marginBottom: 10,
  },
  cuisinePill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  cuisineText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  cuisineTextActive: {
    color: '#fff',
  },
  resultsText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
  },
  searchRow: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  searchRowTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  searchRowDesc: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
  },
  errorText: {
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
});
