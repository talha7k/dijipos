import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DashboardContent from './DashboardContent';
import OrdersContent from './OrdersContent';
import MenuContent from './MenuContent';
import CustomersContent from './CustomersContent';

interface TabButtonProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  onPress: () => void;
}

const TabButton: React.FC<TabButtonProps> = ({ title, icon, isActive, onPress }) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.activeTabButton]}
    onPress={onPress}
  >
    <Ionicons name={icon} size={24} color={isActive ? '#007AFF' : '#8E8E93'} />
    <Text style={[styles.tabButtonText, isActive && styles.activeTabButtonText]}>{title}</Text>
  </TouchableOpacity>
);

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'orders':
        return <OrdersContent />;
      case 'menu':
        return <MenuContent />;
      case 'customers':
        return <CustomersContent />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Restaurant POS</Text>
      </View>
      <ScrollView style={styles.content}>
        {renderContent()}
      </ScrollView>
      <View style={styles.tabBar}>
        <TabButton
          title="Dashboard"
          icon="home"
          isActive={activeTab === 'dashboard'}
          onPress={() => setActiveTab('dashboard')}
        />
        <TabButton
          title="Orders"
          icon="cart"
          isActive={activeTab === 'orders'}
          onPress={() => setActiveTab('orders')}
        />
        <TabButton
          title="Menu"
          icon="restaurant"
          isActive={activeTab === 'menu'}
          onPress={() => setActiveTab('menu')}
        />
        <TabButton
          title="Customers"
          icon="people"
          isActive={activeTab === 'customers'}
          onPress={() => setActiveTab('customers')}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  tabButton: {
    alignItems: 'center',
    padding: 12,
  },
  activeTabButton: {
    borderTopWidth: 2,
    borderTopColor: '#007AFF',
  },
  tabButtonText: {
    marginTop: 4,
    fontSize: 12,
    color: '#8E8E93',
  },
  activeTabButtonText: {
    color: '#007AFF',
  },
});