// components/InvoiceSummaryTable.tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

interface InvoiceItem {
  name: string;
  sku: string;
  mrp: number;
  ptr: number;
  discount: number;
  finalPrice: number;
}

const InvoiceSummaryTable = ({ items }: { items: InvoiceItem[] }) => {
  const grandTotal = items.reduce((sum, item) => sum + item.finalPrice, 0);

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Invoice Summary</Text>
      <ScrollView horizontal>
        <View>
          <View style={[styles.row, styles.header]}>
            <Text style={styles.cell}>SKU</Text>
            <Text style={styles.cell}>MRP</Text>
            <Text style={styles.cell}>PTR</Text>
            <Text style={styles.cell}>Discount %</Text>
            <Text style={styles.cell}>Total</Text>
          </View>

          {items.map((item, index) => (
            <View key={index} style={styles.row}>
              <Text style={styles.cell}>{item.sku}</Text>
              <Text style={styles.cell}>₹{item.mrp}</Text>
              <Text style={styles.cell}>₹{item.ptr}</Text>
              <Text style={styles.cell}>{item.discount}%</Text>
              <Text style={styles.cell}>₹{item.finalPrice.toFixed(2)}</Text>
            </View>
          ))}

          <View style={[styles.row, styles.footer]}>
            <Text style={styles.cell}>Total</Text>
            <Text style={styles.cell}></Text>
            <Text style={styles.cell}></Text>
            <Text style={styles.cell}></Text>
            <Text style={styles.cell}>₹{grandTotal.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 20, marginBottom: 10 },
  heading: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  row: { flexDirection: 'row' },
  header: { backgroundColor: '#ccc' },
  footer: { backgroundColor: '#eee' },
  cell: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 100,
    textAlign: 'center'
  }
});

export default InvoiceSummaryTable;
