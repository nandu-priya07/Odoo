import { pool } from "../../config/database.js";

export const getTransfers = async (req, res) => {
  try {
    const { status, search } = req.query;

    let query = `
      SELECT 
        t.id,
        t.transfer_number,
        t.from_location_id,
        t.to_location_id,
        t.status,
        t.created_at,
        t.updated_at,
        fl.name AS from_location,
        tl.name AS to_location
      FROM internal_transfers t
      LEFT JOIN locations fl ON t.from_location_id = fl.id
      LEFT JOIN locations tl ON t.to_location_id = tl.id
      WHERE 1=1
    `;

    const params = [];
    let paramIdx = 1;

    if (search && search.trim()) {
      query += ` AND (t.transfer_number ILIKE $${paramIdx} OR fl.name ILIKE $${paramIdx} OR tl.name ILIKE $${paramIdx})`;
      params.push(`%${search.trim()}%`);
      paramIdx++;
    }

    if (status && status !== "All") {
      query += ` AND t.status = $${paramIdx}`;
      params.push(status);
      paramIdx++;
    }

    query += ` ORDER BY t.created_at DESC`;

    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get transfers error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch internal transfers" });
  }
};

export const getTransferById = async (req, res) => {
  try {
    const { id } = req.params;

    const transferRes = await pool.query(
      `SELECT t.*, fl.name AS from_location, tl.name AS to_location
       FROM internal_transfers t
       LEFT JOIN locations fl ON t.from_location_id = fl.id
       LEFT JOIN locations tl ON t.to_location_id = tl.id
       WHERE t.id = $1`,
      [id]
    );

    if (transferRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Transfer not found" });
    }

    const transfer = transferRes.rows[0];

    const itemsRes = await pool.query(
      `SELECT ti.*, p.name AS product_name, p.sku, p.unit_of_measure
       FROM transfer_items ti
       JOIN products p ON ti.product_id = p.id
       WHERE ti.transfer_id = $1`,
      [id]
    );

    transfer.items = itemsRes.rows;
    return res.status(200).json({ success: true, data: transfer });
  } catch (error) {
    console.error("Get transfer error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch transfer details" });
  }
};
