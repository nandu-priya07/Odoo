import { pool } from "../../config/database.js";

// POST /api/locations/:id/deactivate
export const deactivateLocation = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Check location exists
    const locRes = await pool.query(
      `SELECT * FROM locations WHERE id = $1`,
      [id]
    );

    if (locRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Location not found.",
      });
    }

    const location = locRes.rows[0];

    // 2. Safety check: Check if location contains stock
    const stockCheck = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) AS total_stock
       FROM stock
       WHERE location_id = $1 AND quantity > 0`,
      [id]
    );

    const totalStock = parseFloat(stockCheck.rows[0]?.total_stock || 0);

    if (totalStock > 0) {
      return res.status(400).json({
        success: false,
        message: "This location contains inventory. Move or adjust the stock before deactivating this location.",
      });
    }

    // 3. Deactivate location
    const updateRes = await pool.query(
      `UPDATE locations
       SET status = 'INACTIVE'
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: `Location "${location.name}" deactivated successfully.`,
      data: updateRes.rows[0],
    });
  } catch (error) {
    console.error("Deactivate location error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to deactivate location.",
    });
  }
};

export default deactivateLocation;
