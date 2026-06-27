import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemeContext } from '../contexts/ThemeContext';

const DEFAULT_PRODUCT_IMAGE =
  'https://blogs.biomedcentral.com/on-medicine/wp-content/uploads/sites/6/2019/09/iStock-1131794876.t5d482e40.m800.xtDADj9SvTVFjzuNeGuNUUGY4tm5d6UGU5tkKM0s3iPk-620x342.jpg';

export default function ProductCard({ product, onAdd }) {
  const { colors } = useContext(ThemeContext);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]}>{product.name}</Text>
        <Text style={[styles.description, { color: colors.subtext }]} numberOfLines={2}>
          {product.description}
        </Text>
        <Text style={[styles.price, { color: colors.text }]}>
          ₪{Number(product.price).toFixed(2)}
        </Text>
      </View>

      <View style={styles.action}>
        <Image
          source={{ uri: product.image || DEFAULT_PRODUCT_IMAGE }}
          style={styles.image}
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => onAdd(product)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    overflow: 'hidden',
  },
  info: {
    flex: 1,
    paddingRight: 12,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    marginBottom: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  action: {
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginBottom: 8,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    lineHeight: 22,
  },
});
