import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { sharedStyles } from '../styles/sharedStyles';
import { ThreeColumnLayout } from '../components/ThreeColumnLayout';
import { CardGrid } from '../components/CardGrid';
import { Card } from '../components/Card';

interface PaymentType {
  id: string;
  name: string;
  description: string;
}

const dummyPaymentTypes: PaymentType[] = [
  { id: '1', name: 'Cash', description: 'Traditional cash payment' },
  { id: '2', name: 'Credit Card', description: 'Visa, MasterCard, Amex' },
  { id: '3', name: 'Mobile Wallet', description: 'Apple Pay, Google Pay' },
  { id: '4', name: 'Debit Card', description: 'Direct bank account debit' },
  { id: '5', name: 'PayPal', description: 'Online payment system' },
  { id: '6', name: 'Cryptocurrency', description: 'Bitcoin, Ethereum, etc.' },
  { id: '7', name: 'Gift Card', description: 'Store-specific prepaid card' },
  { id: '8', name: 'Bank Transfer', description: 'Direct bank-to-bank transfer' },
  { id: '9', name: 'Check', description: 'Paper check payment' },
  { id: '10', name: 'Venmo', description: 'Peer-to-peer payment app' },
];

const PaymentTypeCard = ({ item }: { item: PaymentType }) => (
  <Card>
    <Text style={sharedStyles.itemName}>{item.name}</Text>
    <Text style={sharedStyles.itemDetail}>{item.description}</Text>
  </Card>
);

export default function PaymentTypeManagement() {
  const MainContent = (
    <View style={sharedStyles.container}>
      <Text style={sharedStyles.title}>Payment Type Management</Text>
      <CardGrid
        data={dummyPaymentTypes}
        renderItem={(item) => <PaymentTypeCard item={item} />}
      />
    </View>
  );

  return (
    <ThreeColumnLayout
      left={<Text style={sharedStyles.title}>Payment Types</Text>}
      center={MainContent}
      right={<Text style={sharedStyles.title}>Payment Stats</Text>}
    />
  );
}