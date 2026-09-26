import { pool } from "../config/database.js";

const deleteAllData = async () => {
  try {
    console.log("⚠️ Starting database cleanup process...");

    // Truncate all tables in CASCADE mode to handle foreign key dependencies
    await pool.query(`
      TRUNCATE TABLE 
        otp_codes,
        reorder_rules,
        stock_ledger,
        stock_adjustment_items,
        stock_adjustments,
        transfer_items,
        internal_transfers,
        delivery_items,
        deliveries,
        receipt_items,
        receipts,
        stock,
        suppliers,
        products,
        locations,
        warehouses,
        categories,
        users
      RESTART IDENTITY CASCADE;
    `);

    console.log("✅ All data deleted successfully from all tables.");
  } catch (error) {
    console.error("❌ Failed to delete data:", error.message);
  } finally {
    await pool.end();
  }
};

deleteAllData();
