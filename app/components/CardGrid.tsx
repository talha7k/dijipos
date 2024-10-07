import React from 'react';
import { View, StyleSheet, FlatList, useWindowDimensions } from 'react-native';

interface CardGridProps<T> {
  data: T[];
  renderItem: (item: T) => React.ReactNode;
  numColumns?: number;
}

export function CardGrid<T>({ data, renderItem, numColumns = 3 }: CardGridProps<T>) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width <= 768;
  const isMediumScreen = width > 768 && width <= 1024;

  const getNumColumns = () => {
    if (isSmallScreen) return 1;
    if (isMediumScreen) return 2;
    return numColumns;
  };

  return (
    <FlatList
      data={data}
      renderItem={({ item }) => renderItem(item)}
      keyExtractor={(item, index) => index.toString()}
      numColumns={getNumColumns()}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={styles.container}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});