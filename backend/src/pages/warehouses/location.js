import { pool } from "../../config/database.js";

export const getLocations = async (req, res) => {
  try {
    const { warehouseId } = req.query;

    let query = `
      SELECT 
        l.id,
        l.name,
        l.warehouse_id,
        l.created_at,
        w.name AS warehouse_name,
        COALESCE(SUM(s.quantity), 0) AS total_stock
      FROM locations l
      LEFT JOIN warehouses w ON l.warehouse_id = w.id
      LEFT JOIN stock s ON l.id = s.location_id
      WHERE 1=1
    `;

    const params = [];
    if (warehouseId && warehouseId !== "All") {
      query += ` AND l.warehouse_id = $1`;
      params.push(warehouseId);
    }

    query += ` GROUP BY l.id, l.name, l.warehouse_id, l.created_at, w.name ORDER BY l.name ASC`;

    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get locations error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch locations" });
  }
};

export const createLocation = async (req, res) => {
  try {
    const { warehouseId, name } = req.body;

    if (!warehouseId || !name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Warehouse ID and Location Name are required." });
    }

    const result = await pool.query(
      `INSERT INTO locations (warehouse_id, name)
       VALUES ($1, $2)
       RETURNING *`,
      [warehouseId, name.trim()]
    );

    return res.status(201).json({
      success: true,
      message: "Location added successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create location error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to add location." });
  }
};

export const getStockByLocation = async (req, res) => {
  try {
    const { locationId } = req.params;

    const result = await pool.query(
      `SELECT 
        s.id,
        s.quantity,
        s.updated_at,
        p.name AS product_name,
        p.sku,
        p.unit_of_measure,
        c.name AS category_name
       FROM stock s
       JOIN products p ON s.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE s.location_id = $1
       ORDER BY p.name ASC`,
      [locationId]
    );

    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get stock by location error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch location stock inventory" });
  }
};
