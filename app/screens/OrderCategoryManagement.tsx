import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { sharedStyles } from '../styles/sharedStyles';
import { ThreeColumnLayout } from '../components/ThreeColumnLayout';
import { CardGrid } from '../components/CardGrid';
import { Card } from '../components/Card';

interface OrderCategory {
  id: string;
  name: string;
  description: string;
}

const dummyOrderCategories: OrderCategory[] = [
  { id: '1', name: 'Dine-in', description: 'Orders for in-restaurant dining' },
  { id: '2', name: 'Takeout', description: 'Orders for pickup' },
  { id: '3', name: 'Delivery', description: 'Orders for delivery service' },
  { id: '4', name: 'Catering', description: 'Large orders for events' },
  { id: '5', name: 'Drive-thru', description: 'Orders for car pickup' },
  { id: '6', name: 'Online', description: 'Orders placed through website or app' },
  { id: '7', name: 'Phone', description: 'Orders placed via telephone' },
  { id: '8', name: 'Walk-in', description: 'Spontaneous in-person orders' },
  { id: '9', name: 'Subscription', description: 'Recurring scheduled orders' },
  { id: '10', name: 'Special Event', description: 'Orders for specific occasions' },
];

const OrderCategoryCard = ({ item }: { item: OrderCategory }) => (
  <Card>
    <Text style={sharedStyles.itemName}>{item.name}</Text>
    <Text style={sharedStyles.itemDetail}>{item.description}</Text>
  </Card>
);

export default function OrderCategoryManagement() {
  const MainContent = (
    <View style={sharedStyles.container}>
      <Text style={sharedStyles.title}>Order Category Management</Text>
      <CardGrid
        data={dummyOrderCategories}
        renderItem={(item) => <OrderCategoryCard item={item} />}
      />
    </View>
  );

  return (
    <ThreeColumnLayout
      left={<Text style={sharedStyles.title}>Order Categories</Text>}
      center={MainContent}
      right={<Text style={sharedStyles.title}>Category Stats</Text>}
    />
  );
}