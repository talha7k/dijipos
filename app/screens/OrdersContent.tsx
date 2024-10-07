import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function OrdersContent() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recent Orders</Text>
      <Text style={styles.description}>You have 265 orders this month.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#8E8E93',
  },
});