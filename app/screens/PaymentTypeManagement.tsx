import React from 'react';
import { View, Text } from 'react-native';
import { ScreenContent, PageContent } from '../components/ScreenContent';
import { CardGrid } from '../components/CardGrid';
import { Card } from '../components/Card';
import { sharedStyles } from '../styles/sharedStyles';

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

const generatePaymentTypeManagementContent = (): PageContent => ({
  leftColumn: {
    title: "Payment Types",
    content: <Text style={sharedStyles.title}>Payment Types</Text>
  },
  middleColumn: {
    title: "Payment Type Management",
    content: (
      <View style={sharedStyles.container}>
        <Text style={sharedStyles.title}>Payment Type Management</Text>
        <CardGrid
          data={dummyPaymentTypes.map(item => ({
            content: <PaymentTypeCard item={item} />
          }))}
          renderItem={(item) => item.content}
        />
      </View>
    )
  },
  rightColumn: {
    title: "Payment Stats",
    content: <Text style={sharedStyles.title}>Payment Stats</Text>
  }
});

const PaymentTypeManagement: React.FC = () => {
  return <ScreenContent generatePageContent={generatePaymentTypeManagementContent} />;
};

export default PaymentTypeManagement;