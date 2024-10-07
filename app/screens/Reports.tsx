import React from 'react';
import { View, Text } from 'react-native';
import { sharedStyles } from '../styles/sharedStyles';

export default function Reports() {
  return (
    <View style={sharedStyles.container}>
      <Text style={sharedStyles.title}>Reports</Text>
      {/* Add reporting functionality here */}
    </View>
  );
}