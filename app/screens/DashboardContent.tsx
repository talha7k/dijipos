import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDashboardStore } from '../store/dashboardStore';
import { sharedStyles } from '../styles/sharedStyles';
import { Card } from '../components/Card';
import { ThreeColumnLayout } from '../components/ThreeColumnLayout';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon }) => (
  <Card style={styles.dashboardCard}>
    <Ionicons name={icon} size={24} color="#007AFF" />
    <Text style={sharedStyles.itemDetail}>{title}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </Card>
);

export default function DashboardContent() {
  const { totalRevenue, totalOrders, activeTables, newCustomers } = useDashboardStore();

  const MainContent = (
    <View style={styles.dashboardContent}>
      <DashboardCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon="cash" />
      <DashboardCard title="Orders" value={totalOrders} icon="cart" />
      <DashboardCard title="Active Tables" value={activeTables} icon="restaurant" />
      <DashboardCard title="New Customers" value={newCustomers} icon="people" />
    </View>
  );

  const LeftColumn = (
    <View>
      <Text style={sharedStyles.title}>Quick Actions</Text>
      {/* Add quick action buttons or links here */}
    </View>
  );

  const RightColumn = (
    <View>
      <Text style={sharedStyles.title}>Recent Activity</Text>
      {/* Add a list of recent activities here */}
    </View>
  );

  return (
    <ThreeColumnLayout
      left={LeftColumn}
      center={MainContent}
      right={RightColumn}
    />
  );
}

const styles = StyleSheet.create({
  dashboardContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: 8,
  },
  dashboardCard: {
    width: '48%',
    marginBottom: 16,
  },
  cardValue: {
    ...sharedStyles.itemName,
    fontSize: 24,
    marginTop: 4,
  },
});