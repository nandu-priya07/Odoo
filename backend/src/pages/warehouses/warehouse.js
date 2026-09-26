import { pool } from "../../config/database.js";

export const getWarehouses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        w.id,
        w.name,
        w.address,
        w.created_at,
        COUNT(DISTINCT l.id) AS total_locations,
        COALESCE(SUM(s.quantity), 0) AS total_units
      FROM warehouses w
      LEFT JOIN locations l ON w.id = l.warehouse_id
      LEFT JOIN stock s ON l.id = s.location_id
      GROUP BY w.id, w.name, w.address, w.created_at
      ORDER BY w.name ASC
    `);

    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get warehouses error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch warehouses" });
  }
};

export const getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;

    const whRes = await pool.query("SELECT * FROM warehouses WHERE id = $1", [id]);
    if (whRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Warehouse not found" });
    }

    const warehouse = whRes.rows[0];

    const locRes = await pool.query(
      `SELECT l.*, COALESCE(SUM(s.quantity), 0) AS total_stock
       FROM locations l
       LEFT JOIN stock s ON l.id = s.location_id
       WHERE l.warehouse_id = $1
       GROUP BY l.id, l.name, l.created_at
       ORDER BY l.name ASC`,
      [id]
    );

    warehouse.locations = locRes.rows;
    return res.status(200).json({ success: true, data: warehouse });
  } catch (error) {
    console.error("Get warehouse error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch warehouse details" });
  }
};
