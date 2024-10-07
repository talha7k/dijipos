import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent, PageContent } from '../components/ScreenContent';
import { CardGrid } from '../components/CardGrid';
import { Card } from '../components/Card';
import { sharedStyles } from '../styles/sharedStyles';

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

const generateOrderCategoryManagementContent = (): PageContent => ({
  leftColumn: {
    title: "Order Categories",
    content: <Text style={sharedStyles.title}>Order Categories</Text>
  },
  middleColumn: {
    title: "Order Category Management",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Order Category Management</Text>
        <CardGrid
          data={dummyOrderCategories.map(item => ({
            content: <OrderCategoryCard item={item} />
          }))}
          renderItem={(item) => item.content}
        />
      </View>
    )
  },
  rightColumn: {
    title: "Category Stats",
    content: <Text style={sharedStyles.title}>Category Stats</Text>
  }
});

const OrderCategoryManagement: React.FC = () => {
  return <ScreenContent generatePageContent={generateOrderCategoryManagementContent} />;
};

export default OrderCategoryManagement;