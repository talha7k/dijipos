import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { sharedStyles } from '../styles/sharedStyles';
import { ThreeColumnLayout } from '../components/ThreeColumnLayout';
import { CardGrid } from '../components/CardGrid';
import { Card } from '../components/Card';

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

export default function Reports() {
  const MainContent = (
    <View style={sharedStyles.container}>
      <Text style={sharedStyles.title}>Reports</Text>
      <CardGrid
        data={dummyReports}
        renderItem={(item) => <ReportCard item={item} />}
      />
    </View>
  );

  return (
    <ThreeColumnLayout
      left={<Text style={sharedStyles.title}>Report Types</Text>}
      center={MainContent}
      right={<Text style={sharedStyles.title}>Report Summary</Text>}
    />
  );
}