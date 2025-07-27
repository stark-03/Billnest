import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

export const getDBConnection = async (): Promise<SQLiteDatabase> => {
  return SQLite.openDatabase({ name: 'billing.db', location: 'default' });
};

export const initDB = async (): Promise<void> => {
  const db = await getDBConnection();

  // Create tables if not exist
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      sku TEXT,
      mrp REAL,
      ptr REAL
    )
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT,
      total_amount REAL
      -- Do not add new columns here directly if table already exists
    )
  `);

  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER,
      product_name TEXT,
      sku TEXT,
      mrp REAL,
      ptr REAL,
      discount REAL,
      final_price REAL,
      FOREIGN KEY(invoice_id) REFERENCES invoices(id)
    )
  `);

  // 🔁 Schema Migration: Add missing columns if needed
  const migrateInvoicesTable = async () => {
    const [result] = await db.executeSql(`PRAGMA table_info(invoices)`);
    const existingColumns = [];
    for (let i = 0; i < result.rows.length; i++) {
      existingColumns.push(result.rows.item(i).name);
    }

    if (!existingColumns.includes('supplier_name')) {
      await db.executeSql(`ALTER TABLE invoices ADD COLUMN supplier_name TEXT`);
      console.log('Added supplier_name column to invoices table.');
    }

    if (!existingColumns.includes('pdf_path')) {
      await db.executeSql(`ALTER TABLE invoices ADD COLUMN pdf_path TEXT`);
      console.log('Added pdf_path column to invoices table.');
    }
  };

  await migrateInvoicesTable();

  // Preload default products
  const [results] = await db.executeSql('SELECT COUNT(*) as count FROM products');
  const count = results.rows.item(0).count;

  if (count === 0) {
    const defaultProducts = [
      ['Eno', 'ENO001', 60, 52.17],
      ['Sensodyne Toothpaste', 'SENSO001', 140, 121.74],
      ['Tooth Brush', 'TB001', 65, 48.15],
      ['Iodex', 'IOD001', 180, 156.52],
    ];

    for (const [name, sku, mrp, ptr] of defaultProducts) {
      await db.executeSql(
        'INSERT INTO products (name, sku, mrp, ptr) VALUES (?, ?, ?, ?)',
        [name, sku, mrp, ptr]
      );
    }

    console.log('Default products inserted.');
  }

  console.log('Database initialized');
};
