import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useDashboardStore } from '../store/dashboardStore';
import { Customer } from '../store/dashboardStore'; // Import the Customer type

export default function CustomersContent() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useDashboardStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', totalOrders: '' });
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null); // Add type annotation

  const renderCustomerItem = ({ item }: { item: Customer }) => ( // Add type annotation
    <View style={styles.customerItem}>
      <Text style={styles.customerName}>{item.name}</Text>
      <Text style={styles.customerEmail}>{item.email}</Text>
      <Text style={styles.customerOrders}>Total Orders: {item.totalOrders}</Text>
      <View style={styles.customerActions}>
        <TouchableOpacity onPress={() => {
          setEditingCustomer(item);
          setNewCustomer({ name: item.name, email: item.email, totalOrders: item.totalOrders.toString() });
          setModalVisible(true);
        }}>
          <Text style={styles.actionButton}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteCustomer(item.id)}>
          <Text style={styles.actionButton}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleAddOrUpdateCustomer = () => {
    if (newCustomer.name && newCustomer.email) {
      if (editingCustomer) {
        updateCustomer(editingCustomer.id, {
          name: newCustomer.name,
          email: newCustomer.email,
          totalOrders: parseInt(newCustomer.totalOrders) || 0
        });
      } else {
        addCustomer({
          name: newCustomer.name,
          email: newCustomer.email,
          totalOrders: parseInt(newCustomer.totalOrders) || 0
        });
      }
      setNewCustomer({ name: '', email: '', totalOrders: '' });
      setEditingCustomer(null);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Customers</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => {
        setEditingCustomer(null);
        setNewCustomer({ name: '', email: '', totalOrders: '' });
        setModalVisible(true);
      }}>
        <Text style={styles.addButtonText}>Add New Customer</Text>
      </TouchableOpacity>
      <FlatList
        data={customers}
        renderItem={renderCustomerItem}
        keyExtractor={item => item.id}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <TextInput
            style={styles.input}
            placeholder="Customer Name"
            value={newCustomer.name}
            onChangeText={(text) => setNewCustomer({ ...newCustomer, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={newCustomer.email}
            onChangeText={(text) => setNewCustomer({ ...newCustomer, email: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Total Orders"
            value={newCustomer.totalOrders}
            onChangeText={(text) => setNewCustomer({ ...newCustomer, totalOrders: text })}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleAddOrUpdateCustomer}>
            <Text style={styles.submitButtonText}>{editingCustomer ? 'Update Customer' : 'Add Customer'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  customerItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingVertical: 12,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  customerEmail: {
    fontSize: 14,
    color: '#007AFF',
  },
  customerOrders: {
    fontSize: 14,
    color: '#8E8E93',
  },
  customerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    color: '#007AFF',
    marginLeft: 16,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  input: {
    height: 40,
    width: '100%',
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  submitButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
});