import jwt from "jsonwebtoken";
import { pool } from "../../config/database.js";

// Helper to extract authenticated user
const getAuthenticatedUserId = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const jwtSecret = process.env.JWT_SECRET || "stocksense_jwt_secret_key_2026";
      const decoded = jwt.verify(token, jwtSecret);
      if (decoded && decoded.userId) return decoded.userId;
    }
  } catch (err) {
    // Ignore invalid token
  }
  const defaultUser = await pool.query("SELECT id FROM users ORDER BY created_at ASC LIMIT 1");
  return defaultUser.rows[0]?.id || null;
};

// POST /api/adjustments/:id/validate
export const validateAdjustment = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    // 1. Begin PostgreSQL transaction
    await client.query("BEGIN");

    // 2. Verify adjustment exists and lock row
    const adjRes = await client.query(
      "SELECT * FROM stock_adjustments WHERE id = $1 FOR UPDATE",
      [id]
    );

    if (adjRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Adjustment not found." });
    }

    const adjustment = adjRes.rows[0];

    // 3. Verify status = READY
    if (adjustment.status !== "READY") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: `Adjustment cannot be validated in its current status ('${adjustment.status}'). Status must be 'READY'.`,
      });
    }

    // 4. Fetch the adjustment item
    const itemRes = await client.query(
      `SELECT sai.id, sai.product_id, sai.counted_quantity, p.name AS product_name, p.unit_of_measure 
       FROM stock_adjustment_items sai
       JOIN products p ON sai.product_id = p.id
       WHERE sai.adjustment_id = $1`,
      [id]
    );

    if (itemRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "No adjustment items found for this adjustment.",
      });
    }

    const item = itemRes.rows[0];
    const physicalCount = parseFloat(item.counted_quantity);

    // 5. Fetch CURRENT stock using SELECT ... FOR UPDATE (Concurrency Protection)
    const currentStockRes = await client.query(
      `SELECT id, quantity 
       FROM stock 
       WHERE product_id = $1 AND location_id = $2 
       FOR UPDATE`,
      [item.product_id, adjustment.location_id]
    );

    const currentSystemStock = parseFloat(currentStockRes.rows[0]?.quantity || 0);

    // 6. Recalculate difference using CURRENT stock:
    // difference = physicalCount - currentSystemStock
    const recalculatedDifference = physicalCount - currentSystemStock;

    // Update item record with verified current system_quantity and difference
    await client.query(
      `UPDATE stock_adjustment_items 
       SET system_quantity = $1, difference = $2 
       WHERE id = $3`,
      [currentSystemStock, recalculatedDifference, item.id]
    );

    // 7. Update stock to the physical counted quantity:
    // stock.quantity = physicalCount
    if (currentStockRes.rows.length > 0) {
      await client.query(
        `UPDATE stock 
         SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE product_id = $2 AND location_id = $3`,
        [physicalCount, item.product_id, adjustment.location_id]
      );
    } else {
      await client.query(
        `INSERT INTO stock (product_id, location_id, quantity) 
         VALUES ($1, $2, $3)`,
        [item.product_id, adjustment.location_id, physicalCount]
      );
    }

    const userId = await getAuthenticatedUserId(req);

    // 8. Create Stock Ledger entry
    // transaction_type = "ADJUSTMENT"
    // quantity_change = recalculatedDifference
    // quantity_after = physicalCount
    await client.query(
      `INSERT INTO stock_ledger (
         product_id, 
         location_id, 
         transaction_type, 
         reference_id, 
         quantity_change, 
         quantity_after, 
         created_by
       ) 
       VALUES ($1, $2, 'ADJUSTMENT', $3, $4, $5, $6)`,
      [
        item.product_id,
        adjustment.location_id,
        id,
        recalculatedDifference,
        physicalCount,
        userId,
      ]
    );

    // 9. Change adjustment status to DONE
    const updatedAdjRes = await client.query(
      `UPDATE stock_adjustments 
       SET status = 'DONE' 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    // 10. Commit transaction
    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: `Adjustment ${adjustment.adjustment_number} validated successfully. Stock reconciled to ${physicalCount} ${item.unit_of_measure || "units"}.`,
      data: {
        ...updatedAdjRes.rows[0],
        recalculatedDifference,
        finalStock: physicalCount,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Validate adjustment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to validate adjustment.",
    });
  } finally {
    client.release();
  }
};

export default validateAdjustment;
