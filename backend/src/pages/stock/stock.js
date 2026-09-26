import { getStockLedger } from "./stockLedger.js";
import { pool } from "../../config/database.js";

export const getStockOverview = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.quantity,
        s.updated_at,
        p.name AS product_name,
        p.sku,
        l.name AS location_name,
        w.name AS warehouse_name
      FROM stock s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN locations l ON s.location_id = l.id
      LEFT JOIN warehouses w ON l.warehouse_id = w.id
      ORDER BY s.quantity ASC
    `);

    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get stock overview error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch stock inventory" });
  }
};

export { getStockLedger };
