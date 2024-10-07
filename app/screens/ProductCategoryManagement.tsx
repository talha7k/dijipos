import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent, PageContent } from '../components/ScreenContent';
import { CardGrid } from '../components/CardGrid';
import { Card } from '../components/Card';
import { sharedStyles } from '../styles/sharedStyles';

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
  { id: '5', name: 'Sides', description: 'Complementary dishes' },
];

const ProductCategoryCard = ({ item }: { item: ProductCategory }) => (
  <Card>
    <Text style={sharedStyles.itemName}>{item.name}</Text>
    <Text style={sharedStyles.itemDetail}>{item.description}</Text>
  </Card>
);

const generateProductCategoryManagementContent = (): PageContent => ({
  leftColumn: {
    title: "Product Categories",
    content: <Text style={sharedStyles.title}>Product Categories</Text>
  },
  middleColumn: {
    title: "Product Category Management",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Product Category Management</Text>
        <CardGrid
          data={dummyProductCategories.map(item => ({
            content: <ProductCategoryCard item={item} />
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

const ProductCategoryManagement: React.FC = () => {
  return <ScreenContent generatePageContent={generateProductCategoryManagementContent} />;
};

export default ProductCategoryManagement;