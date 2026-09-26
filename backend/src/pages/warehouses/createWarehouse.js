import { pool } from "../../config/database.js";

// POST /api/warehouses
export const createWarehouse = async (req, res) => {
  try {
    const { name, address, status = "ACTIVE" } = req.body;

    // 1. Validate name
    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Warehouse name is required.",
      });
    }

    // 2. Trim whitespace
    const cleanName = name.trim();
    const cleanAddress = address && typeof address === "string" && address.trim() ? address.trim() : null;
    const cleanStatus = status && ["ACTIVE", "INACTIVE"].includes(status.toUpperCase()) ? status.toUpperCase() : "ACTIVE";

    // 3. Check duplicate warehouse name (case-insensitive)
    const dupCheck = await pool.query(
      `SELECT id FROM warehouses WHERE LOWER(TRIM(name)) = LOWER($1)`,
      [cleanName]
    );

    if (dupCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Warehouse with this name already exists.",
      });
    }

    // 4. Create warehouse with default status = ACTIVE
    const result = await pool.query(
      `INSERT INTO warehouses (name, address, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [cleanName, cleanAddress, cleanStatus]
    );

    const createdWarehouse = result.rows[0];

    return res.status(201).json({
      success: true,
      message: "Warehouse created successfully.",
      data: {
        id: createdWarehouse.id,
        name: createdWarehouse.name,
        address: createdWarehouse.address || "",
        status: createdWarehouse.status || "ACTIVE",
        locationCount: 0,
        totalUnits: 0,
        createdAt: createdWarehouse.created_at,
      },
    });
  } catch (error) {
    console.error("Create warehouse error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create warehouse.",
    });
  }
};

export default createWarehouse;
