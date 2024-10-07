import React, { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { ColumnContent } from './ScreenContent';

interface ColumnConfig {
  small?: number;
  medium?: number;
  large?: number;
}

interface CardGridProps {
  data: ColumnContent[];
  renderItem: (item: ColumnContent) => React.ReactElement;
  columnConfig?: ColumnConfig;
  defaultColumnConfig?: ColumnConfig;
}

export function CardGrid({
  data,
  renderItem,
  columnConfig = {},
  defaultColumnConfig = { small: 1, medium: 2, large: 2 }
}: CardGridProps) {
  const { width } = useWindowDimensions();
  const isSmallScreen = width <= 768;
  const isMediumScreen = width > 768 && width <= 1024;

  const columnCount = useMemo(() => {
    if (isSmallScreen) return columnConfig.small || defaultColumnConfig.small || 1;
    if (isMediumScreen) return columnConfig.medium || defaultColumnConfig.medium || 2;
    return columnConfig.large || defaultColumnConfig.large || 2;
  }, [isSmallScreen, isMediumScreen, columnConfig, defaultColumnConfig]);

  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < data.length; i += columnCount) {
      result.push(data.slice(i, i + columnCount));
    }
    return result;
  }, [data, columnCount]);

  return (
    <View style={styles.container}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((item, columnIndex) => (
            <View key={columnIndex} style={[styles.gridItem, { width: `${100 / columnCount}%` }]}>
              {renderItem(item)}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  gridItem: {
    padding: 8,
  },
});