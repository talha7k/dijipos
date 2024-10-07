import React from 'react';
import { View, StyleSheet, useWindowDimensions, ScrollView } from 'react-native';

interface ThreeColumnLayoutProps {
  left?: React.ReactNode;
  center: React.ReactNode;
  right?: React.ReactNode;
}

export const ThreeColumnLayout: React.FC<ThreeColumnLayoutProps> = ({ left, center, right }) => {
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 1024; // Large screens (3 columns)
  const isMediumScreen = width > 768 && width <= 1024; // Medium screens (2 columns)

  const ScrollableColumn = ({ children }: { children: React.ReactNode }) => (
    <ScrollView 
      style={styles.scrollableColumn}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.columnContent}>{children}</View>
    </ScrollView>
  );

  if (isLargeScreen) {
    return (
      <View style={styles.container}>
        <ScrollableColumn>{left}</ScrollableColumn>
        <ScrollableColumn>{center}</ScrollableColumn>
        <ScrollableColumn>{right}</ScrollableColumn>
      </View>
    );
  } else if (isMediumScreen) {
    return (
      <View style={styles.containerMedium}>
        <ScrollableColumn>
          {left}
          {center}
        </ScrollableColumn>
        <ScrollableColumn>{right}</ScrollableColumn>
      </View>
    );
  } else {
    // Small screens (1 column)
    return (
      <ScrollView 
        style={styles.mobileContainer}
        showsVerticalScrollIndicator={false}
      >
        {left && <View style={styles.mobileSection}>{left}</View>}
        <View style={styles.mobileSection}>{center}</View>
        {right && <View style={styles.mobileSection}>{right}</View>}
      </ScrollView>
    );
  }
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flex: 1,
  },
  containerMedium: {
    flexDirection: 'row',
    flex: 1,
  },
  scrollableColumn: {
    flex: 1,
  },
  columnContent: {
    padding: 10,
  },
  mobileContainer: {
    flex: 1,
  },
  mobileSection: {
    padding: 10,
  },
});