import { pool } from "../../config/database.js";

// POST /api/warehouses/:id/deactivate
export const deactivateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Check warehouse exists
    const whRes = await pool.query(
      `SELECT * FROM warehouses WHERE id = $1`,
      [id]
    );

    if (whRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found.",
      });
    }

    // 2. Safety check: Check whether any location in this warehouse contains stock
    const stockCheck = await pool.query(
      `SELECT COALESCE(SUM(s.quantity), 0) AS total_stock
       FROM locations l
       JOIN stock s ON l.id = s.location_id
       WHERE l.warehouse_id = $1 AND s.quantity > 0`,
      [id]
    );

    const totalStock = parseFloat(stockCheck.rows[0]?.total_stock || 0);

    if (totalStock > 0) {
      return res.status(400).json({
        success: false,
        message: "This warehouse contains inventory. Move or adjust the stock before deactivating this warehouse.",
      });
    }

    // 3. Deactivate warehouse (and cascade inactive to its locations)
    const updateRes = await pool.query(
      `UPDATE warehouses
       SET status = 'INACTIVE'
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    await pool.query(
      `UPDATE locations
       SET status = 'INACTIVE'
       WHERE warehouse_id = $1`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: `Warehouse "${updateRes.rows[0].name}" deactivated successfully.`,
      data: updateRes.rows[0],
    });
  } catch (error) {
    console.error("Deactivate warehouse error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to deactivate warehouse.",
    });
  }
};

export default deactivateWarehouse;
