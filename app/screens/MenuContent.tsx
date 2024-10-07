import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent, PageContent } from '../components/ScreenContent';
import { CardGrid } from '../components/CardGrid';
import { Card } from '../components/Card';
import { sharedStyles } from '../styles/sharedStyles';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: string;
}

const dummyMenuItems: MenuItem[] = [
  { id: '1', name: 'Classic Burger', description: 'Beef patty with lettuce, tomato, and cheese', price: '$9.99' },
  { id: '2', name: 'Margherita Pizza', description: 'Tomato sauce, mozzarella, and basil', price: '$12.99' },
  { id: '3', name: 'Caesar Salad', description: 'Romaine lettuce, croutons, and Caesar dressing', price: '$7.99' },
  { id: '4', name: 'Grilled Chicken Sandwich', description: 'Grilled chicken breast with avocado and bacon', price: '$10.99' },
  { id: '5', name: 'Vegetarian Pasta', description: 'Penne with mixed vegetables and tomato sauce', price: '$11.99' },
  { id: '6', name: 'Fish and Chips', description: 'Battered cod with crispy fries', price: '$13.99' },
  { id: '7', name: 'Steak Frites', description: 'Grilled sirloin steak with french fries', price: '$18.99' },
  { id: '8', name: 'Sushi Roll Platter', description: 'Assorted sushi rolls with wasabi and ginger', price: '$22.99' },
  { id: '9', name: 'Mushroom Risotto', description: 'Creamy risotto with wild mushrooms', price: '$14.99' },
  { id: '10', name: 'BBQ Ribs', description: 'Slow-cooked pork ribs with BBQ sauce', price: '$16.99' },
  { id: '11', name: 'Seafood Paella', description: 'Spanish rice dish with mixed seafood', price: '$20.99' },
  { id: '12', name: 'Chocolate Lava Cake', description: 'Warm chocolate cake with a gooey center', price: '$6.99' },
];

const MenuItemCard = ({ item }: { item: MenuItem }) => (
  <Card>
    <Text style={sharedStyles.itemName}>{item.name}</Text>
    <Text style={sharedStyles.itemDetail}>{item.description}</Text>
    <Text style={sharedStyles.itemPrice}>{item.price}</Text>
  </Card>
);

const generateMenuContent = (): PageContent => ({
  leftColumn: {
    title: "Menu Categories",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Menu Categories</Text>
        <Text>List of menu categories</Text>
      </View>
    )
  },
  middleColumn: {
    title: "Menu Items",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Menu Items</Text>
        <CardGrid
          data={dummyMenuItems.map(item => ({
            content: <MenuItemCard item={item} />
          }))}
          renderItem={(item) => item.content}
        />
      </View>
    )
  },
  rightColumn: {
    title: "Item Details",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Item Details</Text>
        <Text>Details of selected menu item</Text>
      </View>
    )
  }
});

const MenuContent: React.FC = () => {
  return <ScreenContent generatePageContent={generateMenuContent} />;
};

export default MenuContent;