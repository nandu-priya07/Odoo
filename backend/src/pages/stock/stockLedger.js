import { pool } from "../../config/database.js";

export const getStockLedger = async (req, res) => {
  try {
    const { transactionType, warehouseId, locationId, search, date } = req.query;

    let query = `
      SELECT 
        sl.id,
        sl.product_id,
        sl.location_id,
        sl.transaction_type,
        sl.quantity_change,
        sl.quantity_after,
        sl.created_at,
        p.name AS product_name,
        p.sku,
        p.unit_of_measure,
        l.name AS location_name,
        w.name AS warehouse_name,
        u.name AS user_name
      FROM stock_ledger sl
      LEFT JOIN products p ON sl.product_id = p.id
      LEFT JOIN locations l ON sl.location_id = l.id
      LEFT JOIN warehouses w ON l.warehouse_id = w.id
      LEFT JOIN users u ON sl.created_by = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramIdx = 1;

    if (search && search.trim()) {
      query += ` AND (p.name ILIKE $${paramIdx} OR p.sku ILIKE $${paramIdx} OR l.name ILIKE $${paramIdx})`;
      params.push(`%${search.trim()}%`);
      paramIdx++;
    }

    if (transactionType && transactionType !== "All") {
      query += ` AND sl.transaction_type = $${paramIdx}`;
      params.push(transactionType);
      paramIdx++;
    }

    if (warehouseId && warehouseId !== "All") {
      query += ` AND (w.id = $${paramIdx} OR w.name = $${paramIdx})`;
      params.push(warehouseId);
      paramIdx++;
    }

    if (locationId && locationId !== "All") {
      query += ` AND (l.id = $${paramIdx} OR l.name = $${paramIdx})`;
      params.push(locationId);
      paramIdx++;
    }

    if (date) {
      query += ` AND DATE(sl.created_at) = $${paramIdx}`;
      params.push(date);
      paramIdx++;
    }

    query += ` ORDER BY sl.created_at DESC LIMIT 500`;

    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get stock ledger error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch stock ledger move history" });
  }
};
