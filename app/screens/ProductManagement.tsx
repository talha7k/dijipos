import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent, PageContent } from '../components/ScreenContent';
import { CardGrid } from '../components/CardGrid';
import { Card } from '../components/Card';
import { sharedStyles } from '../styles/sharedStyles';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}

const dummyProducts: Product[] = [
  { id: '1', name: 'Burger', description: 'Classic beef burger', price: 9.99, category: 'Main Course' },
  { id: '2', name: 'Pizza', description: 'Margherita pizza', price: 12.99, category: 'Main Course' },
  { id: '3', name: 'Salad', description: 'Fresh garden salad', price: 7.99, category: 'Appetizer' },
  { id: '4', name: 'Fries', description: 'Crispy french fries', price: 3.99, category: 'Side' },
  { id: '5', name: 'Soda', description: 'Refreshing cola', price: 1.99, category: 'Beverage' },
  { id: '6', name: 'Steak', description: 'Grilled sirloin steak', price: 19.99, category: 'Main Course' },
  { id: '7', name: 'Pasta', description: 'Spaghetti with meatballs', price: 13.99, category: 'Main Course' },
  { id: '8', name: 'Chicken Wings', description: 'Spicy buffalo wings', price: 9.99, category: 'Appetizer' },
  { id: '9', name: 'Fish Tacos', description: 'Grilled fish tacos', price: 11.99, category: 'Main Course' },
  { id: '10', name: 'Onion Rings', description: 'Crispy battered onion rings', price: 4.99, category: 'Side' },
  { id: '11', name: 'Milkshake', description: 'Creamy vanilla milkshake', price: 4.99, category: 'Beverage' },
  { id: '12', name: 'Cheesecake', description: 'New York style cheesecake', price: 6.99, category: 'Dessert' },
];

const ProductCard = ({ item }: { item: Product }) => (
  <Card>
    <Text style={sharedStyles.itemName}>{item.name}</Text>
    <Text style={sharedStyles.itemDetail}>{item.description}</Text>
    <Text style={sharedStyles.itemDetail}>Category: {item.category}</Text>
    <Text style={sharedStyles.itemDetail}>Price: ${item.price.toFixed(2)}</Text>
  </Card>
);

const generateProductManagementContent = (): PageContent => ({
  leftColumn: {
    title: "Product Categories",
    content: (
      <View>
        <Text style={sharedStyles.title}>Product Categories</Text>
        {/* Add a list or grid of product categories here */}
      </View>
    )
  },
  middleColumn: {
    title: "Product List",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Product List</Text>
        <CardGrid
          data={dummyProducts.map(item => ({
            content: <ProductCard item={item} />
          }))}
          renderItem={(item) => item.content}
        />
      </View>
    )
  },
  rightColumn: {
    title: "Product Details",
    content: (
      <View>
        <Text style={sharedStyles.title}>Product Details</Text>
        {/* Add form for adding/editing product details here */}
      </View>
    )
  }
});

const ProductManagement: React.FC = () => {
  return <ScreenContent generatePageContent={generateProductManagementContent} />;
};

export default ProductManagement;