import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useDashboardStore, Order } from '../store/dashboardStore';

export default function OrdersContent() {
  const { orders, addOrder, updateOrderStatus, deleteOrder, updateOrder } = useDashboardStore();
  const [newOrder, setNewOrder] = useState({ customerName: '', total: '' });
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderName}>{item.customerName}</Text>
      <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
      <Text style={styles.orderStatus}>{item.status}</Text>
      <View style={styles.orderActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => setEditingOrder(item)}>
          <Text style={styles.actionButtonText}>Edit</Text>
        </TouchableOpacity>
        {item.status !== 'pending' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#FFA500' }]}
            onPress={() => updateOrderStatus(item.id, 'pending')}
          >
            <Text style={styles.actionButtonText}>Pending</Text>
          </TouchableOpacity>
        )}
        {item.status !== 'completed' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
            onPress={() => updateOrderStatus(item.id, 'completed')}
          >
            <Text style={styles.actionButtonText}>Complete</Text>
          </TouchableOpacity>
        )}
        {item.status !== 'cancelled' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
            onPress={() => updateOrderStatus(item.id, 'cancelled')}
          >
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const handleAddOrUpdateOrder = () => {
    if (newOrder.customerName && newOrder.total) {
      if (editingOrder) {
        updateOrder(editingOrder.id, {
          customerName: newOrder.customerName,
          total: parseFloat(newOrder.total),
        });
      } else {
        addOrder({
          customerName: newOrder.customerName,
          total: parseFloat(newOrder.total),
          status: 'pending'
        });
      }
      setNewOrder({ customerName: '', total: '' });
      setEditingOrder(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <Text style={styles.title}>Recent Orders</Text>
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
        />
      </View>
      <View style={styles.rightSection}>
        <ScrollView>
          <Text style={styles.title}>{editingOrder ? 'Edit Order' : 'Add New Order'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Customer Name"
            value={newOrder.customerName}
            onChangeText={(text) => setNewOrder({ ...newOrder, customerName: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Total"
            value={newOrder.total}
            onChangeText={(text) => setNewOrder({ ...newOrder, total: text })}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleAddOrUpdateOrder}>
            <Text style={styles.submitButtonText}>{editingOrder ? 'Update Order' : 'Add Order'}</Text>
          </TouchableOpacity>
          {editingOrder && (
            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: '#FF3B30', marginTop: 10 }]}
              onPress={() => {
                setNewOrder({ customerName: '', total: '' });
                setEditingOrder(null);
              }}
            >
              <Text style={styles.submitButtonText}>Cancel Edit</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  leftSection: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#E5E5EA',
    padding: 16,
  },
  rightSection: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  orderItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingVertical: 12,
  },
  orderName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderTotal: {
    fontSize: 14,
    color: '#007AFF',
  },
  orderStatus: {
    fontSize: 14,
    color: '#8E8E93',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    padding: 8,
    borderRadius: 5,
    marginLeft: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 5,
  },
  submitButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});