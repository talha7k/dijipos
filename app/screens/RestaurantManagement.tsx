import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent, PageContent } from '../components/ScreenContent';
import { CardGrid } from '../components/CardGrid';
import { Card } from '../components/Card';
import { sharedStyles } from '../styles/sharedStyles';

interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  manager: string;
}

const dummyRestaurants: Restaurant[] = [
  { id: '1', name: 'Downtown Diner', address: '123 Main St, City', phone: '555-1234', manager: 'John Doe' },
  { id: '2', name: 'Seaside Cafe', address: '456 Beach Rd, Town', phone: '555-5678', manager: 'Jane Smith' },
  { id: '3', name: 'Mountain View Restaurant', address: '789 Hill Ave, Village', phone: '555-9012', manager: 'Bob Johnson' },
];

const RestaurantCard = ({ item }: { item: Restaurant }) => (
  <Card>
    <Text style={sharedStyles.itemName}>{item.name}</Text>
    <Text style={sharedStyles.itemDetail}>Address: {item.address}</Text>
    <Text style={sharedStyles.itemDetail}>Phone: {item.phone}</Text>
    <Text style={sharedStyles.itemDetail}>Manager: {item.manager}</Text>
  </Card>
);

const generateRestaurantManagementContent = (): PageContent => ({
  leftColumn: {
    title: "Restaurant List",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Restaurant List</Text>
        <CardGrid
          data={dummyRestaurants.map(item => ({
            content: <RestaurantCard item={item} />
          }))}
          renderItem={(item) => item.content}
        />
      </View>
    )
  },
  middleColumn: {
    title: "Restaurant Details",
    content: (
      <View>
        <Text style={sharedStyles.title}>Restaurant Details</Text>
        {/* Add form for adding/editing restaurant details here */}
      </View>
    )
  },
  rightColumn: {
    title: "Restaurant Stats",
    content: (
      <View>
        <Text style={sharedStyles.title}>Restaurant Stats</Text>
        {/* Add restaurant statistics or performance metrics here */}
      </View>
    )
  }
});

const RestaurantManagement: React.FC = () => {
  return <ScreenContent generatePageContent={generateRestaurantManagementContent} />;
};

export default RestaurantManagement;