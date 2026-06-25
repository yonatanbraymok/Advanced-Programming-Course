import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { ThemeContext } from '../contexts/ThemeContext';

export default function OrderCard({ order, onPress }) {
  const { colors } = useContext(ThemeContext);

  const dateStr = new Date(order.createdAt).toLocaleDateString();
  const timeStr = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': return '#4caf50';
      case 'canceled': return '#f44336';
      case 'shipped': return '#2196f3';
      case 'preparing': return '#ff9800';
      default: return '#9e9e9e'; // Pending
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, overflow: 'hidden' }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {order.restaurantImage && (
        <Image 
          source={{ uri: order.restaurantImage }} 
          style={styles.bannerImage} 
          resizeMode="cover"
        />
      )}
      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <Text style={[styles.orderId, { color: colors.text }]}>From: {order.restaurantName || 'Unknown'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
            <Text style={styles.statusText}>{order.status}</Text>
          </View>
        </View>
        
        <View style={styles.contentRow}>
          <View>
            <Text style={[styles.dateText, { color: colors.text }]}>{dateStr} at {timeStr}</Text>
            <Text style={[styles.itemsText, { color: colors.textSecondary }]}>{itemCount} items</Text>
          </View>
          <Text style={[styles.priceText, { color: colors.primary }]}>₪{order.totalPrice.toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  bannerImage: {
    width: '100%',
    height: 120,
  },
  cardContent: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  contentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  itemsText: {
    fontSize: 14,
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
