import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDashboardStore } from '../store/dashboardStore';
import { sharedStyles } from '../styles/sharedStyles';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon }) => (
  <View style={styles.card}>
    <Ionicons name={icon} size={24} color="#007AFF" />
    <Text style={styles.cardTitle}>{title}</Text>
    <Text style={styles.cardValue}>{value}</Text>
  </View>
);

export default function DashboardContent() {
  const { totalRevenue, totalOrders, activeTables, newCustomers } = useDashboardStore();

  return (
    <View style={[sharedStyles.container, styles.dashboardContent]}>
      <DashboardCard title="Total Revenue" value={`$${totalRevenue.toFixed(2)}`} icon="cash" />
      <DashboardCard title="Orders" value={totalOrders} icon="cart" />
      <DashboardCard title="Active Tables" value={activeTables} icon="restaurant" />
      <DashboardCard title="New Customers" value={newCustomers} icon="people" />
    </View>
  );
}

const styles = StyleSheet.create({
  dashboardContent: {
    ...sharedStyles.content,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    ...sharedStyles.itemDetail,
    marginTop: 8,
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 4,
  },
});