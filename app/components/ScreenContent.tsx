import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThreeColumnLayout } from './ThreeColumnLayout';

export interface ColumnContent {
  title?: string;
  content: React.ReactElement;
}

export interface PageContent {
  leftColumn: ColumnContent;
  middleColumn: ColumnContent;
  rightColumn: ColumnContent;
}

interface ScreenContentProps {
  generatePageContent: () => PageContent;
}

export function ScreenContent({ generatePageContent }: ScreenContentProps) {
  const pageContent = generatePageContent();
  return (
    <View style={styles.container}>
      <ThreeColumnLayout
        leftContent={pageContent.leftColumn}
        middleContent={pageContent.middleColumn}
        rightContent={pageContent.rightColumn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});