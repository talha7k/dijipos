import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent, PageContent } from '../components/ScreenContent';
import { CardGrid } from '../components/CardGrid';
import { Card } from '../components/Card';
import { sharedStyles } from '../styles/sharedStyles';

interface ManagementOption {
  id: string;
  name: string;
  description: string;
}

const managementOptions: ManagementOption[] = [
  { id: '1', name: 'Product Management', description: 'Manage products and categories' },
  { id: '2', name: 'Order Management', description: 'View and manage orders' },
  { id: '3', name: 'Customer Management', description: 'Manage customer information' },
  { id: '4', name: 'Employee Management', description: 'Manage staff and roles' },
  { id: '5', name: 'Reports', description: 'View sales and performance reports' },
];

const ManagementOptionCard = ({ item }: { item: ManagementOption }) => (
  <Card>
    <Text style={sharedStyles.itemName}>{item.name}</Text>
    <Text style={sharedStyles.itemDetail}>{item.description}</Text>
  </Card>
);

const generateManagementContent = (): PageContent => ({
  leftColumn: {
    title: "Management Options",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Management Options</Text>
        <CardGrid
          data={managementOptions.map(item => ({
            content: <ManagementOptionCard item={item} />
          }))}
          renderItem={(item) => item.content}
        />
      </View>
    )
  },
  middleColumn: {
    title: "Selected Option Details",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Selected Option Details</Text>
        <Text>Select an option to view details</Text>
      </View>
    )
  },
  rightColumn: {
    title: "Actions",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Actions</Text>
        <Text>Actions for selected management option</Text>
      </View>
    )
  }
});

const ManagementContent: React.FC = () => {
  return <ScreenContent generatePageContent={generateManagementContent} />;
};

export default ManagementContent;