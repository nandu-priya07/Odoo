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

// POST /api/transfers/:id/validate
export const validateTransfer = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    // 1. Begin PostgreSQL transaction
    await client.query("BEGIN");

    // 2. Verify transfer exists and lock row
    const trfRes = await client.query(
      `SELECT * FROM internal_transfers WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (trfRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ success: false, message: "Transfer not found." });
    }

    const transfer = trfRes.rows[0];

    // 3. Verify status is READY
    if (transfer.status !== "READY") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: `Transfer cannot be validated from '${transfer.status}' status. Status must be 'READY'.`,
      });
    }

    // 4. Fetch transfer items
    const itemsRes = await client.query(
      `SELECT ti.id, ti.product_id, ti.quantity, p.name AS product_name, p.unit_of_measure 
       FROM transfer_items ti
       JOIN products p ON ti.product_id = p.id
       WHERE ti.transfer_id = $1`,
      [id]
    );

    if (itemsRes.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(400).json({
        success: false,
        message: "No transfer items found for this transfer.",
      });
    }

    const userId = await getAuthenticatedUserId(req);

    // Process each item
    for (const item of itemsRes.rows) {
      const pId = item.product_id;
      const transferQty = parseFloat(item.quantity);

      // 5. Fetch CURRENT source stock using SELECT ... FOR UPDATE
      const sourceStockRes = await client.query(
        `SELECT id, quantity 
         FROM stock 
         WHERE product_id = $1 AND location_id = $2 
         FOR UPDATE`,
        [pId, transfer.from_location_id]
      );

      const sourceStock = parseFloat(sourceStockRes.rows[0]?.quantity || 0);

      // 6. Verify sufficient stock at source location
      if (sourceStock < transferQty) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: `Insufficient stock at the source location for product '${item.product_name}'. Available: ${sourceStock} ${item.unit_of_measure}, Required: ${transferQty} ${item.unit_of_measure}.`,
        });
      }

      // 7. Decrease source location stock
      const sourceAfter = sourceStock - transferQty;
      await client.query(
        `UPDATE stock 
         SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
         WHERE product_id = $2 AND location_id = $3`,
        [sourceAfter, pId, transfer.from_location_id]
      );

      // 8. Increase destination location stock
      const destStockRes = await client.query(
        `SELECT id, quantity 
         FROM stock 
         WHERE product_id = $1 AND location_id = $2 
         FOR UPDATE`,
        [pId, transfer.to_location_id]
      );

      let destAfter = transferQty;
      if (destStockRes.rows.length > 0) {
        const destCurrent = parseFloat(destStockRes.rows[0].quantity || 0);
        destAfter = destCurrent + transferQty;
        await client.query(
          `UPDATE stock 
           SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE product_id = $2 AND location_id = $3`,
          [destAfter, pId, transfer.to_location_id]
        );
      } else {
        await client.query(
          `INSERT INTO stock (product_id, location_id, quantity) 
           VALUES ($1, $2, $3)`,
          [pId, transfer.to_location_id, transferQty]
        );
      }

      // 9. Create TRANSFER_OUT ledger entry (Source Location)
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
         VALUES ($1, $2, 'TRANSFER_OUT', $3, $4, $5, $6)`,
        [pId, transfer.from_location_id, id, -transferQty, sourceAfter, userId]
      );

      // 10. Create TRANSFER_IN ledger entry (Destination Location)
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
         VALUES ($1, $2, 'TRANSFER_IN', $3, $4, $5, $6)`,
        [pId, transfer.to_location_id, id, transferQty, destAfter, userId]
      );
    }

    // 11. Change transfer status to DONE
    const updatedTrfRes = await client.query(
      `UPDATE internal_transfers 
       SET status = 'DONE', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    // 12. Commit transaction
    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: `Transfer ${transfer.transfer_number} validated successfully. Stock moved between locations.`,
      data: updatedTrfRes.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Validate transfer error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to validate transfer.",
    });
  } finally {
    client.release();
  }
};

export default validateTransfer;
