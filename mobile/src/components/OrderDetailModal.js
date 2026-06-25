import React, { useContext } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../contexts/ThemeContext';

export default function OrderDetailModal({ visible, onClose, order }) {
  const { colors } = useContext(ThemeContext);

  if (!order) return null;

  const dateStr = new Date(order.createdAt).toLocaleDateString();
  const timeStr = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const renderItem = ({ item }) => (
    <View style={[styles.itemRow, { borderBottomColor: colors.border }]}>
      <View style={styles.itemInfo}>
        <Text style={[styles.itemQuantity, { color: colors.primary }]}>{item.quantity}x</Text>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
      </View>
      <Text style={[styles.itemPrice, { color: colors.textSecondary }]}>₪{(item.price * item.quantity).toFixed(2)}</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <SafeAreaView style={{ flex: 1 }}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Order Details</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={[styles.closeBtnText, { color: colors.primary }]}>Close</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoSection}>
              <Text style={[styles.orderId, { color: colors.textSecondary }]}>Order #{order.id}</Text>
              <Text style={[styles.dateText, { color: colors.textSecondary }]}>{dateStr} at {timeStr}</Text>
              <Text style={[styles.statusText, { color: colors.text }]}>Status: <Text style={{ fontWeight: 'bold' }}>{order.status}</Text></Text>
            </View>

            <FlatList
              data={order.items}
              keyExtractor={(item, index) => `${item.productId}-${index}`}
              renderItem={renderItem}
              contentContainerStyle={styles.listContent}
            />

            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
              <Text style={[styles.totalAmount, { color: colors.primary }]}>₪{order.totalPrice.toFixed(2)}</Text>
            </View>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '85%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeBtn: {
    position: 'absolute',
    right: 20,
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoSection: {
    padding: 20,
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemQuantity: {
    fontWeight: 'bold',
    fontSize: 16,
    width: 30,
  },
  itemName: {
    fontSize: 16,
    flex: 1,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
