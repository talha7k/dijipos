import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import Dashboard from './screens/Dashboard';
import OrdersContent from './screens/OrdersContent';
import MenuContent from './screens/MenuContent';
import CustomersContent from './screens/CustomersContent';
import ManagementContent from './screens/ManagementContent';
import ProductManagement from './screens/ProductManagement';
import RestaurantManagement from './screens/RestaurantManagement';
import PaymentTypeManagement from './screens/PaymentTypeManagement';
import Reports from './screens/Reports';
import ProductCategoryManagement from './screens/ProductCategoryManagement';
import OrderCategoryManagement from './screens/OrderCategoryManagement';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Orders') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Menu') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Customers') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Management') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="Orders" component={OrdersContent} options={{ title: 'Orders' }} />
      <Tab.Screen name="Menu" component={MenuContent} options={{ title: 'Menu' }} />
      <Tab.Screen name="Customers" component={CustomersContent} options={{ title: 'Customers' }} />
      <Tab.Screen name="Management" component={ManagementStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

function ManagementStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ManagementOverview" component={ManagementContent} options={{ title: 'Management' }} />
      <Stack.Screen name="ProductManagement" component={ProductManagement} options={{ title: 'Manage Products' }} />
      <Stack.Screen name="RestaurantManagement" component={RestaurantManagement} options={{ title: 'Manage Restaurants' }} />
      <Stack.Screen name="PaymentTypeManagement" component={PaymentTypeManagement} options={{ title: 'Payment Types' }} />
      <Stack.Screen name="Reports" component={Reports} options={{ title: 'Reports' }} />
      <Stack.Screen name="ProductCategoryManagement" component={ProductCategoryManagement} options={{ title: 'Product Categories' }} />
      <Stack.Screen name="OrderCategoryManagement" component={OrderCategoryManagement} options={{ title: 'Order Categories' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}