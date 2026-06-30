import React, { createContext, useState, useContext, useMemo, useEffect, useRef, useCallback } from 'react';
import { Alert } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const OWNER_ORDER_MSG = 'You must be on a regular user account to place an order.';

const CART_STORAGE_PREFIX = 'wolt_cart_';

const emptyCart = () => ({ cartItems: [], restaurantId: null });

const getStorageKey = (userId) => `${CART_STORAGE_PREFIX}${userId}`;

const loadCartFromStorage = async (userId) => {
  if (!userId) {
    return emptyCart();
  }
  try {
    const raw = await SecureStore.getItemAsync(getStorageKey(userId));
    if (!raw) {
      return emptyCart();
    }
    const parsed = JSON.parse(raw);
    return {
      cartItems: Array.isArray(parsed.cartItems) ? parsed.cartItems : [],
      restaurantId: parsed.restaurantId ?? null,
    };
  } catch {
    return emptyCart();
  }
};

const saveCartToStorage = async (userId, cart) => {
  if (!userId) {
    return;
  }
  const key = getStorageKey(userId);
  if (!cart.cartItems.length && !cart.restaurantId) {
    await SecureStore.deleteItemAsync(key);
    return;
  }
  await SecureStore.setItemAsync(key, JSON.stringify(cart));
};

const removeCartFromStorage = async (userId) => {
  if (!userId) {
    return;
  }
  await SecureStore.deleteItemAsync(getStorageKey(userId));
};

export function CartProvider({ children }) {
  const { userData, userRole } = useContext(AuthContext);
  const userId = userData?.id ?? null;

  const [cartItems, setCartItems] = useState([]);
  const [restaurantId, setRestaurantId] = useState(null);

  const cartSnapshotRef = useRef({ cartItems: [], restaurantId: null });
  const activeUserIdRef = useRef(null);
  const skipNextPersistRef = useRef(false);

  useEffect(() => {
    cartSnapshotRef.current = { cartItems, restaurantId };
  }, [cartItems, restaurantId]);

  useEffect(() => {
    let cancelled = false;

    const syncCartForUser = async () => {
      const prevUserId = activeUserIdRef.current;
      if (prevUserId === userId) {
        return;
      }

      if (prevUserId) {
        await saveCartToStorage(prevUserId, cartSnapshotRef.current);
      }

      const loaded = await loadCartFromStorage(userId);
      if (!cancelled) {
        skipNextPersistRef.current = true;
        setCartItems(loaded.cartItems);
        setRestaurantId(loaded.restaurantId);
        activeUserIdRef.current = userId;
      }
    };

    syncCartForUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      return;
    }
    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }
    saveCartToStorage(userId, { cartItems, restaurantId });
  }, [userId, cartItems, restaurantId]);

  const applyAddToCart = useCallback((restId, product, quantity) => {
    setRestaurantId(restId);
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          (product.id && item.product.id === product.id) ||
          (product._id && item.product._id === product._id)
      );

      if (existingItemIndex >= 0) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += quantity;
        return newItems;
      }

      return [...prevItems, { product, quantity }];
    });
  }, []);

  const addToCart = (restId, product, quantity = 1) => {
    if (userRole === 'restaurant_owner') {
      return { ok: false, error: OWNER_ORDER_MSG };
    }

    if (restaurantId && restaurantId !== restId) {
      Alert.alert(
        'Clear Cart?',
        'Adding items from a new restaurant will clear your current cart. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: () => {
              setCartItems([{ product, quantity }]);
              setRestaurantId(restId);
              Alert.alert('Added to Cart', `${product.name} has been added to your cart.`);
            },
          },
        ]
      );
      return { ok: false };
    }

    applyAddToCart(restId, product, quantity);
    return { ok: true };
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const newItems = prevItems.filter((item) => {
        const idMatch = productId && item.product.id === productId;
        const _idMatch = productId && item.product._id === productId;
        return !(idMatch || _idMatch);
      });
      if (newItems.length === 0) {
        setRestaurantId(null);
      }
      return newItems;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        const isMatch =
          (productId && item.product.id === productId) ||
          (productId && item.product._id === productId);
        return isMatch ? { ...item, quantity } : item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setRestaurantId(null);
    if (userId) {
      removeCartFromStorage(userId);
    }
  };

  const cartTotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + item.product.price * item.quantity, 0);
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
    cartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
