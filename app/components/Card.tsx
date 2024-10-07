import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: object;
  scrollable?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, style, scrollable = false }) => {
  const CardContent = scrollable ? ScrollView : View;

  return (
    <View style={[styles.cardContainer, style]}>
      <CardContent style={styles.cardContent}>
        {children}
      </CardContent>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { 
      width: 0, 
      height: 0 
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
  },
});