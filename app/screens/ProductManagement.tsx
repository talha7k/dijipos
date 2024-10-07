import React, { useState, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal } from 'react-native';
import { useDashboardStore, MenuItem } from '../store/dashboardStore';
import { sharedStyles } from '../styles/sharedStyles';
import { useNavigation } from '@react-navigation/native';
import { ThreeColumnLayout } from '../components/ThreeColumnLayout';
import { CardGrid } from '../components/CardGrid';
import { Card } from '../components/Card';

export default function ProductManagement() {
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: 'Manage Products' });
  }, [navigation]);

  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useDashboardStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: '' });

  const renderItem = (item: MenuItem) => (
    <Card style={styles.item}>
      <Text style={sharedStyles.itemName}>{item.name}</Text>
      <Text style={sharedStyles.itemDetail}>${item.price.toFixed(2)}</Text>
      <Text style={sharedStyles.itemDetail}>{item.category}</Text>
      <View style={styles.itemActions}>
        <TouchableOpacity onPress={() => handleEdit(item)} style={[sharedStyles.button, styles.editButton]}>
          <Text style={sharedStyles.buttonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteMenuItem(item.id)} style={[sharedStyles.button, styles.deleteButton]}>
          <Text style={sharedStyles.buttonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setNewItem({ name: item.name, price: item.price.toString(), category: item.category });
    setModalVisible(true);
  };

  const handleAddOrUpdate = () => {
    if (newItem.name && newItem.price && newItem.category) {
      const itemData = {
        name: newItem.name,
        price: parseFloat(newItem.price),
        category: newItem.category,
      };

      if (editingItem) {
        updateMenuItem(editingItem.id, itemData);
      } else {
        addMenuItem(itemData);
      }

      setModalVisible(false);
      setEditingItem(null);
      setNewItem({ name: '', price: '', category: '' });
    }
  };

  const MainContent = (
    <View style={sharedStyles.container}>
      <Text style={sharedStyles.title}>Product Management</Text>
      <TouchableOpacity style={[sharedStyles.button, sharedStyles.primaryButton]} onPress={() => setModalVisible(true)}>
        <Text style={sharedStyles.buttonText}>Add New Product</Text>
      </TouchableOpacity>
      <CardGrid
        data={menuItems}
        renderItem={renderItem}
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
            placeholder="Product Name"
            value={newItem.name}
            onChangeText={(text) => setNewItem({ ...newItem, name: text })}
          />
          <TextInput
            style={sharedStyles.input}
            placeholder="Price"
            value={newItem.price}
            onChangeText={(text) => setNewItem({ ...newItem, price: text })}
            keyboardType="numeric"
          />
          <TextInput
            style={sharedStyles.input}
            placeholder="Category"
            value={newItem.category}
            onChangeText={(text) => setNewItem({ ...newItem, category: text })}
          />
          <TouchableOpacity style={[sharedStyles.button, sharedStyles.primaryButton]} onPress={handleAddOrUpdate}>
            <Text style={sharedStyles.buttonText}>{editingItem ? 'Update Product' : 'Add Product'}</Text>
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
      left={<Text style={sharedStyles.title}>Product Categories</Text>}
      center={MainContent}
      right={<Text style={sharedStyles.title}>Product Stats</Text>}
    />
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 16,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  editButton: {
    backgroundColor: '#007AFF',
    marginRight: 10,
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