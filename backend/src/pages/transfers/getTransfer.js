import { pool } from "../../config/database.js";

// GET /api/transfers/:id
export const getTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        t.id,
        t.transfer_number,
        t.status,
        t.created_at,
        t.updated_at,
        fl.id AS from_location_id,
        fl.name AS from_location_name,
        fw.id AS from_warehouse_id,
        fw.name AS from_warehouse_name,
        tl.id AS to_location_id,
        tl.name AS to_location_name,
        tw.id AS to_warehouse_id,
        tw.name AS to_warehouse_name,
        ti.product_id,
        COALESCE(p.name, 'N/A') AS product_name,
        COALESCE(p.sku, 'N/A') AS sku,
        COALESCE(p.unit_of_measure, 'units') AS unit_of_measure,
        COALESCE(ti.quantity, 0) AS quantity,
        COALESCE(u.name, 'Admin') AS created_by_name,
        u.email AS created_by_email
      FROM internal_transfers t
      JOIN locations fl ON t.from_location_id = fl.id
      JOIN warehouses fw ON fl.warehouse_id = fw.id
      JOIN locations tl ON t.to_location_id = tl.id
      JOIN warehouses tw ON tl.warehouse_id = tw.id
      LEFT JOIN transfer_items ti ON t.id = ti.transfer_id
      LEFT JOIN products p ON ti.product_id = p.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Transfer not found" });
    }

    const transfer = result.rows[0];

    // Current available stock at source
    if (transfer.product_id && transfer.from_location_id) {
      const stockRes = await pool.query(
        `SELECT COALESCE(SUM(quantity), 0) AS current_source_stock 
         FROM stock 
         WHERE product_id = $1 AND location_id = $2`,
        [transfer.product_id, transfer.from_location_id]
      );
      transfer.current_source_stock = parseFloat(stockRes.rows[0]?.current_source_stock || 0);
    }

    return res.status(200).json({
      success: true,
      data: transfer,
    });
  } catch (error) {
    console.error("Get transfer by ID error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch transfer details" });
  }
};

export default getTransfer;
