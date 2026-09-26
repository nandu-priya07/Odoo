import { pool } from "../../config/database.js";

// GET /api/adjustments/:id
export const getAdjustment = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT 
        sa.id,
        sa.adjustment_number,
        sa.status,
        sa.reason,
        sa.created_at,
        l.id AS location_id,
        l.name AS location_name,
        w.id AS warehouse_id,
        w.name AS warehouse_name,
        sai.product_id,
        COALESCE(p.name, 'N/A') AS product_name,
        COALESCE(p.sku, 'N/A') AS sku,
        COALESCE(p.unit_of_measure, 'units') AS unit_of_measure,
        COALESCE(sai.system_quantity, 0) AS system_quantity,
        COALESCE(sai.counted_quantity, 0) AS counted_quantity,
        COALESCE(sai.difference, 0) AS difference,
        COALESCE(u.name, 'Admin') AS created_by_name,
        u.email AS created_by_email
      FROM stock_adjustments sa
      JOIN locations l ON sa.location_id = l.id
      JOIN warehouses w ON l.warehouse_id = w.id
      LEFT JOIN stock_adjustment_items sai ON sa.id = sai.adjustment_id
      LEFT JOIN products p ON sai.product_id = p.id
      LEFT JOIN users u ON sa.created_by = u.id
      WHERE sa.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Adjustment not found." });
    }

    const adjustment = result.rows[0];

    // Current live system quantity at that location
    if (adjustment.product_id && adjustment.location_id) {
      const liveStockRes = await pool.query(
        `SELECT COALESCE(SUM(quantity), 0) AS current_live_stock 
         FROM stock 
         WHERE product_id = $1 AND location_id = $2`,
        [adjustment.product_id, adjustment.location_id]
      );
      adjustment.current_live_stock = parseFloat(liveStockRes.rows[0]?.current_live_stock || 0);
    }

    return res.status(200).json({
      success: true,
      data: adjustment,
    });
  } catch (error) {
    console.error("Get adjustment by ID error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch adjustment details" });
  }
};

export default getAdjustment;
