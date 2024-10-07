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
        headerShown: false,
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
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Orders" component={OrdersContent} />
      <Tab.Screen name="Menu" component={MenuContent} />
      <Tab.Screen name="Customers" component={CustomersContent} />
      <Tab.Screen name="Management" component={ManagementStack} />
    </Tab.Navigator>
  );
}

function ManagementStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ManagementOverview" component={ManagementContent} />
      <Stack.Screen name="ProductManagement" component={ProductManagement} />
      <Stack.Screen name="RestaurantManagement" component={RestaurantManagement} />
      <Stack.Screen name="PaymentTypeManagement" component={PaymentTypeManagement} />
      <Stack.Screen name="Reports" component={Reports} />
      <Stack.Screen name="ProductCategoryManagement" component={ProductCategoryManagement} />
      <Stack.Screen name="OrderCategoryManagement" component={OrderCategoryManagement} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen 
        name="Main" 
        component={MainTabs} 
        options={({ route }) => ({
          headerTitle: getHeaderTitle(route),
        })}
      />
    </Stack.Navigator>
  );
}

function getHeaderTitle(route: any) {
  // Get the active route name
  const routeName = route.state
    ? route.state.routes[route.state.index].name
    : route.params?.screen || 'Dashboard';

  // Check if we're in the Management tab
  if (routeName === 'Management') {
    // Get the active management screen
    const managementRoute = route.state?.routes[4].state?.routes[route.state.routes[4].state.index];
    if (managementRoute) {
      switch (managementRoute.name) {
        case 'ManagementOverview':
          return 'Management';
        case 'ProductManagement':
          return 'Manage Products';
        case 'RestaurantManagement':
          return 'Manage Restaurants';
        case 'PaymentTypeManagement':
          return 'Payment Types';
        case 'Reports':
          return 'Reports';
        case 'ProductCategoryManagement':
          return 'Product Categories';
        case 'OrderCategoryManagement':
          return 'Order Categories';
      }
    }
    return 'Management';
  }

  // For other tabs
  switch (routeName) {
    case 'Dashboard':
      return 'Dashboard';
    case 'Orders':
      return 'Orders';
    case 'Menu':
      return 'Menu';
    case 'Customers':
      return 'Customers';
    default:
      return routeName;
  }
}