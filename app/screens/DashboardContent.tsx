import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent, PageContent } from '../components/ScreenContent';
import { CardGrid } from '../components/CardGrid';
import { Card } from '../components/Card';
import { sharedStyles } from '../styles/sharedStyles';

interface DashboardItem {
  id: string;
  title: string;
  value: string;
}

const dummyDashboardItems: DashboardItem[] = [
  { id: '1', title: 'Total Sales', value: '$10,234' },
  { id: '2', title: 'Orders Today', value: '45' },
  { id: '3', title: 'Active Tables', value: '8' },
  { id: '4', title: 'Avg. Order Value', value: '$56' },
  { id: '5', title: 'Weekly Revenue', value: '$72,150' },
  { id: '6', title: 'Monthly Profit', value: '$25,600' },
  { id: '7', title: 'Customer Satisfaction', value: '4.7/5' },
  { id: '8', title: 'Inventory Turnover', value: '3.2' },
  { id: '9', title: 'Employee Productivity', value: '92%' },
  { id: '10', title: 'Table Turnover Rate', value: '1.8/hour' },
  { id: '11', title: 'Online Orders', value: '32%' },
  { id: '12', title: 'Loyalty Program Members', value: '1,250' },
];

const DashboardCard = ({ item }: { item: DashboardItem }) => (
  <Card>
    <Text style={sharedStyles.itemName}>{item.title}</Text>
    <Text style={sharedStyles.itemValue}>{item.value}</Text>
  </Card>
);

const generateDashboardContent = (): PageContent => ({
  leftColumn: {
    title: "Dashboard Overview",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Dashboard Overview</Text>
        <CardGrid
          data={dummyDashboardItems.map(item => ({
            content: <DashboardCard item={item} />
          }))}
          renderItem={(item) => item.content}
          defaultColumnConfig={{ small: 1, medium: 2, large: 3 }}
        />
      </View>
    )
  },
  middleColumn: {
    title: "Recent Activity",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Recent Activity</Text>
        <Text>List of recent orders or actions</Text>
      </View>
    )
  },
  rightColumn: {
    title: "Quick Actions",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Quick Actions</Text>
        <Text>Buttons for common tasks</Text>
      </View>
    )
  }
});

const DashboardContent: React.FC = () => {
  return <ScreenContent generatePageContent={generateDashboardContent} />;
};

export default DashboardContent;