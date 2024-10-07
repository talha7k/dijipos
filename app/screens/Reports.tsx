import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent, PageContent } from '../components/ScreenContent';
import { CardGrid } from '../components/CardGrid';
import { Card } from '../components/Card';
import { sharedStyles } from '../styles/sharedStyles';

interface Report {
  id: string;
  name: string;
  description: string;
}

const dummyReports: Report[] = [
  { id: '1', name: 'Sales Report', description: 'Overview of sales performance' },
  { id: '2', name: 'Inventory Report', description: 'Current stock levels' },
  { id: '3', name: 'Customer Report', description: 'Customer demographics and behavior' },
  { id: '4', name: 'Financial Report', description: 'Profit and loss statement' },
  { id: '5', name: 'Employee Performance', description: 'Staff productivity metrics' },
  { id: '6', name: 'Menu Analysis', description: 'Popularity and profitability of menu items' },
  { id: '7', name: 'Marketing ROI', description: 'Return on investment for marketing campaigns' },
  { id: '8', name: 'Table Turnover', description: 'Average dining time and table efficiency' },
  { id: '9', name: 'Customer Feedback', description: 'Summary of customer reviews and ratings' },
  { id: '10', name: 'Waste Management', description: 'Food waste and cost reduction analysis' },
];

const ReportCard = ({ item }: { item: Report }) => (
  <Card>
    <Text style={sharedStyles.itemName}>{item.name}</Text>
    <Text style={sharedStyles.itemDetail}>{item.description}</Text>
  </Card>
);

const generateReportsContent = (): PageContent => ({
  leftColumn: {
    title: "Report Types",
    content: (
      <View>
        <Text style={sharedStyles.title}>Report Types</Text>
        {/* Add a list of report types here */}
      </View>
    )
  },
  middleColumn: {
    title: "Reports",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Reports</Text>
        <CardGrid
          data={dummyReports.map(item => ({
            content: <ReportCard item={item} />
          }))}
          renderItem={(item) => item.content}
        />
      </View>
    )
  },
  rightColumn: {
    title: "Report Summary",
    content: (
      <View>
        <Text style={sharedStyles.title}>Report Summary</Text>
        {/* Add report summary or details here */}
      </View>
    )
  }
});

const Reports: React.FC = () => {
  return <ScreenContent generatePageContent={generateReportsContent} />;
};

export default Reports;