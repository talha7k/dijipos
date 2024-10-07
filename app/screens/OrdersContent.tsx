import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent, PageContent } from '../components/ScreenContent';
import { CardGrid } from '../components/CardGrid';
import { Card } from '../components/Card';
import { sharedStyles } from '../styles/sharedStyles';

interface Order {
  id: string;
  customerName: string;
  items: string;
  total: string;
  status: string;
}

const dummyOrders: Order[] = [
  { id: '1', customerName: 'John Doe', items: '2x Burger, 1x Fries', total: '$25.99', status: 'Preparing' },
  { id: '2', customerName: 'Jane Smith', items: '1x Pizza, 1x Salad', total: '$18.50', status: 'Ready' },
  { id: '3', customerName: 'Bob Johnson', items: '3x Tacos, 2x Soda', total: '$15.75', status: 'Delivered' },
  { id: '4', customerName: 'Alice Brown', items: '1x Steak, 1x Wine', total: '$45.00', status: 'Preparing' },
  { id: '5', customerName: 'Charlie Davis', items: '2x Pasta, 2x Garlic Bread', total: '$32.50', status: 'Ready' },
  { id: '6', customerName: 'Eva Wilson', items: '1x Sushi Platter, 1x Green Tea', total: '$28.75', status: 'Delivered' },
  { id: '7', customerName: 'Frank Miller', items: '1x Chicken Curry, 1x Naan', total: '$19.99', status: 'Preparing' },
  { id: '8', customerName: 'Grace Lee', items: '2x Sandwich, 2x Coffee', total: '$22.00', status: 'Ready' },
  { id: '9', customerName: 'Henry Taylor', items: '1x Fish and Chips, 1x Beer', total: '$21.50', status: 'Delivered' },
  { id: '10', customerName: 'Ivy Martin', items: '1x Veggie Burger, 1x Smoothie', total: '$17.25', status: 'Preparing' },
];

const OrderCard = ({ item }: { item: Order }) => (
  <Card>
    <Text style={sharedStyles.itemName}>{item.customerName}</Text>
    <Text style={sharedStyles.itemDetail}>{item.items}</Text>
    <Text style={sharedStyles.itemDetail}>Total: {item.total}</Text>
    <Text style={sharedStyles.itemDetail}>Status: {item.status}</Text>
  </Card>
);

const generateOrdersContent = (): PageContent => ({
  leftColumn: {
    title: "Orders List",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Orders List</Text>
        <CardGrid
          data={dummyOrders.map(item => ({
            content: <OrderCard item={item} />
          }))}
          renderItem={(item) => item.content}
        />
      </View>
    )
  },
  middleColumn: {
    title: "Order Details",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Order Details</Text>
        <Text>Details of selected order</Text>
      </View>
    )
  },
  rightColumn: {
    title: "Order Actions",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Order Actions</Text>
        <Text>Buttons for order-related actions</Text>
      </View>
    )
  }
});

const OrdersContent: React.FC = () => {
  return <ScreenContent generatePageContent={generateOrdersContent} />;
};

export default OrdersContent;