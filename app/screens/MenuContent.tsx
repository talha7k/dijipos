import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal } from 'react-native';
import { useDashboardStore } from '../store/dashboardStore';
import { MenuItem } from '../store/dashboardStore'; // Import the MenuItem type

export default function MenuContent() {
  const { menuItems, addMenuItem, updateMenuItem, deleteMenuItem } = useDashboardStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', price: '', category: '' });
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null); // Add type annotation

  const renderMenuItem = ({ item }: { item: MenuItem }) => ( // Add type annotation
    <View style={styles.menuItem}>
      <Text style={styles.menuItemName}>{item.name}</Text>
      <Text style={styles.menuItemPrice}>${item.price.toFixed(2)}</Text>
      <Text style={styles.menuItemCategory}>{item.category}</Text>
      <View style={styles.menuItemActions}>
        <TouchableOpacity onPress={() => {
          setEditingItem(item);
          setNewItem({ name: item.name, price: item.price.toString(), category: item.category });
          setModalVisible(true);
        }}>
          <Text style={styles.actionButton}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => deleteMenuItem(item.id)}>
          <Text style={styles.actionButton}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleAddOrUpdateItem = () => {
    if (newItem.name && newItem.price && newItem.category) {
      if (editingItem) {
        updateMenuItem(editingItem.id, {
          name: newItem.name,
          price: parseFloat(newItem.price),
          category: newItem.category
        });
      } else {
        addMenuItem({
          name: newItem.name,
          price: parseFloat(newItem.price),
          category: newItem.category
        });
      }
      setNewItem({ name: '', price: '', category: '' });
      setEditingItem(null);
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu Items</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => {
        setEditingItem(null);
        setNewItem({ name: '', price: '', category: '' });
        setModalVisible(true);
      }}>
        <Text style={styles.addButtonText}>Add New Item</Text>
      </TouchableOpacity>
      <FlatList
        data={menuItems}
        renderItem={renderMenuItem}
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
            placeholder="Item Name"
            value={newItem.name}
            onChangeText={(text) => setNewItem({ ...newItem, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Price"
            value={newItem.price}
            onChangeText={(text) => setNewItem({ ...newItem, price: text })}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Category"
            value={newItem.category}
            onChangeText={(text) => setNewItem({ ...newItem, category: text })}
          />
          <TouchableOpacity style={styles.submitButton} onPress={handleAddOrUpdateItem}>
            <Text style={styles.submitButtonText}>{editingItem ? 'Update Item' : 'Add Item'}</Text>
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
  menuItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    paddingVertical: 12,
  },
  menuItemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  menuItemPrice: {
    fontSize: 14,
    color: '#007AFF',
  },
  menuItemCategory: {
    fontSize: 14,
    color: '#8E8E93',
  },
  menuItemActions: {
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