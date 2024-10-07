import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useDashboardStore, MenuItem } from '../store/dashboardStore';
import { sharedStyles } from '../styles/sharedStyles';

const MenuItemCard = ({ item }: { item: MenuItem }) => (
  <View style={styles.card}>
    <Text style={styles.itemName}>{item.name}</Text>
    <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
    <Text style={styles.itemCategory}>{item.category}</Text>
  </View>
);

export default function MenuContent() {
  const { menuItems } = useDashboardStore();

  return (
    <View style={sharedStyles.container}>
      <Text style={sharedStyles.title}>Menu Items</Text>
      <FlatList
        data={menuItems}
        renderItem={({ item }) => <MenuItemCard item={item} />}
        keyExtractor={item => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...sharedStyles.listItem,
    width: '48%',
    padding: 16,
    marginBottom: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    elevation: 2,
  },
  itemName: {
    ...sharedStyles.itemName,
    marginBottom: 8,
  },
  itemPrice: {
    ...sharedStyles.itemDetail,
    color: '#007AFF',
    marginBottom: 4,
  },
  itemCategory: {
    ...sharedStyles.itemDetail,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
});