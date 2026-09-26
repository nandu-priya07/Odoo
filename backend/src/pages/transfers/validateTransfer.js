import { pool } from "../../config/database.js";

export const validateTransfer = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const transferRes = await client.query("SELECT * FROM internal_transfers WHERE id = $1", [id]);
    if (transferRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Transfer not found." });
    }

    const transfer = transferRes.rows[0];
    if (transfer.status === "DONE") {
      return res.status(400).json({ success: false, message: "Transfer has already been validated and completed." });
    }

    await client.query("BEGIN");

    const itemsRes = await client.query("SELECT * FROM transfer_items WHERE transfer_id = $1", [id]);
    const items = itemsRes.rows;

    for (const item of items) {
      const pId = item.product_id;
      const qtyNum = Number(item.quantity);

      // 1. Verify stock at from_location_id
      const sourceStockRes = await client.query(
        "SELECT COALESCE(quantity, 0) AS qty FROM stock WHERE product_id = $1 AND location_id = $2",
        [pId, transfer.from_location_id]
      );
      const availStock = Number(sourceStockRes.rows[0]?.qty || 0);

      if (availStock < qtyNum) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: `Insufficient stock at source location. Available: ${availStock}, Required: ${qtyNum}.`,
        });
      }

      // 2. Decrease stock at from_location
      const fromStockRes = await client.query(
        `UPDATE stock SET quantity = quantity - $1, updated_at = CURRENT_TIMESTAMP
         WHERE product_id = $2 AND location_id = $3
         RETURNING quantity`,
        [qtyNum, pId, transfer.from_location_id]
      );
      const fromQtyAfter = fromStockRes.rows[0]?.quantity || 0;

      // 3. Log TRANSFER_OUT ledger
      await client.query(
        `INSERT INTO stock_ledger (product_id, location_id, transaction_type, quantity_change, quantity_after)
         VALUES ($1, $2, 'TRANSFER_OUT', -$3, $4)`,
        [pId, transfer.from_location_id, qtyNum, fromQtyAfter]
      );

      // 4. Increase stock at to_location
      const toStockRes = await client.query(
        `INSERT INTO stock (product_id, location_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (product_id, location_id)
         DO UPDATE SET quantity = stock.quantity + $3, updated_at = CURRENT_TIMESTAMP
         RETURNING quantity`,
        [pId, transfer.to_location_id, qtyNum]
      );
      const toQtyAfter = toStockRes.rows[0]?.quantity || qtyNum;

      // 5. Log TRANSFER_IN ledger
      await client.query(
        `INSERT INTO stock_ledger (product_id, location_id, transaction_type, quantity_change, quantity_after)
         VALUES ($1, $2, 'TRANSFER_IN', $3, $4)`,
        [pId, transfer.to_location_id, qtyNum, toQtyAfter]
      );
    }

    // 6. Update transfer status to DONE
    const updatedTransferRes = await client.query(
      `UPDATE internal_transfers SET status = 'DONE', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: `Stock transfer ${transfer.transfer_number} completed successfully! Stock moved between locations.`,
      data: updatedTransferRes.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Validate transfer error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to validate transfer." });
  } finally {
    client.release();
  }
};
