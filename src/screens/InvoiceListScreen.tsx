import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, Platform, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getDBConnection } from '../database/Database';
// import OpenAnything from 'react-native-openanything';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

import { RootStackParamList } from '../navigation/AppNavigator';

interface Invoice {
  id: number;
  date: string;
  total_amount: number;
  pdf_path?: string;
}

type NavigationProp = StackNavigationProp<RootStackParamList, 'InvoiceList'>;

const InvoiceListScreen: React.FC = () => {
  const [allInvoices, setAllInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    loadInvoices();
  }, []);

  useEffect(() => {
    filterInvoicesByMonth(selectedDate);
  }, [selectedDate, allInvoices]);

  const loadInvoices = async () => {
    const db = await getDBConnection();
    const [results] = await db.executeSql('SELECT * FROM invoices ORDER BY date DESC');
    const rows = results.rows.raw();
    setAllInvoices(rows);
  };

  const filterInvoicesByMonth = (date: Date) => {
    const selectedMonth = date.getMonth();
    const selectedYear = date.getFullYear();

    const filtered = allInvoices.filter((inv) => {
      const invDate = new Date(inv.date);
      return invDate.getMonth() === selectedMonth && invDate.getFullYear() === selectedYear;
    });

    setFilteredInvoices(filtered);
  };

  const showDatePicker = () => setShowPicker(true);

  const onDateChange = (event: any, selected?: Date) => {
    setShowPicker(false);
    if (selected) setSelectedDate(selected);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, marginBottom: 10 }}>
        Invoices for: {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
      </Text>

      <Button title="Pick Month" onPress={showDatePicker} />

      {showPicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onDateChange}
        />
      )}

      <FlatList
        data={filteredInvoices}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 10, borderBottomWidth: 1 }}>
            <Text>Invoice #{item.id}</Text>
            <Text>Date: {new Date(item.date).toLocaleDateString()}</Text>
            <Text>Total: ₹{item.total_amount}</Text>

            {/* {item.pdf_path && (
              <Button title="View PDF" onPress={() => OpenAnything.Pdf(item.pdf_path!)} />
            )} */}

            <TouchableOpacity
              style={{ marginTop: 8 }}
              onPress={() => navigation.navigate('CreateInvoice', { invoiceId: item.id })}
            >
              <Text style={{ color: 'blue' }}>Edit Invoice</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default InvoiceListScreen;