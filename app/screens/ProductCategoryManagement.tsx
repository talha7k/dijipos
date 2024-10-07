import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { sharedStyles } from '../styles/sharedStyles';
import { ThreeColumnLayout } from '../components/ThreeColumnLayout';
import { CardGrid } from '../components/CardGrid';
import { Card } from '../components/Card';

interface ProductCategory {
  id: string;
  name: string;
  description: string;
}

const dummyProductCategories: ProductCategory[] = [
  { id: '1', name: 'Appetizers', description: 'Starters and small plates' },
  { id: '2', name: 'Main Courses', description: 'Primary dishes' },
  { id: '3', name: 'Desserts', description: 'Sweet treats' },
  { id: '4', name: 'Beverages', description: 'Drinks and refreshments' },
  { id: '5', name: 'Salads', description: 'Fresh and healthy options' },
  { id: '6', name: 'Soups', description: 'Warm and comforting bowls' },
  { id: '7', name: 'Sandwiches', description: 'Handheld delights' },
  { id: '8', name: 'Pasta', description: 'Italian-inspired dishes' },
  { id: '9', name: 'Seafood', description: 'Fresh catches and ocean delicacies' },
  { id: '10', name: 'Vegetarian', description: 'Meat-free options' },
];

const ProductCategoryCard = ({ item }: { item: ProductCategory }) => (
  <Card>
    <Text style={sharedStyles.itemName}>{item.name}</Text>
    <Text style={sharedStyles.itemDetail}>{item.description}</Text>
  </Card>
);

export default function ProductCategoryManagement() {
  const MainContent = (
    <View style={sharedStyles.container}>
      <Text style={sharedStyles.title}>Product Category Management</Text>
      <CardGrid
        data={dummyProductCategories}
        renderItem={(item) => <ProductCategoryCard item={item} />}
      />
    </View>
  );

  return (
    <ThreeColumnLayout
      left={<Text style={sharedStyles.title}>Category List</Text>}
      center={MainContent}
      right={<Text style={sharedStyles.title}>Category Stats</Text>}
    />
  );
}