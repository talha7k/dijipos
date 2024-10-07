import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { sharedStyles } from '../styles/sharedStyles';
import { ThreeColumnLayout } from '../components/ThreeColumnLayout';
import { CardGrid } from '../components/CardGrid';
import { Card } from '../components/Card';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
}

const dummyRestaurants: Restaurant[] = [
  { id: '1', name: 'Pizza Palace', address: '123 Main St', phone: '555-1234' },
  { id: '2', name: 'Burger Barn', address: '456 Elm St', phone: '555-5678' },
  { id: '3', name: 'Sushi Spot', address: '789 Oak St', phone: '555-9012' },
  { id: '4', name: 'Taco Town', address: '321 Pine St', phone: '555-3456' },
  { id: '5', name: 'Pasta Place', address: '654 Maple Ave', phone: '555-7890' },
  { id: '6', name: 'Deli Delight', address: '987 Cedar Rd', phone: '555-2345' },
  { id: '7', name: 'Curry Corner', address: '147 Birch Ln', phone: '555-6789' },
  { id: '8', name: 'BBQ Bonanza', address: '258 Walnut Dr', phone: '555-0123' },
  { id: '9', name: 'Seafood Shack', address: '369 Beach Blvd', phone: '555-4567' },
  { id: '10', name: 'Veggie Venue', address: '741 Green St', phone: '555-8901' },
];

const RestaurantCard = ({ item }: { item: Restaurant }) => (
  <Card>
    <Text style={sharedStyles.itemName}>{item.name}</Text>
    <Text style={sharedStyles.itemDetail}>{item.address}</Text>
    <Text style={sharedStyles.itemDetail}>{item.phone}</Text>
  </Card>
);

export default function RestaurantManagement() {
  const MainContent = (
    <View style={sharedStyles.container}>
      <Text style={sharedStyles.title}>Restaurant Management</Text>
      <CardGrid
        data={dummyRestaurants}
        renderItem={(item) => <RestaurantCard item={item} />}
      />
    </View>
  );

  return (
    <ThreeColumnLayout
      left={<Text style={sharedStyles.title}>Restaurant List</Text>}
      center={MainContent}
      right={<Text style={sharedStyles.title}>Restaurant Stats</Text>}
    />
  );
}