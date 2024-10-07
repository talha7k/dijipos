import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent, PageContent } from '../components/ScreenContent';

const generateManagementOverviewContent = (): PageContent => ({
  leftColumn: {
    title: "Management Overview",
    content: <View><Text>Management Overview Content</Text></View>
  },
  middleColumn: {
    title: "Key Metrics",
    content: <View><Text>Key Metrics Content</Text></View>
  },
  rightColumn: {
    title: "Quick Actions",
    content: <View><Text>Quick Actions Content</Text></View>
  }
});

const ManagementOverview: React.FC = () => {
  return <ScreenContent generatePageContent={generateManagementOverviewContent} />;
};

export default ManagementOverview;