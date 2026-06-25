import React, { useContext, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CartContext } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';

const API_BASE_URL = 'http://10.0.2.2:3000/api';

export default function CartScreen({ navigation }) {
  const { cartItems, cartTotal, restaurantId, updateQuantity, clearCart } = useContext(CartContext);
  const { userToken } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const [isOrdering, setIsOrdering] = useState(false);

  const handlePlaceOrder = async () => {
    if (!userToken) {
      Alert.alert(
        "Login Required",
        "You need to log in to place an order.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Log In", onPress: () => navigation.navigate('Login') }
        ]
      );
      return;
    }

    if (!restaurantId || cartItems.length === 0) {
      Alert.alert("Error", "Your cart is empty.");
      return;
    }

    setIsOrdering(true);
    try {
      const itemsPayload = cartItems.map(item => ({
        productId: item.product.id || item.product._id,
        quantity: item.quantity
      }));

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          restaurantId: restaurantId,
          items: itemsPayload
        })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Your order has been placed!");
        clearCart();
        navigation.navigate('MainTabs', { screen: 'HomeTab' });
      } else {
        Alert.alert("Error", data.error || "Failed to place order.");
      }
    } catch (error) {
      Alert.alert("Error", "Could not connect to the server.");
    } finally {
      setIsOrdering(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={[styles.cartItem, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.product.name}</Text>
        <Text style={[styles.itemPrice, { color: colors.primary }]}>₪{(item.product.price * item.quantity).toFixed(2)}</Text>
      </View>
      <View style={styles.quantityControls}>
        <TouchableOpacity 
          style={[styles.qtyBtn, { backgroundColor: colors.border }]} 
          onPress={() => updateQuantity(item.product.id || item.product._id, item.quantity - 1)}
        >
          <Text style={[styles.qtyBtnText, { color: colors.text }]}>-</Text>
        </TouchableOpacity>
        <Text style={[styles.qtyText, { color: colors.text }]}>{item.quantity}</Text>
        <TouchableOpacity 
          style={[styles.qtyBtn, { backgroundColor: colors.primary }]} 
          onPress={() => updateQuantity(item.product.id || item.product._id, item.quantity + 1)}
        >
          <Text style={styles.qtyBtnTextActive}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backButtonText, { color: colors.text }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text, marginLeft: 16 }]}>Your Cart</Text>
        </View>
        {cartItems.length > 0 && (
          <TouchableOpacity onPress={clearCart}>
            <Text style={{ color: '#ff4d4d', fontWeight: 'bold' }}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Your cart is empty.</Text>
          <TouchableOpacity 
            style={[styles.browseBtn, { backgroundColor: colors.primary }]} 
            onPress={() => navigation.navigate('HomeTab')}
          >
            <Text style={styles.browseBtnText}>Browse Restaurants</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.product.id || item.product._id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
          <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>₪{cartTotal.toFixed(2)}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.placeOrderBtn, { backgroundColor: colors.primary }]} 
              onPress={handlePlaceOrder}
              disabled={isOrdering}
            >
              {isOrdering ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.placeOrderText}>Place Order</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
  },
  backButton: {
    backgroundColor: 'rgba(128,128,128,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  backButtonText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 20,
  },
  browseBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  browseBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyBtnTextActive: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  qtyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  placeOrderBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
