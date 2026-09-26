import { pool } from "../../config/database.js";

export const getAdjustments = async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = `
      SELECT 
        sa.id,
        sa.adjustment_number,
        sa.location_id,
        sa.reason,
        sa.status,
        sa.created_at,
        l.name AS location_name
      FROM stock_adjustments sa
      LEFT JOIN locations l ON sa.location_id = l.id
      WHERE 1=1
    `;

    const params = [];
    let paramIdx = 1;

    if (search && search.trim()) {
      query += ` AND (sa.adjustment_number ILIKE $${paramIdx} OR sa.reason ILIKE $${paramIdx} OR l.name ILIKE $${paramIdx})`;
      params.push(`%${search.trim()}%`);
      paramIdx++;
    }

    if (status && status !== "All") {
      query += ` AND sa.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    query += ` ORDER BY sa.created_at DESC`;

    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get adjustments error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch stock adjustments" });
  }
};

export const getAdjustmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const adjRes = await pool.query(
      `SELECT sa.*, l.name AS location_name
       FROM stock_adjustments sa
       LEFT JOIN locations l ON sa.location_id = l.id
       WHERE sa.id = $1`,
      [id]
    );

    if (adjRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Adjustment record not found" });
    }

    const adjustment = adjRes.rows[0];

    const itemsRes = await pool.query(
      `SELECT sai.*, p.name AS product_name, p.sku, p.unit_of_measure
       FROM stock_adjustment_items sai
       JOIN products p ON sai.product_id = p.id
       WHERE sai.adjustment_id = $1`,
      [id]
    );

    adjustment.items = itemsRes.rows;
    return res.status(200).json({ success: true, data: adjustment });
  } catch (error) {
    console.error("Get adjustment error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch adjustment details" });
  }
};
