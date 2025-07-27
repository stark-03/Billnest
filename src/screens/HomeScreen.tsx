import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, StyleSheet } from 'react-native';
import { FAB } from 'react-native-paper';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/DrawerNavigator';
import { getDBConnection } from '../database/Database';
import { useNavigation } from '@react-navigation/native';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [invoiceCount, setInvoiceCount] = useState(0);
  const [recentInvoices, setRecentInvoices] = useState<any[]>([]);

  useEffect(() => {
    const loadSummary = async () => {
      const db = await getDBConnection();
      const [countResult] = await db.executeSql('SELECT COUNT(*) as count FROM invoices');
      const [latestInvoices] = await db.executeSql('SELECT * FROM invoices ORDER BY date DESC LIMIT 3');
      setInvoiceCount(countResult.rows.item(0).count);
      setRecentInvoices(latestInvoices.rows.raw());
    };
    loadSummary();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Total Invoices: {invoiceCount}</Text>

      <Text style={styles.subtitle}>Recent Invoices:</Text>
      <FlatList
        data={recentInvoices}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>Invoice #{item.id}</Text>
            <Text>Date: {new Date(item.date).toLocaleDateString()}</Text>
            <Text>Supplier: {item.supplier_name}</Text>
            <Text>Total: ₹{item.total_amount}</Text>
          </View>
        )}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateInvoice', {})}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10
  },
  subtitle: {
    fontSize: 18,
    marginTop: 10
  },
  item: {
    padding: 10,
    borderBottomWidth: 1,
    marginTop: 5
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: '#6200ee',
    zIndex: 999,
    elevation: 5,
  },
});

export default HomeScreen;
