import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';
import ProductCard from '../components/ProductCard';
import * as api from '../services/api';

const DEFAULT_RESTAURANT_IMAGE =
  'https://offloadmedia.feverup.com/secretphiladelphia.co/wp-content/uploads/2023/09/17082921/Untitled-design-625-1024x683.jpg';

export default function RestaurantScreen({ route, navigation }) {
  const { restaurantId } = route.params;
  const { colors } = useContext(ThemeContext);
  const { userToken } = useContext(AuthContext);
  const { addToCart, cartCount } = useContext(CartContext);

  const [restaurant, setRestaurant] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadRestaurantData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [restaurantData, productsData] = await Promise.all([
        api.fetchRestaurantById(restaurantId),
        api.fetchProducts(restaurantId),
      ]);
      setRestaurant(restaurantData);
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (err) {
      console.error(err);
      setError('Could not load restaurant details.');
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    loadRestaurantData();
  }, [loadRestaurantData]);

  const handleAddToCart = (item) => {
    if (!userToken) {
      Alert.alert(
        'Login Required',
        'You need to log in to add items to your cart. Do you want to log in now?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Log In', onPress: () => navigation.navigate('Login') },
        ]
      );
      return;
    }

    const restId = restaurant?.id || restaurant?._id || restaurantId;
    const addedDirectly = addToCart(restId, item, 1);
    if (addedDirectly) {
      Alert.alert('Added to Cart', `${item.name} has been added to your cart.`);
    }
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

  const renderHeader = () => {
    if (!restaurant) {
      return null;
    }

    return (
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cartButton} onPress={handleCartPress}>
          <Text style={styles.cartButtonIcon}>🛒</Text>
          {cartCount > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>

        <Image
          source={{ uri: restaurant.image || DEFAULT_RESTAURANT_IMAGE }}
          style={styles.heroImage}
        />
        <View style={[styles.infoCard, { backgroundColor: colors.card, shadowColor: colors.text }]}>
          <Text style={[styles.restaurantName, { color: colors.text }]}>{restaurant.name}</Text>
          <Text style={[styles.restaurantCuisine, { color: colors.subtext }]}>
            {restaurant.cuisine || 'International'}
          </Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐️ {restaurant.rating || 'N/A'}</Text>
          </View>

          {restaurant.distance !== undefined && (() => {
            const baseTime = 15 + Math.round(restaurant.distance * 5);
            return (
              <View style={styles.badgesRow}>
                <View style={[styles.distanceBadge, { backgroundColor: colors.background }]}>
                  <Text style={[styles.distanceText, { color: colors.primary }]}>
                    📍 {restaurant.distance.toFixed(1)} km away
                  </Text>
                </View>
                <View style={[styles.timeBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.timeText}>
                    🛵 {Math.max(0, baseTime - 5)}-{baseTime + 5} mins
                  </Text>
                </View>
              </View>
            );
          })()}

          <Text style={[styles.restaurantDesc, { color: colors.subtext }]}>
            {restaurant.description || 'No description available for this restaurant.'}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.subtext }}>Loading menu...</Text>
      </View>
    );
  }

  if (error || !restaurant) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>{error || 'Restaurant not found.'}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={loadRestaurantData}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={products}
        keyExtractor={(item, index) => item.id || item._id || `product-${index}`}
        renderItem={({ item }) => (
          <ProductCard product={item} onAdd={handleAddToCart} />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.subtext }]}>
            No menu items available.
          </Text>
        }
      />
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
    paddingBottom: 40,
  },
  headerContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  heroImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  cartButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButtonIcon: {
    fontSize: 18,
  },
  cartBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fff',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  infoCard: {
    marginHorizontal: 16,
    marginTop: -40,
    borderRadius: 16,
    padding: 20,
    elevation: 5,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 16,
    marginBottom: 12,
  },
  ratingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff0b3',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  ratingText: {
    color: '#d48806',
    fontWeight: 'bold',
    fontSize: 14,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  distanceBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  restaurantDesc: {
    fontSize: 14,
    lineHeight: 20,
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
