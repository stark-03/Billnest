import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, FlatList, Alert } from 'react-native';
import { getDBConnection } from '../database/Database';
import { generateInvoicePDF } from '../services/pdfGenerator';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/DrawerNavigator'; 
import InvoiceSummaryTable from '../components/InvoiceSummaryTable'; 


interface Product {
  id: number;
  name: string;
  sku: string;
  mrp: number;
  ptr: number;
}

interface InvoiceItem extends Product {
  discount: number;
  finalPrice: number;
}

const CreateInvoiceScreen: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [discount, setDiscount] = useState<string>('');
  const [supplier, setSupplier] = useState<string>('');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [editingInvoiceId, setEditingInvoiceId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const route = useRoute<RouteProp<RootStackParamList, 'CreateInvoice'>>();
  const navigation = useNavigation();

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const db = await getDBConnection();
        const [results] = await db.executeSql('SELECT * FROM products');
        setProducts(results.rows.raw());
      } catch (error) {
        console.error('Error loading products:', error);
        Alert.alert('Error', 'Failed to load products');
      }
    };
    loadProducts();
  }, []);

  useEffect(() => {
    if (route.params?.invoiceId) {
      loadInvoice(route.params.invoiceId);
    }
  }, [route.params]);

  const loadInvoice = async (invoiceId: number) => {
    try {
      const db = await getDBConnection();
      const [invoiceResult] = await db.executeSql('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
      
      if (invoiceResult.rows.length === 0) {
        Alert.alert('Error', 'Invoice not found');
        return;
      }

      const invoice = invoiceResult.rows.item(0);
      setSupplier(invoice.supplier_name);
      setEditingInvoiceId(invoiceId);

      const [itemsResult] = await db.executeSql('SELECT * FROM invoice_items WHERE invoice_id = ?', [invoiceId]);
      const items = itemsResult.rows.raw();
      setInvoiceItems(items.map((item: any) => ({
        id: 0,
        name: item.product_name,
        sku: item.sku,
        mrp: item.mrp,
        ptr: item.ptr,
        discount: item.discount,
        finalPrice: item.final_price
      })));
    } catch (error) {
      console.error('Error loading invoice:', error);
      Alert.alert('Error', 'Failed to load invoice');
    }
  };

  const addToInvoice = () => {
    if (!selectedProduct || !discount) {
      Alert.alert('Error', 'Please select a product and enter discount');
      return;
    }

    const discountValue = parseFloat(discount);
    if (isNaN(discountValue) || discountValue < 0 || discountValue > 100) {
      Alert.alert('Error', 'Please enter a valid discount percentage (0-100)');
      return;
    }

    const discountAmount = (selectedProduct.mrp * discountValue) / 100;
    const finalPrice = selectedProduct.mrp - discountAmount;

    setInvoiceItems([...invoiceItems, {
      ...selectedProduct,
      discount: discountValue,
      finalPrice: parseFloat(finalPrice.toFixed(2))
    }]);

    setSelectedProduct(null);
    setDiscount('');
  };

  const saveInvoiceAndGeneratePDF = async () => {
    if (!supplier.trim()) {
      Alert.alert('Error', 'Please enter supplier name');
      return;
    }

    if (invoiceItems.length === 0) {
      Alert.alert('Error', 'Please add at least one item to the invoice');
      return;
    }

    setLoading(true);
    
    try {
      const db = await getDBConnection();
      const date = new Date().toISOString();
      const total = invoiceItems.reduce((acc, item) => acc + item.finalPrice, 0);

      let invoiceId = editingInvoiceId;

      // Begin transaction
      await db.executeSql('BEGIN TRANSACTION');

      try {
        if (invoiceId) {
          // Update existing invoice
          await db.executeSql(
            'UPDATE invoices SET date = ?, total_amount = ?, supplier_name = ? WHERE id = ?', 
            [date, total, supplier.trim(), invoiceId]
          );
          
          // Delete existing items
          await db.executeSql('DELETE FROM invoice_items WHERE invoice_id = ?', [invoiceId]);
        } else {
          // Create new invoice
          const [result] = await db.executeSql(
            'INSERT INTO invoices (date, total_amount, supplier_name) VALUES (?, ?, ?)', 
            [date, total, supplier.trim()]
          );
          invoiceId = result.insertId;
        }

        // Insert invoice items
        for (const item of invoiceItems) {
          await db.executeSql(
            'INSERT INTO invoice_items (invoice_id, product_name, sku, mrp, ptr, discount, final_price) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [invoiceId, item.name, item.sku, item.mrp, item.ptr, item.discount, item.finalPrice]
          );
        }

        // Generate PDF
        const pdfPath = await generateInvoicePDF(
          invoiceId!,
          date,
          invoiceItems.map(i => ({
            product_name: i.name,
            mrp: i.mrp,
            ptr: i.ptr,
            final_price: i.finalPrice
          })),
          total,
          supplier.trim()
        );

        // Update invoice with PDF path
        await db.executeSql('UPDATE invoices SET pdf_path = ? WHERE id = ?', [pdfPath, invoiceId]);

        // Commit transaction
        await db.executeSql('COMMIT');

        Alert.alert(
          'Success', 
          `Invoice #${invoiceId} saved successfully!\nPDF generated at: ${pdfPath}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setInvoiceItems([]);
                setSupplier('');
                setEditingInvoiceId(null);
                setSelectedProduct(null);
                setDiscount('');
                
                // Navigate back to home
                navigation.goBack();
              }
            }
          ]
        );

      } catch (error) {
        // Rollback transaction on error
        await db.executeSql('ROLLBACK');
        throw error;
      }

    } catch (error) {
      console.error('Error saving invoice:', error);
      Alert.alert('Error', `Failed to save invoice: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const removeItem = (index: number) => {
    const updatedItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(updatedItems);
  };

  const total = invoiceItems.reduce((acc, item) => acc + item.finalPrice, 0);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Enter Supplier/Shop Name"
        value={supplier}
        onChangeText={setSupplier}
        style={styles.input}
        editable={!loading}
        placeholderTextColor={'grey'}
      />

      <Text style={styles.label}>Select Product:</Text>
      <View style={styles.productContainer}>
        {products.map((product) => (
          <Button
            key={product.id}
            title={`${product.name} (₹${product.mrp})`}
            onPress={() => setSelectedProduct(product)}
            color={selectedProduct?.id === product.id ? 'green' : 'gray'}
            disabled={loading}
          />
        ))}
      </View>

      {selectedProduct && (
        <View style={styles.info}>
          <Text>Product: {selectedProduct.name}</Text>
          <Text>SKU: {selectedProduct.sku}</Text>
          <Text>MRP: ₹{selectedProduct.mrp}</Text>
          <Text>PTR: ₹{selectedProduct.ptr}</Text>

          <TextInput
            placeholder="Enter Discount % (0-100)"
            keyboardType="numeric"
            value={discount}
            onChangeText={setDiscount}
            style={styles.input}
            editable={!loading}
            placeholderTextColor={'grey'}
          />
          <Button 
            title="Add to Invoice" 
            onPress={addToInvoice} 
            disabled={loading}
          />
        </View>
      )}

      <Text style={styles.label}>Invoice Items:</Text>
      <FlatList
        data={invoiceItems}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text>MRP: ₹{item.mrp} | Discount: {item.discount}%</Text>
              <Text style={styles.finalPrice}>Final: ₹{item.finalPrice}</Text>
            </View>
            <Button
              title="Remove"
              onPress={() => removeItem(index)}
              color="red"
              disabled={loading}
            />
          </View>
        )}
        ListFooterComponent={
          <Text style={styles.total}>Total: ₹{total.toFixed(2)}</Text>
        }
        style={styles.itemsList}
      />
      {invoiceItems.length > 0 && (
      <InvoiceSummaryTable items={invoiceItems} />
      )}
      <Button 
        title={loading ? 'Processing...' : (editingInvoiceId ? 'Update & Generate PDF' : 'Save & Generate PDF')}
        onPress={saveInvoiceAndGeneratePDF}
        disabled={loading || invoiceItems.length === 0}
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
  label: { 
    fontSize: 16, 
    marginBottom: 8,
    fontWeight: 'bold',
    color:'black'
  },
  input: { 
    borderBottomWidth: 1,
    marginVertical: 8,
    paddingVertical: 8,
    fontSize: 16,
    color: 'black'
  },
  productContainer: {
    marginBottom: 16
  },
  info: { 
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8
  },
  item: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  itemInfo: {
    flex: 1
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold'
  },
  finalPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green'
  },
  itemsList: {
    maxHeight: 200,
    marginVertical: 16
  },
  total: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginTop: 16,
    textAlign: 'center',
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8
  },
});

export default CreateInvoiceScreen;