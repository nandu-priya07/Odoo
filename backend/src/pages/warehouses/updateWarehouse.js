import { pool } from "../../config/database.js";

// PATCH /api/warehouses/:id or PUT /api/warehouses/:id
export const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, address, status } = req.body;

    // 1. Verify warehouse exists
    const existCheck = await pool.query(
      `SELECT * FROM warehouses WHERE id = $1`,
      [id]
    );

    if (existCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found.",
      });
    }

    const currentWarehouse = existCheck.rows[0];

    // 2. Validate and check duplicate name
    let cleanName = currentWarehouse.name;
    if (name !== undefined) {
      if (!name || typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: "Warehouse name is required.",
        });
      }
      cleanName = name.trim();

      const dupCheck = await pool.query(
        `SELECT id FROM warehouses WHERE LOWER(TRIM(name)) = LOWER($1) AND id != $2`,
        [cleanName, id]
      );

      if (dupCheck.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Warehouse with this name already exists.",
        });
      }
    }

    // 3. Process address
    const cleanAddress = address !== undefined
      ? (address && typeof address === "string" && address.trim() ? address.trim() : null)
      : currentWarehouse.address;

    // 4. Process status change
    let cleanStatus = currentWarehouse.status || "ACTIVE";
    if (status !== undefined) {
      const targetStatus = status.toUpperCase();
      if (!["ACTIVE", "INACTIVE"].includes(targetStatus)) {
        return res.status(400).json({
          success: false,
          message: "Status must be either ACTIVE or INACTIVE.",
        });
      }

      // If attempting to deactivate, perform safety check
      if (targetStatus === "INACTIVE" && currentWarehouse.status === "ACTIVE") {
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
      }
      cleanStatus = targetStatus;
    }

    // 5. Update record
    const updateRes = await pool.query(
      `UPDATE warehouses
       SET name = $1, address = $2, status = $3
       WHERE id = $4
       RETURNING *`,
      [cleanName, cleanAddress, cleanStatus, id]
    );

    const updatedWh = updateRes.rows[0];

    return res.status(200).json({
      success: true,
      message: "Warehouse updated successfully.",
      data: {
        id: updatedWh.id,
        name: updatedWh.name,
        address: updatedWh.address || "",
        status: updatedWh.status,
        createdAt: updatedWh.created_at,
      },
    });
  } catch (error) {
    console.error("Update warehouse error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update warehouse.",
    });
  }
};

export default updateWarehouse;
