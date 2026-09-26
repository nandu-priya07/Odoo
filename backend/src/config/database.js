import pg from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();



const { Pool, Client } = pg;

const connectionString = process.env.DATABASE_URL || process.env.Connection_string;
const isSupabase = Boolean(connectionString && connectionString.includes("supabase.co"));

const poolConfig = {
  connectionString: connectionString,
  ssl: isSupabase ? { rejectUnauthorized: false } : false,
};

export const pool = new Pool(poolConfig);
export const client = new Client(poolConfig);

export const query = (text, params) => pool.query(text, params);


export const createTables = async () => {
  if (!connectionString || connectionString.includes("[YOUR-PASSWORD]")) {
    console.warn("⚠️ Database connection string contains placeholder [YOUR-PASSWORD]. Please update backend/.env with your actual Supabase password.");
    return;
  }

  const dbClient = new Client(poolConfig);
  try {
    await dbClient.connect();

    console.log("Connected to Supabase PostgreSQL database");

    await dbClient.query(`

      CREATE EXTENSION IF NOT EXISTS "pgcrypto";

      /* =========================================
         USERS
         ========================================= */

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'warehouse_staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );


      /* =========================================
         CATEGORIES
         ========================================= */

      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );


      /* =========================================
         WAREHOUSES
         ========================================= */

      CREATE TABLE IF NOT EXISTS warehouses (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(150) NOT NULL,
        address TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );


      /* =========================================
         LOCATIONS
         ========================================= */

      CREATE TABLE IF NOT EXISTS locations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        warehouse_id UUID NOT NULL,

        name VARCHAR(150) NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_location_warehouse
          FOREIGN KEY (warehouse_id)
          REFERENCES warehouses(id)
          ON DELETE CASCADE
      );


      /* =========================================
         PRODUCTS
         ========================================= */

      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        name VARCHAR(200) NOT NULL,

        sku VARCHAR(100) UNIQUE NOT NULL,

        category_id UUID,

        unit_of_measure VARCHAR(50) NOT NULL,

        initial_stock NUMERIC(15,2) DEFAULT 0,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_product_category
          FOREIGN KEY (category_id)
          REFERENCES categories(id)
          ON DELETE SET NULL
      );


      /* =========================================
         SUPPLIERS
         ========================================= */

      CREATE TABLE IF NOT EXISTS suppliers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        name VARCHAR(200) NOT NULL,

        phone VARCHAR(30),

        email VARCHAR(255),

        address TEXT,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );


      /* =========================================
         STOCK
         ========================================= */

      CREATE TABLE IF NOT EXISTS stock (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        product_id UUID NOT NULL,

        location_id UUID NOT NULL,

        quantity NUMERIC(15,2) NOT NULL DEFAULT 0,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_stock_product
          FOREIGN KEY (product_id)
          REFERENCES products(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_stock_location
          FOREIGN KEY (location_id)
          REFERENCES locations(id)
          ON DELETE CASCADE,

        CONSTRAINT unique_product_location
          UNIQUE(product_id, location_id)
      );


      /* =========================================
         RECEIPTS
         ========================================= */

      CREATE TABLE IF NOT EXISTS receipts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        receipt_number VARCHAR(100) UNIQUE NOT NULL,

        supplier_id UUID,

        warehouse_id UUID NOT NULL,

        status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

        created_by UUID,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_receipt_supplier
          FOREIGN KEY (supplier_id)
          REFERENCES suppliers(id)
          ON DELETE SET NULL,

        CONSTRAINT fk_receipt_warehouse
          FOREIGN KEY (warehouse_id)
          REFERENCES warehouses(id)
          ON DELETE RESTRICT,

        CONSTRAINT fk_receipt_user
          FOREIGN KEY (created_by)
          REFERENCES users(id)
          ON DELETE SET NULL
      );


      /* =========================================
         RECEIPT ITEMS
         ========================================= */

      CREATE TABLE IF NOT EXISTS receipt_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        receipt_id UUID NOT NULL,

        product_id UUID NOT NULL,

        location_id UUID,

        quantity NUMERIC(15,2) NOT NULL,

        CONSTRAINT fk_receipt_item_receipt
          FOREIGN KEY (receipt_id)
          REFERENCES receipts(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_receipt_item_product
          FOREIGN KEY (product_id)
          REFERENCES products(id)
          ON DELETE RESTRICT,

        CONSTRAINT fk_receipt_item_location
          FOREIGN KEY (location_id)
          REFERENCES locations(id)
          ON DELETE SET NULL
      );


      /* =========================================
         DELIVERIES
         ========================================= */

      CREATE TABLE IF NOT EXISTS deliveries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        delivery_number VARCHAR(100) UNIQUE NOT NULL,

        customer_name VARCHAR(200),

        warehouse_id UUID NOT NULL,

        status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

        created_by UUID,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_delivery_warehouse
          FOREIGN KEY (warehouse_id)
          REFERENCES warehouses(id)
          ON DELETE RESTRICT,

        CONSTRAINT fk_delivery_user
          FOREIGN KEY (created_by)
          REFERENCES users(id)
          ON DELETE SET NULL
      );


      /* =========================================
         DELIVERY ITEMS
         ========================================= */

      CREATE TABLE IF NOT EXISTS delivery_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        delivery_id UUID NOT NULL,

        product_id UUID NOT NULL,

        location_id UUID,

        quantity NUMERIC(15,2) NOT NULL,

        CONSTRAINT fk_delivery_item_delivery
          FOREIGN KEY (delivery_id)
          REFERENCES deliveries(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_delivery_item_product
          FOREIGN KEY (product_id)
          REFERENCES products(id)
          ON DELETE RESTRICT,

        CONSTRAINT fk_delivery_item_location
          FOREIGN KEY (location_id)
          REFERENCES locations(id)
          ON DELETE SET NULL
      );


      /* =========================================
         INTERNAL TRANSFERS
         ========================================= */

      CREATE TABLE IF NOT EXISTS internal_transfers (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        transfer_number VARCHAR(100) UNIQUE NOT NULL,

        from_location_id UUID NOT NULL,

        to_location_id UUID NOT NULL,

        status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

        created_by UUID,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_transfer_from_location
          FOREIGN KEY (from_location_id)
          REFERENCES locations(id)
          ON DELETE RESTRICT,

        CONSTRAINT fk_transfer_to_location
          FOREIGN KEY (to_location_id)
          REFERENCES locations(id)
          ON DELETE RESTRICT,

        CONSTRAINT fk_transfer_user
          FOREIGN KEY (created_by)
          REFERENCES users(id)
          ON DELETE SET NULL
      );


      /* =========================================
         TRANSFER ITEMS
         ========================================= */

      CREATE TABLE IF NOT EXISTS transfer_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        transfer_id UUID NOT NULL,

        product_id UUID NOT NULL,

        quantity NUMERIC(15,2) NOT NULL,

        CONSTRAINT fk_transfer_item_transfer
          FOREIGN KEY (transfer_id)
          REFERENCES internal_transfers(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_transfer_item_product
          FOREIGN KEY (product_id)
          REFERENCES products(id)
          ON DELETE RESTRICT
      );


      /* =========================================
         STOCK ADJUSTMENTS
         ========================================= */

      CREATE TABLE IF NOT EXISTS stock_adjustments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        adjustment_number VARCHAR(100) UNIQUE NOT NULL,

        location_id UUID NOT NULL,

        reason TEXT,

        status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',

        created_by UUID,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_adjustment_location
          FOREIGN KEY (location_id)
          REFERENCES locations(id)
          ON DELETE RESTRICT,

        CONSTRAINT fk_adjustment_user
          FOREIGN KEY (created_by)
          REFERENCES users(id)
          ON DELETE SET NULL
      );


      /* =========================================
         STOCK ADJUSTMENT ITEMS
         ========================================= */

      CREATE TABLE IF NOT EXISTS stock_adjustment_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        adjustment_id UUID NOT NULL,

        product_id UUID NOT NULL,

        system_quantity NUMERIC(15,2) NOT NULL,

        counted_quantity NUMERIC(15,2) NOT NULL,

        difference NUMERIC(15,2) NOT NULL,

        CONSTRAINT fk_adjustment_item_adjustment
          FOREIGN KEY (adjustment_id)
          REFERENCES stock_adjustments(id)
          ON DELETE CASCADE,

        CONSTRAINT fk_adjustment_item_product
          FOREIGN KEY (product_id)
          REFERENCES products(id)
          ON DELETE RESTRICT
      );


      /* =========================================
         STOCK LEDGER
         ========================================= */

      CREATE TABLE IF NOT EXISTS stock_ledger (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        product_id UUID NOT NULL,

        location_id UUID NOT NULL,

        transaction_type VARCHAR(50) NOT NULL,

        reference_id UUID,

        quantity_change NUMERIC(15,2) NOT NULL,

        quantity_after NUMERIC(15,2) NOT NULL,

        created_by UUID,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_ledger_product
          FOREIGN KEY (product_id)
          REFERENCES products(id)
          ON DELETE RESTRICT,

        CONSTRAINT fk_ledger_location
          FOREIGN KEY (location_id)
          REFERENCES locations(id)
          ON DELETE RESTRICT,

        CONSTRAINT fk_ledger_user
          FOREIGN KEY (created_by)
          REFERENCES users(id)
          ON DELETE SET NULL
      );


      /* =========================================
         REORDER RULES
         ========================================= */

      CREATE TABLE IF NOT EXISTS reorder_rules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        product_id UUID NOT NULL,

        minimum_stock NUMERIC(15,2) NOT NULL,

        reorder_quantity NUMERIC(15,2) NOT NULL,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_reorder_product
          FOREIGN KEY (product_id)
          REFERENCES products(id)
          ON DELETE CASCADE,

        CONSTRAINT unique_reorder_product
          UNIQUE(product_id)
      );


      /* =========================================
         OTP
         ========================================= */

      CREATE TABLE IF NOT EXISTS otp_codes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

        user_id UUID NOT NULL,

        otp VARCHAR(10) NOT NULL,

        expires_at TIMESTAMP NOT NULL,

        used BOOLEAN DEFAULT FALSE,

        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_otp_user
          FOREIGN KEY (user_id)
          REFERENCES users(id)
          ON DELETE CASCADE
      );
    `);

    console.log("All StockSense tables created successfully.");
  } catch (error) {
    if (error.code === "ENOTFOUND") {
      console.error("❌ Database connection error (ENOTFOUND): Unable to resolve database hostname.");
      console.error("👉 Tip: Supabase direct host 'db.<project-ref>.supabase.co' is IPv6-only.");
      console.error("👉 Solution: In your Supabase Dashboard, go to Project Settings -> Database -> Connection String.");
      console.error("   Select 'Transaction' or 'Session' Pooler and copy the Connection String into backend/.env as DATABASE_URL.");
    } else {
      console.error("Database initialization failed:", error.message);
    }
  } finally {
    await dbClient.end().catch(() => {});
  }
};


// Run table creation when database script is executed
createTables();

export default pool;