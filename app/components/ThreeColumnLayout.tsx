import React from 'react';
import { View, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';
import { ColumnContent } from './ScreenContent';

interface ThreeColumnLayoutProps {
  leftContent: ColumnContent;
  middleContent: ColumnContent;
  rightContent: ColumnContent;
}

export function ThreeColumnLayout({ leftContent, middleContent, rightContent }: ThreeColumnLayoutProps) {
  const { width, height } = useWindowDimensions();
  const isSmallScreen = width < 768;
  const isMediumScreen = width >= 768 && width < 1024;

  const columnStyle = [
    styles.column,
    isSmallScreen && styles.fullWidthColumn,
    isMediumScreen && styles.halfWidthColumn,
    { height: height - 20 }, // Subtract any necessary padding or margins
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={columnStyle} contentContainerStyle={styles.scrollContent}>
        {leftContent.content}
      </ScrollView>
      <ScrollView style={columnStyle} contentContainerStyle={styles.scrollContent}>
        {middleContent.content}
      </ScrollView>
      <ScrollView style={columnStyle} contentContainerStyle={styles.scrollContent}>
        {rightContent.content}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  column: {
    flex: 1,
    minWidth: '33%',
  },
  fullWidthColumn: {
    width: '100%',
  },
  halfWidthColumn: {
    width: '50%',
  },
  scrollContent: {
    padding: 10,
  },
});