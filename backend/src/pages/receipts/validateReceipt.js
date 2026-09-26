import { pool } from "../../config/database.js";

export const validateReceipt = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const receiptRes = await client.query("SELECT * FROM receipts WHERE id = $1", [id]);
    if (receiptRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Receipt not found." });
    }

    const receipt = receiptRes.rows[0];
    if (receipt.status === "DONE") {
      return res.status(400).json({ success: false, message: "Receipt has already been validated and marked DONE." });
    }

    await client.query("BEGIN");

    const itemsRes = await client.query("SELECT * FROM receipt_items WHERE receipt_id = $1", [id]);
    const items = itemsRes.rows;

    const locRes = await client.query("SELECT id FROM locations WHERE warehouse_id = $1 LIMIT 1", [receipt.warehouse_id]);
    const defaultLocId = locRes.rows[0]?.id || null;

    for (const item of items) {
      const locId = item.location_id || defaultLocId;
      const qtyNum = Number(item.quantity);

      if (locId) {
        // Increase stock
        const stockRes = await client.query(
          `INSERT INTO stock (product_id, location_id, quantity)
           VALUES ($1, $2, $3)
           ON CONFLICT (product_id, location_id)
           DO UPDATE SET quantity = stock.quantity + $3, updated_at = CURRENT_TIMESTAMP
           RETURNING quantity`,
          [item.product_id, locId, qtyNum]
        );

        const newQtyAfter = stockRes.rows[0]?.quantity || qtyNum;

        // Log stock movement
        await client.query(
          `INSERT INTO stock_ledger (product_id, location_id, transaction_type, reference_id, quantity_change, quantity_after, created_by)
           VALUES ($1, $2, 'RECEIPT', $3, $4, $5, $6)`,
          [item.product_id, locId, id, qtyNum, newQtyAfter, receipt.created_by || req.user?.id || null]
        );
      }
    }

    // Update status to DONE
    const updatedRes = await client.query(
      `UPDATE receipts SET status = 'DONE', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: `Receipt ${receipt.receipt_number} validated successfully! Inventory increased.`,
      data: updatedRes.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Validate receipt error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to validate receipt." });
  } finally {
    client.release();
  }
};
