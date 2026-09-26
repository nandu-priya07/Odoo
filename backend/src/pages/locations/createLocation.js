import { pool } from "../../config/database.js";

// POST /api/locations
export const createLocation = async (req, res) => {
  try {
    const { warehouseId, name, status = "ACTIVE" } = req.body;

    // 1. Validate inputs
    if (!warehouseId) {
      return res.status(400).json({
        success: false,
        message: "Warehouse ID is required.",
      });
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Location name is required.",
      });
    }

    const cleanName = name.trim();
    const cleanStatus = status && ["ACTIVE", "INACTIVE"].includes(status.toUpperCase())
      ? status.toUpperCase()
      : "ACTIVE";

    // 2. Verify warehouse exists
    const whRes = await pool.query(
      `SELECT id, name, COALESCE(status, 'ACTIVE') AS status FROM warehouses WHERE id = $1`,
      [warehouseId]
    );

    if (whRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found.",
      });
    }

    const warehouse = whRes.rows[0];

    // 3. Verify warehouse is active
    if (warehouse.status !== "ACTIVE") {
      return res.status(400).json({
        success: false,
        message: `Cannot create locations in an inactive warehouse (${warehouse.name}).`,
      });
    }

    // 4. Prevent duplicate location names within the same warehouse
    const dupCheck = await pool.query(
      `SELECT id FROM locations WHERE warehouse_id = $1 AND LOWER(TRIM(name)) = LOWER($2)`,
      [warehouseId, cleanName]
    );

    if (dupCheck.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Location already exists in this warehouse.",
      });
    }

    // 5. Create location
    const result = await pool.query(
      `INSERT INTO locations (warehouse_id, name, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [warehouseId, cleanName, cleanStatus]
    );

    const createdLocation = result.rows[0];

    return res.status(201).json({
      success: true,
      message: "Location created successfully.",
      data: {
        id: createdLocation.id,
        name: createdLocation.name,
        status: createdLocation.status || "ACTIVE",
        warehouse: {
          id: warehouse.id,
          name: warehouse.name,
        },
        productCount: 0,
        totalUnits: 0,
        createdAt: createdLocation.created_at,
      },
    });
  } catch (error) {
    console.error("Create location error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create location.",
    });
  }
};

export default createLocation;
