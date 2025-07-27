import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from '../screens/HomeScreen';
import CreateInvoiceScreen from '../screens/CreateInvoiceScreen';
import InvoiceListScreen from '../screens/InvoiceListScreen';

export type RootStackParamList = {
  Home: undefined;
  CreateInvoice: { invoiceId?: number };
  InvoiceList: undefined;
};

const Drawer = createDrawerNavigator<RootStackParamList>();

const DrawerNavigator: React.FC = () => {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Home" component={HomeScreen} />
      <Drawer.Screen name="CreateInvoice" component={CreateInvoiceScreen} />
      <Drawer.Screen name="InvoiceList" component={InvoiceListScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;