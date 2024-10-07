import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDashboardStore, MenuItem } from '../store/dashboardStore';
import { sharedStyles } from '../styles/sharedStyles';
import { Card } from '../components/Card';
import { ThreeColumnLayout } from '../components/ThreeColumnLayout';
import { CardGrid } from '../components/CardGrid';

const MenuItemCard = ({ item }: { item: MenuItem }) => (
  <Card style={styles.menuItemCard}>
    <Text style={styles.itemName}>{item.name}</Text>
    <Text style={styles.itemPrice}>
      ${typeof item.price === 'number' ? item.price.toFixed(2) : 'N/A'}
    </Text>
    <Text style={styles.itemCategory}>{item.category}</Text>
  </Card>
);

export default function MenuContent() {
  const { menuItems } = useDashboardStore();

  const MainContent = (
    <View style={styles.container}>
      <Text style={sharedStyles.title}>Menu Items</Text>
      <CardGrid
        data={menuItems}
        renderItem={(item) => <MenuItemCard item={item} />}
      />
    </View>
  );

  const LeftColumn = (
    <View>
      <Text style={sharedStyles.title}>Categories</Text>
      {/* Add a list of categories here */}
    </View>
  );

  const RightColumn = (
    <View>
      <Text style={sharedStyles.title}>Menu Stats</Text>
      {/* Add menu statistics here */}
    </View>
  );

  return (
    <ThreeColumnLayout
      left={LeftColumn}
      center={MainContent}
      right={RightColumn}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  menuItemCard: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'space-between',
    padding: 12,
    margin: 8,
  },
  itemName: {
    ...sharedStyles.itemName,
    fontSize: 16,
    marginBottom: 8,
  },
  itemPrice: {
    ...sharedStyles.itemDetail,
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 4,
  },
  itemCategory: {
    ...sharedStyles.itemDetail,
    fontSize: 12,
  },
});