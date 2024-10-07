import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useDashboardStore, Customer } from '../store/dashboardStore';
import { sharedStyles } from '../styles/sharedStyles';
import { Card } from '../components/Card';
import { ThreeColumnLayout } from '../components/ThreeColumnLayout';
import { CardGrid } from '../components/CardGrid';

const CustomerCard = ({ item, onEdit, onDelete }: { item: Customer; onEdit: () => void; onDelete: () => void }) => (
  <Card>
    <Text style={sharedStyles.itemName}>{item.name}</Text>
    <Text style={sharedStyles.itemDetail}>{item.email}</Text>
    <Text style={sharedStyles.itemDetail}>Total Orders: {item.totalOrders}</Text>
    <View style={styles.customerActions}>
      <TouchableOpacity onPress={onEdit} style={[sharedStyles.button, styles.actionButton]}>
        <Text style={sharedStyles.buttonText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} style={[sharedStyles.button, styles.actionButton, styles.deleteButton]}>
        <Text style={sharedStyles.buttonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  </Card>
);

export default function CustomersContent() {
  const { customers, addCustomer, updateCustomer, deleteCustomer } = useDashboardStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', totalOrders: '' });
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

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

  const MainContent = (
    <View style={sharedStyles.container}>
      <Text style={sharedStyles.title}>Customers</Text>
      <TouchableOpacity style={[sharedStyles.button, sharedStyles.primaryButton]} onPress={() => {
        setEditingCustomer(null);
        setNewCustomer({ name: '', email: '', totalOrders: '' });
        setModalVisible(true);
      }}>
        <Text style={sharedStyles.buttonText}>Add New Customer</Text>
      </TouchableOpacity>
      <CardGrid
        data={customers}
        renderItem={(item) => (
          <CustomerCard
            item={item}
            onEdit={() => {
              setEditingCustomer(item);
              setNewCustomer({ name: item.name, email: item.email, totalOrders: item.totalOrders.toString() });
              setModalVisible(true);
            }}
            onDelete={() => deleteCustomer(item.id)}
          />
        )}
      />
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <TextInput
            style={sharedStyles.input}
            placeholder="Customer Name"
            value={newCustomer.name}
            onChangeText={(text) => setNewCustomer({ ...newCustomer, name: text })}
          />
          <TextInput
            style={sharedStyles.input}
            placeholder="Email"
            value={newCustomer.email}
            onChangeText={(text) => setNewCustomer({ ...newCustomer, email: text })}
          />
          <TextInput
            style={sharedStyles.input}
            placeholder="Total Orders"
            value={newCustomer.totalOrders}
            onChangeText={(text) => setNewCustomer({ ...newCustomer, totalOrders: text })}
            keyboardType="numeric"
          />
          <TouchableOpacity style={[sharedStyles.button, sharedStyles.primaryButton]} onPress={handleAddOrUpdateCustomer}>
            <Text style={sharedStyles.buttonText}>{editingCustomer ? 'Update Customer' : 'Add Customer'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[sharedStyles.button, styles.cancelButton]} onPress={() => setModalVisible(false)}>
            <Text style={sharedStyles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );

  return (
    <ThreeColumnLayout
      left={<Text style={sharedStyles.title}>Customer Groups</Text>}
      center={MainContent}
      right={<Text style={sharedStyles.title}>Customer Stats</Text>}
    />
  );
}

const styles = StyleSheet.create({
  customerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  actionButton: {
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
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
  cancelButton: {
    backgroundColor: '#FF3B30',
    marginTop: 10,
  },
});