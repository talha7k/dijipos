import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useDashboardStore, Order } from '../store/dashboardStore';
import { sharedStyles } from '../styles/sharedStyles';

interface Product {
  name: string;
  price: number;
  quantity: number;
}

const initialOrderState = { customerName: '', products: [] as Product[] };

export default function OrdersContent() {
  const { orders, addOrder, updateOrderStatus, updateOrder } = useDashboardStore();
  const [newOrder, setNewOrder] = useState(initialOrderState);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', quantity: '1' });

  useEffect(() => {
    if (editingOrder) {
      setNewOrder({
        customerName: editingOrder.customerName,
        products: editingOrder.products || [],
      });
    }
  }, [editingOrder]);

  const renderOrderItem = ({ item }: { item: Order }) => (
    <View style={styles.orderItem}>
      <Text style={styles.orderName}>{item.customerName}</Text>
      <Text style={styles.orderTotal}>${item.total.toFixed(2)}</Text>
      <Text style={styles.orderStatus}>{item.status}</Text>
      <View style={styles.orderActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setEditingOrder(item)}
        >
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

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price) {
      const product: Product = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        quantity: parseInt(newProduct.quantity) || 1,
      };
      setNewOrder(prev => ({
        ...prev,
        products: [...prev.products, product],
      }));
      setNewProduct({ name: '', price: '', quantity: '1' });
    }
  };

  const handleRemoveProduct = (index: number) => {
    setNewOrder(prev => ({
      ...prev,
      products: prev.products.filter((_, i) => i !== index),
    }));
  };

  const handleAddOrUpdateOrder = () => {
    if (newOrder.customerName && newOrder.products.length > 0) {
      const total = newOrder.products.reduce((sum, product) => sum + product.price * product.quantity, 0);
      if (editingOrder) {
        updateOrder(editingOrder.id, {
          customerName: newOrder.customerName,
          products: newOrder.products,
          total,
        });
        setEditingOrder(null);
      } else {
        addOrder({
          customerName: newOrder.customerName,
          products: newOrder.products,
          total,
          status: 'pending'
        });
      }
      setNewOrder(initialOrderState);
    }
  };

  return (
    <ScrollView style={sharedStyles.container}>
      <View style={styles.content}>
        <View style={styles.leftSection}>
          <Text style={sharedStyles.title}>Recent Orders</Text>
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
        </View>
        <View style={styles.rightSection}>
          <Text style={sharedStyles.title}>{editingOrder ? 'Edit Order' : 'Add New Order'}</Text>
          <TextInput
            style={sharedStyles.input}
            placeholder="Customer Name"
            value={newOrder.customerName}
            onChangeText={(text) => setNewOrder(prev => ({ ...prev, customerName: text }))}
          />
          <View style={styles.productInputContainer}>
            <TextInput
              style={styles.productInput}
              placeholder="Product Name"
              value={newProduct.name}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, name: text }))}
            />
            <TextInput
              style={styles.productInput}
              placeholder="Price"
              value={newProduct.price}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, price: text }))}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.productInput}
              placeholder="Quantity"
              value={newProduct.quantity}
              onChangeText={(text) => setNewProduct(prev => ({ ...prev, quantity: text }))}
              keyboardType="numeric"
            />
            <TouchableOpacity style={styles.addProductButton} onPress={handleAddProduct}>
              <Text style={sharedStyles.buttonText}>Add</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={newOrder.products}
            renderItem={({ item, index }) => (
              <View style={styles.productItem}>
                <Text>{item.name} - ${item.price.toFixed(2)} x {item.quantity}</Text>
                <TouchableOpacity onPress={() => handleRemoveProduct(index)}>
                  <Text style={styles.removeProductText}>Remove</Text>
                </TouchableOpacity>
              </View>
            )}
            keyExtractor={(item, index) => index.toString()}
            scrollEnabled={false}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleAddOrUpdateOrder}>
            <Text style={sharedStyles.buttonText}>{editingOrder ? 'Update Order' : 'Add Order'}</Text>
          </TouchableOpacity>
          {editingOrder && (
            <TouchableOpacity 
              style={[styles.submitButton, { backgroundColor: '#FF3B30', marginTop: 10 }]}
              onPress={() => {
                setNewOrder(initialOrderState);
                setEditingOrder(null);
              }}
            >
              <Text style={sharedStyles.buttonText}>Cancel Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    ...sharedStyles.content,
    flexDirection: 'row',
  },
  leftSection: {
    flex: 1,
    marginRight: 16,
  },
  rightSection: {
    flex: 1,
  },
  orderItem: {
    ...sharedStyles.listItem,
  },
  orderName: {
    ...sharedStyles.itemName,
  },
  orderTotal: {
    ...sharedStyles.itemDetail,
    color: '#007AFF',
  },
  orderStatus: {
    ...sharedStyles.itemDetail,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    ...sharedStyles.button,
    padding: 8,
    marginLeft: 8,
  },
  actionButtonText: {
    ...sharedStyles.buttonText,
    fontSize: 12,
  },
  productInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productInput: {
    ...sharedStyles.input,
    flex: 1,
    marginRight: 8,
  },
  addProductButton: {
    ...sharedStyles.button,
    ...sharedStyles.primaryButton,
    justifyContent: 'center',
    padding: 8,
  },
  productItem: {
    ...sharedStyles.listItem,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  removeProductText: {
    color: '#FF3B30',
  },
  submitButton: {
    ...sharedStyles.button,
    ...sharedStyles.primaryButton,
    marginTop: 16,
  },
});