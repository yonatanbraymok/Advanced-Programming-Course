import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { ThemeContext } from '../contexts/ThemeContext';
import { AuthContext } from '../contexts/AuthContext';
import { CartContext } from '../contexts/CartContext';

export default function RestaurantScreen({ route, navigation }) {
  const { restaurant } = route.params;
  const { colors } = useContext(ThemeContext);
  const { userToken } = useContext(AuthContext);
  const { addToCart, cartCount } = useContext(CartContext);

  const handleAddToCart = (item) => {
    if (!userToken) {
      Alert.alert(
        "Login Required",
        "You need to log in to add items to your cart. Do you want to log in now?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Log In", onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }
    
    const addedDirectly = addToCart(restaurant.id || restaurant._id, item, 1);
    if (addedDirectly) {
      Alert.alert('Added to Cart', `${item.name} has been added to your cart.`);
    }
  };

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
    <View style={styles.headerContainer}>
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={[styles.backButtonText, { color: '#fff' }]}>← Back</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.cartButton} 
        onPress={handleCartPress}
      >
        <Text style={styles.cartButtonIcon}>🛒</Text>
        {cartCount > 0 && (
          <View style={[styles.cartBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.cartBadgeText}>{cartCount}</Text>
          </View>
        )}
      </TouchableOpacity>
      
      <Image 
        source={{ uri: restaurant.image || 'https://offloadmedia.feverup.com/secretphiladelphia.co/wp-content/uploads/2023/09/17082921/Untitled-design-625-1024x683.jpg' }} 
        style={styles.heroImage} 
      />
      <View style={[styles.infoCard, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
        <Text style={[styles.restaurantName, { color: colors.text }]}>{restaurant.name}</Text>
        <Text style={[styles.restaurantCuisine, { color: colors.textSecondary }]}>
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
                <Text style={[styles.distanceText, { color: colors.primary }]}>📍 {restaurant.distance.toFixed(1)} km away</Text>
              </View>
              <View style={[styles.timeBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.timeText}>🛵 {Math.max(0, baseTime - 5)}-{baseTime + 5} mins</Text>
              </View>
            </View>
          );
        })()}

        <Text style={[styles.restaurantDesc, { color: colors.textSecondary }]}>
          {restaurant.description || 'No description available for this restaurant.'}
        </Text>
      </View>
    </View>
  );

  const renderMenuItem = ({ item }) => (
    <View style={[styles.menuItemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.menuItemInfo}>
        <Text style={[styles.menuItemName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.menuItemDesc, { color: colors.textSecondary }]} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={[styles.menuItemPrice, { color: colors.text }]}>
          ₪{Number(item.price).toFixed(2)}
        </Text>
      </View>
      
      <View style={styles.menuItemAction}>
        <Image 
          source={{ uri: item.image || 'https://blogs.biomedcentral.com/on-medicine/wp-content/uploads/sites/6/2019/09/iStock-1131794876.t5d482e40.m800.xtDADj9SvTVFjzuNeGuNUUGY4tm5d6UGU5tkKM0s3iPk-620x342.jpg' }} 
          style={styles.menuItemImage} 
        />
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => handleAddToCart(item)}
        >
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={restaurant.menu || []}
        keyExtractor={(item) => item.id || item._id || Math.random().toString()}
        renderItem={renderMenuItem}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
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
    color: 'white',
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
    backgroundColor: '#e6f7ff',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  distanceText: {
    color: '#009de0',
    fontSize: 12,
    fontWeight: 'bold',
  },
  timeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#009de0',
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
  menuItemCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    overflow: 'hidden',
  },
  menuItemInfo: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'space-between',
  },
  menuItemName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuItemDesc: {
    fontSize: 14,
    marginBottom: 8,
  },
  menuItemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuItemAction: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    width: 80,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
  }
});
