import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MenuContent() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu Items</Text>
      <Text style={styles.description}>Manage your restaurant's menu items.</Text>
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