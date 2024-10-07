import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { useDashboardStore, Order } from '../store/dashboardStore';
import { sharedStyles } from '../styles/sharedStyles';
import { Card } from '../components/Card';
import { ThreeColumnLayout } from '../components/ThreeColumnLayout';

interface Product {
  name: string;
  price: number;
  quantity: number;
}

const initialOrderState = { customerName: '', products: [] as Product[], total: 0 };

const OrderCard = ({ item, onEdit, onUpdateStatus }: { item: Order; onEdit: () => void; onUpdateStatus: (status: Order['status']) => void }) => (
  <Card>
    <Text style={sharedStyles.itemName}>{item.customerName}</Text>
    <Text style={sharedStyles.itemDetail}>${item.total.toFixed(2)}</Text>
    <Text style={sharedStyles.itemDetail}>{item.status}</Text>
    <Text style={sharedStyles.itemDetail}>Products:</Text>
    {item.products && item.products.map((product, index) => (
      <Text key={index} style={sharedStyles.itemDetail}>
        {product.name} - ${product.price.toFixed(2)} x {product.quantity}
      </Text>
    ))}
    <View style={styles.orderActions}>
      <TouchableOpacity style={[sharedStyles.button, styles.actionButton]} onPress={onEdit}>
        <Text style={sharedStyles.buttonText}>Edit</Text>
      </TouchableOpacity>
      {item.status !== 'pending' && (
        <TouchableOpacity 
          style={[sharedStyles.button, styles.actionButton, { backgroundColor: '#FFA500' }]}
          onPress={() => onUpdateStatus('pending')}
        >
          <Text style={sharedStyles.buttonText}>Pending</Text>
        </TouchableOpacity>
      )}
      {item.status !== 'completed' && (
        <TouchableOpacity 
          style={[sharedStyles.button, styles.actionButton, { backgroundColor: '#007AFF' }]}
          onPress={() => onUpdateStatus('completed')}
        >
          <Text style={sharedStyles.buttonText}>Complete</Text>
        </TouchableOpacity>
      )}
      {item.status !== 'cancelled' && (
        <TouchableOpacity 
          style={[sharedStyles.button, styles.actionButton, { backgroundColor: '#FF3B30' }]}
          onPress={() => onUpdateStatus('cancelled')}
        >
          <Text style={sharedStyles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  </Card>
);

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
        total: editingOrder.total,
      });
    }
  }, [editingOrder]);

  const renderOrderItem = ({ item }: { item: Order }) => (
    <OrderCard 
      item={item} 
      onEdit={() => setEditingOrder(item)}
      onUpdateStatus={(status) => updateOrderStatus(item.id, status)}
    />
  );

  const handleAddProduct = () => {
    if (newProduct.name && newProduct.price) {
      const product: Product = {
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        quantity: parseInt(newProduct.quantity) || 1,
      };
      setNewOrder(prev => {
        const updatedProducts = [...prev.products, product];
        const newTotal = updatedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
        return {
          ...prev,
          products: updatedProducts,
          total: newTotal,
        };
      });
      setNewProduct({ name: '', price: '', quantity: '1' });
    }
  };

  const handleRemoveProduct = (index: number) => {
    setNewOrder(prev => {
      const updatedProducts = prev.products.filter((_, i) => i !== index);
      const newTotal = updatedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
      return {
        ...prev,
        products: updatedProducts,
        total: newTotal,
      };
    });
  };

  const handleAddOrUpdateOrder = () => {
    if (newOrder.customerName && newOrder.products.length > 0) {
      if (editingOrder) {
        updateOrder(editingOrder.id, newOrder);
        setEditingOrder(null);
      } else {
        addOrder({
          ...newOrder,
          status: 'pending'
        });
      }
      setNewOrder(initialOrderState);
    }
  };

  const MainContent = (
    <View style={styles.content}>
      <Text style={sharedStyles.title}>Recent Orders</Text>
      <FlatList
        data={orders}
        renderItem={renderOrderItem}
        keyExtractor={item => item.id}
      />
    </View>
  );

  const RightColumn = (
    <Card>
      <Text style={sharedStyles.title}>{editingOrder ? 'Edit Order' : 'Add New Order'}</Text>
      <TextInput
        style={sharedStyles.input}
        placeholder="Customer Name"
        value={newOrder.customerName}
        onChangeText={(text) => setNewOrder(prev => ({ ...prev, customerName: text }))}
      />
      <View style={styles.productInputContainer}>
        <TextInput
          style={[sharedStyles.input, styles.productInput]}
          placeholder="Product Name"
          value={newProduct.name}
          onChangeText={(text) => setNewProduct(prev => ({ ...prev, name: text }))}
        />
        <TextInput
          style={[sharedStyles.input, styles.productInput]}
          placeholder="Price"
          value={newProduct.price}
          onChangeText={(text) => setNewProduct(prev => ({ ...prev, price: text }))}
          keyboardType="numeric"
        />
        <TextInput
          style={[sharedStyles.input, styles.productInput]}
          placeholder="Quantity"
          value={newProduct.quantity}
          onChangeText={(text) => setNewProduct(prev => ({ ...prev, quantity: text }))}
          keyboardType="numeric"
        />
        <TouchableOpacity style={[sharedStyles.button, styles.addProductButton]} onPress={handleAddProduct}>
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
      <Text style={sharedStyles.itemDetail}>Total: ${newOrder.total.toFixed(2)}</Text>
      <TouchableOpacity style={[sharedStyles.button, sharedStyles.primaryButton]} onPress={handleAddOrUpdateOrder}>
        <Text style={sharedStyles.buttonText}>{editingOrder ? 'Update Order' : 'Add Order'}</Text>
      </TouchableOpacity>
      {editingOrder && (
        <TouchableOpacity 
          style={[sharedStyles.button, { backgroundColor: '#FF3B30', marginTop: 10 }]}
          onPress={() => {
            setNewOrder(initialOrderState);
            setEditingOrder(null);
          }}
        >
          <Text style={sharedStyles.buttonText}>Cancel Edit</Text>
        </TouchableOpacity>
      )}
    </Card>
  );

  return (
    <ThreeColumnLayout
      left={<Text>Quick Actions</Text>}
      center={MainContent}
      right={RightColumn}
    />
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    padding: 8,
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  productInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productInput: {
    flex: 1,
    marginRight: 8,
  },
  addProductButton: {
    justifyContent: 'center',
    padding: 8,
  },
  productItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  removeProductText: {
    color: '#FF3B30',
  },
});