import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';
import CreateInvoiceScreen from '../screens/CreateInvoiceScreen';
import InvoiceListScreen from '../screens/InvoiceListScreen';

export type RootStackParamList = {
  Home: undefined;
  CreateInvoice: { invoiceId?: number };
  InvoiceList: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CreateInvoice" component={CreateInvoiceScreen} />
      <Stack.Screen name="InvoiceList" component={InvoiceListScreen} options={{ title: 'Invoice List' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
