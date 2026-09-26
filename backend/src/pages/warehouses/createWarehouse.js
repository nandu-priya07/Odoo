import { pool } from "../../config/database.js";

export const createWarehouse = async (req, res) => {
  try {
    const { name, address, initialLocationName } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Warehouse name is required." });
    }

    const result = await pool.query(
      `INSERT INTO warehouses (name, address)
       VALUES ($1, $2)
       RETURNING *`,
      [name.trim(), address ? address.trim() : null]
    );

    const newWarehouse = result.rows[0];

    const locName = initialLocationName && initialLocationName.trim() ? initialLocationName.trim() : `${newWarehouse.name} Main Area`;
    await pool.query(
      `INSERT INTO locations (warehouse_id, name)
       VALUES ($1, $2)`,
      [newWarehouse.id, locName]
    );

    return res.status(201).json({
      success: true,
      message: "Warehouse created successfully with initial location.",
      data: newWarehouse,
    });
  } catch (error) {
    console.error("Create warehouse error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create warehouse." });
  }
};

export const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Warehouse name is required." });
    }

    const result = await pool.query(
      `UPDATE warehouses
       SET name = $1, address = $2
       WHERE id = $3
       RETURNING *`,
      [name.trim(), address ? address.trim() : null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Warehouse not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Warehouse updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update warehouse error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update warehouse." });
  }
};
