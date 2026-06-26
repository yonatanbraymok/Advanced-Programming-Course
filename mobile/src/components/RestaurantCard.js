import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../contexts/ThemeContext';

export default function RestaurantCard({ restaurant, onPress, children }) {
  const { colors } = useContext(ThemeContext);

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface }]} onPress={onPress} activeOpacity={0.9}>
      <Image 
        source={{ uri: restaurant.image || 'https://offloadmedia.feverup.com/secretphiladelphia.co/wp-content/uploads/2023/09/17082921/Untitled-design-625-1024x683.jpg' }} 
        style={styles.image} 
      />
      <View style={styles.infoContainer}>
        <Text style={[styles.name, { color: colors.text }]}>{restaurant.name}</Text>
        <Text style={[styles.details, { color: colors.textSecondary }]}>
          {restaurant.cuisine || 'International'} • ⭐️ {restaurant.rating || 'N/A'}
        </Text>
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
        {children}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  infoContainer: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#202125',
    marginBottom: 6,
  },
  details: {
    fontSize: 14,
    color: '#707070',
    marginBottom: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
});
