import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent, PageContent } from '../components/ScreenContent';
import { CardGrid } from '../components/CardGrid';
import { Card } from '../components/Card';
import { sharedStyles } from '../styles/sharedStyles';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  lastVisit: string;
}

const dummyCustomers: Customer[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', phone: '555-1234', lastVisit: '2023-05-01' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '555-5678', lastVisit: '2023-05-03' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', phone: '555-9012', lastVisit: '2023-05-05' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', phone: '555-3456', lastVisit: '2023-05-07' },
  { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', phone: '555-7890', lastVisit: '2023-05-09' },
  { id: '6', name: 'Eva Wilson', email: 'eva@example.com', phone: '555-2345', lastVisit: '2023-05-11' },
  { id: '7', name: 'Frank Miller', email: 'frank@example.com', phone: '555-6789', lastVisit: '2023-05-13' },
  { id: '8', name: 'Grace Lee', email: 'grace@example.com', phone: '555-0123', lastVisit: '2023-05-15' },
  { id: '9', name: 'Henry Taylor', email: 'henry@example.com', phone: '555-4567', lastVisit: '2023-05-17' },
  { id: '10', name: 'Ivy Martin', email: 'ivy@example.com', phone: '555-8901', lastVisit: '2023-05-19' },
];

const CustomerCard = ({ item }: { item: Customer }) => (
  <Card>
    <Text style={sharedStyles.itemName}>{item.name}</Text>
    <Text style={sharedStyles.itemDetail}>Email: {item.email}</Text>
    <Text style={sharedStyles.itemDetail}>Phone: {item.phone}</Text>
    <Text style={sharedStyles.itemDetail}>Last Visit: {item.lastVisit}</Text>
  </Card>
);

const generateCustomersContent = (): PageContent => ({
  leftColumn: {
    title: "Customer List",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Customer List</Text>
        <CardGrid
          data={dummyCustomers.map(item => ({
            content: <CustomerCard item={item} />
          }))}
          renderItem={(item) => item.content}
        />
      </View>
    )
  },
  middleColumn: {
    title: "Customer Details",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Customer Details</Text>
        <Text>Select a customer to view details</Text>
      </View>
    )
  },
  rightColumn: {
    title: "Customer Actions",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Customer Actions</Text>
        <Text>Actions for selected customer</Text>
      </View>
    )
  }
});

const CustomersContent: React.FC = () => {
  return <ScreenContent generatePageContent={generateCustomersContent} />;
};

export default CustomersContent;