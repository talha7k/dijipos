import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import DashboardContent from '../screens/DashboardContent';
import OrdersContent from '../screens/OrdersContent';
import MenuContent from '../screens/MenuContent';
import CustomersContent from '../screens/CustomersContent';
import ManagementContent from '../screens/ManagementContent';
import ReportsContent from '../screens/Reports';

const Tab = createBottomTabNavigator();

export function AppNavigator() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={DashboardContent} />
      <Tab.Screen name="Orders" component={OrdersContent} />
      <Tab.Screen name="Menu" component={MenuContent} />
      <Tab.Screen name="Customers" component={CustomersContent} />
      <Tab.Screen name="Management" component={ManagementContent} />
      <Tab.Screen name="Reports" component={ReportsContent} />
    </Tab.Navigator>
  );
}