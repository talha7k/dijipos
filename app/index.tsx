import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from './screens/Dashboard';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Dashboard">
      <Stack.Screen 
        name="Dashboard" 
        component={Dashboard} 
        options={{ headerShown: false }}
      />
      {/* Add other screens here if needed */}
    </Stack.Navigator>
  );
}