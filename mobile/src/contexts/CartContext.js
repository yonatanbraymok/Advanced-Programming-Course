import React, { createContext, useState, useContext, useMemo } from 'react';
import { Alert } from 'react-native';

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);

  // Add or update an item in the cart
  const addToCart = (restId, product, quantity = 1) => {
    // If adding an item from a different restaurant, clear the cart first
    if (restaurantId && restaurantId !== restId) {
      Alert.alert(
        "Clear Cart?",
        "Adding items from a new restaurant will clear your current cart. Continue?",
        [
          { text: "Cancel", style: "cancel" },
          { 
            text: "Continue", 
            onPress: () => {
              setCartItems([{ product, quantity }]);
              setRestaurantId(restId);
              Alert.alert('Added to Cart', `${product.name} has been added to your cart.`);
            }
          }
        ]
      );
      return false;
    }

    setRestaurantId(restId);
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => 
        (product.id && item.product.id === product.id) || 
        (product._id && item.product._id === product._id)
      );
      
      if (existingItemIndex >= 0) {
        // Update quantity
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      }
      
      // Add new item
      return [...prevItems, { product, quantity }];
    });
    return true;
  };

  // Remove an item entirely from the cart
  const removeFromCart = (productId) => {
    setCartItems(prevItems => {
      const newItems = prevItems.filter(item => {
        const idMatch = (productId && item.product.id === productId);
        const _idMatch = (productId && item.product._id === productId);
        return !(idMatch || _idMatch);
      });
      if (newItems.length === 0) {
        setRestaurantId(null);
      }
      return newItems;
    });
  };

  // Update specific quantity
  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prevItems => 
      prevItems.map(item => {
        const isMatch = (productId && item.product.id === productId) || (productId && item.product._id === productId);
        return isMatch ? { ...item, quantity } : item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
  };

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }, [cartItems]);

  const cartCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  }, [cartItems]);

  const value = {
    cartItems,
    restaurantId,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartCount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
