import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Platform, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

export const generateInvoicePDF = async (
  invoiceId: number,
  date: string,
  items: any[],
  total: number,
  supplier: string
): Promise<string> => {
  const formattedDate = new Date(date).toLocaleDateString();
  const rows = items.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${item.product_name}</td>
      <td>₹${item.mrp}</td>
      <td>₹${item.ptr}</td>
      <td>₹${item.final_price.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <html>
      <body>
        <h2>Invoice #${invoiceId}</h2>
        <p>Date: ${formattedDate}</p>
        <p>Supplier: ${supplier}</p>
        <table border="1" cellspacing="0" cellpadding="5">
          <thead>
            <tr><th>Sr</th><th>Product</th><th>MRP</th><th>PTR</th><th>Total</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <h3>Total: ₹${total.toFixed(2)}</h3>
      </body>
    </html>
  `;

  // ✅ Save to app-specific path
  const appDir = Platform.OS === 'android'
    ? RNFS.DocumentDirectoryPath // safe, doesn't need permissions
    : RNFS.DocumentDirectoryPath;

  const filePath = `${appDir}/Invoice_${invoiceId}.pdf`;

  try {
    const options = {
      html,
      fileName: `Invoice_${invoiceId}`,
      filePath,
    };

    const file = await RNHTMLtoPDF.convert(options);

    if (!file?.filePath) throw new Error('PDF file path is undefined');

    // ✅ Offer user to open/share the file (most usable path)
    Alert.alert('PDF Generated', 'You can now share or open the invoice.');

    await Share.open({
      url: `file://${file.filePath}`,
      type: 'application/pdf',
      failOnCancel: false,
    });

    return file.filePath;
  } catch (err) {
    console.error('PDF generation failed:', err);
    Alert.alert('PDF Error', 'Failed to generate PDF.');
    return '';
  }
};
