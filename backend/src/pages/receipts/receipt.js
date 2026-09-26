import { pool } from "../../config/database.js";

export const getReceipts = async (req, res) => {
  try {
    const { status, warehouseId, search } = req.query;

    let query = `
      SELECT 
        r.id,
        r.receipt_number,
        r.supplier_id,
        r.warehouse_id,
        r.status,
        r.recipient_address,
        COALESCE(r.net_qty, 0) AS net_qty,
        COALESCE(r.receipt_date, r.created_at) AS receipt_date,
        r.created_at,
        r.updated_at,
        sup.name AS supplier_name,
        w.name AS warehouse_name
      FROM receipts r
      LEFT JOIN suppliers sup ON r.supplier_id = sup.id
      LEFT JOIN warehouses w ON r.warehouse_id = w.id
      WHERE 1=1
    `;

    const params = [];
    let paramIdx = 1;

    if (search && search.trim()) {
      query += ` AND (r.receipt_number ILIKE $${paramIdx} OR sup.name ILIKE $${paramIdx} OR r.recipient_address ILIKE $${paramIdx})`;
      params.push(`%${search.trim()}%`);
      paramIdx++;
    }

    if (status && status !== "All") {
      query += ` AND r.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    if (warehouseId && warehouseId !== "All") {
      query += ` AND (r.warehouse_id = $${paramIdx} OR w.name = $${paramIdx})`;
      params.push(warehouseId);
      paramIdx++;
    }

    query += ` ORDER BY r.created_at DESC`;

    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get receipts error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch receipts" });
  }
};

export const getReceiptById = async (req, res) => {
  try {
    const { id } = req.params;

    const receiptRes = await pool.query(
      `SELECT r.*, sup.name AS supplier_name, w.name AS warehouse_name
       FROM receipts r
       LEFT JOIN suppliers sup ON r.supplier_id = sup.id
       LEFT JOIN warehouses w ON r.warehouse_id = w.id
       WHERE r.id = $1`,
      [id]
    );

    if (receiptRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Receipt not found" });
    }

    const receipt = receiptRes.rows[0];

    const itemsRes = await pool.query(
      `SELECT ri.*, p.name AS product_name, p.sku, p.unit_of_measure, l.name AS location_name
       FROM receipt_items ri
       JOIN products p ON ri.product_id = p.id
       LEFT JOIN locations l ON ri.location_id = l.id
       WHERE ri.receipt_id = $1`,
      [id]
    );

    receipt.items = itemsRes.rows;
    return res.status(200).json({ success: true, data: receipt });
  } catch (error) {
    console.error("Get receipt error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch receipt details" });
  }
};
