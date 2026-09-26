import { pool } from "../../config/database.js";

// PATCH /api/locations/:id or PUT /api/locations/:id
export const updateLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    // 1. Verify location exists
    const existRes = await pool.query(
      `SELECT * FROM locations WHERE id = $1`,
      [id]
    );

    if (existRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Location not found.",
      });
    }

    const currentLocation = existRes.rows[0];

    // 2. Validate and check duplicate name within same warehouse
    let cleanName = currentLocation.name;
    if (name !== undefined) {
      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Location name is required.",
        });
      }
      cleanName = name.trim();

      const dupCheck = await pool.query(
        `SELECT id FROM locations 
         WHERE warehouse_id = $1 AND LOWER(TRIM(name)) = LOWER($2) AND id != $3`,
        [currentLocation.warehouse_id, cleanName, id]
      );

      if (dupCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Location already exists in this warehouse.",
        });
      }
    }

    // 3. Process status change
    let cleanStatus = currentLocation.status || "ACTIVE";
    if (status !== undefined) {
      const targetStatus = status.toUpperCase();
      if (!["ACTIVE", "INACTIVE"].includes(targetStatus)) {
        return res.status(400).json({
          success: false,
          message: "Status must be either ACTIVE or INACTIVE.",
        });
      }

      // If attempting to deactivate, check inventory safety
      if (targetStatus === "INACTIVE" && currentLocation.status === "ACTIVE") {
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
      }
      cleanStatus = targetStatus;
    }

    // 4. Update location (warehouse_id is NOT changed)
    const updateRes = await pool.query(
      `UPDATE locations
       SET name = $1, status = $2
       WHERE id = $3
       RETURNING *`,
      [cleanName, cleanStatus, id]
    );

    const updatedLoc = updateRes.rows[0];

    return res.status(200).json({
      success: true,
      message: "Location updated successfully.",
      data: {
        id: updatedLoc.id,
        name: updatedLoc.name,
        warehouseId: updatedLoc.warehouse_id,
        status: updatedLoc.status,
        createdAt: updatedLoc.created_at,
      },
    });
  } catch (error) {
    console.error("Update location error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update location.",
    });
  }
};

export default updateLocation;
