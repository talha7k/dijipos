import React from 'react';
import { View, Text } from 'react-native';
import { sharedStyles } from '../styles/sharedStyles';

export default function RestaurantManagement() {
  return (
    <View style={sharedStyles.container}>
      <Text style={sharedStyles.title}>Restaurant Management</Text>
      {/* Add restaurant management functionality here */}
    </View>
  );
}