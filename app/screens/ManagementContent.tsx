import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { sharedStyles } from '../styles/sharedStyles';
import { ThreeColumnLayout } from '../components/ThreeColumnLayout';

type RootStackParamList = {
  ProductManagement: undefined;
  RestaurantManagement: undefined;
  PaymentTypeManagement: undefined;
  Reports: undefined;
  ProductCategoryManagement: undefined;
  OrderCategoryManagement: undefined;
};

type ManagementScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface ManagementOptionProps {
  title: string;
  onPress: () => void;
}

const ManagementOption: React.FC<ManagementOptionProps> = ({ title, onPress }) => (
  <TouchableOpacity style={styles.optionButton} onPress={onPress}>
    <Text style={styles.optionButtonText}>{title}</Text>
  </TouchableOpacity>
);

export default function ManagementContent() {
  const navigation = useNavigation<ManagementScreenNavigationProp>();

  const handleOptionPress = (screen: keyof RootStackParamList) => {
    navigation.navigate(screen);
  };

  const MainContent = (
    <View style={styles.optionsContainer}>
      <ManagementOption title="Manage Products" onPress={() => handleOptionPress('ProductManagement')} />
      <ManagementOption title="Manage Restaurants" onPress={() => handleOptionPress('RestaurantManagement')} />
      <ManagementOption title="Payment Types" onPress={() => handleOptionPress('PaymentTypeManagement')} />
      <ManagementOption title="Reports" onPress={() => handleOptionPress('Reports')} />
      <ManagementOption title="Product Categories" onPress={() => handleOptionPress('ProductCategoryManagement')} />
      <ManagementOption title="Order Categories" onPress={() => handleOptionPress('OrderCategoryManagement')} />
    </View>
  );

  return (
    <ThreeColumnLayout
      left={<Text style={sharedStyles.title}>Quick Actions</Text>}
      center={MainContent}
      right={<Text style={sharedStyles.title}>Management Stats</Text>}
    />
  );
}

const styles = StyleSheet.create({
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    ...sharedStyles.button,
    ...sharedStyles.primaryButton,
    width: '48%',
    marginBottom: 16,
  },
  optionButtonText: {
    ...sharedStyles.buttonText,
  },
});