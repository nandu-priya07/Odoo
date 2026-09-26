import { pool } from "../../config/database.js";

export const validateAdjustment = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const adjRes = await client.query("SELECT * FROM stock_adjustments WHERE id = $1", [id]);
    if (adjRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Stock adjustment record not found." });
    }

    const adjustment = adjRes.rows[0];
    if (adjustment.status === "DONE") {
      return res.status(400).json({ success: false, message: "Stock adjustment has already been validated." });
    }

    await client.query("BEGIN");

    const itemsRes = await client.query("SELECT * FROM stock_adjustment_items WHERE adjustment_id = $1", [id]);
    const items = itemsRes.rows;

    for (const item of items) {
      const pId = item.product_id;
      const countedQty = Number(item.counted_quantity);

      const sysStockRes = await client.query(
        "SELECT COALESCE(quantity, 0) AS qty FROM stock WHERE product_id = $1 AND location_id = $2",
        [pId, adjustment.location_id]
      );
      const currentSysQty = Number(sysStockRes.rows[0]?.qty || 0);
      const diffChange = countedQty - currentSysQty;

      // 1. Update stock to exact counted_quantity
      await client.query(
        `INSERT INTO stock (product_id, location_id, quantity)
         VALUES ($1, $2, $3)
         ON CONFLICT (product_id, location_id)
         DO UPDATE SET quantity = $3, updated_at = CURRENT_TIMESTAMP`,
        [pId, adjustment.location_id, countedQty]
      );

      // 2. Log ADJUSTMENT ledger entry
      await client.query(
        `INSERT INTO stock_ledger (product_id, location_id, transaction_type, quantity_change, quantity_after)
         VALUES ($1, $2, 'ADJUSTMENT', $3, $4)`,
        [pId, adjustment.location_id, diffChange, countedQty]
      );
    }

    // 3. Mark status DONE
    const updatedAdjRes = await client.query(
      `UPDATE stock_adjustments SET status = 'DONE', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
    );

    await client.query("COMMIT");

    return res.status(200).json({
      success: true,
      message: `Stock adjustment ${adjustment.adjustment_number} validated successfully! System stock updated to physical counts.`,
      data: updatedAdjRes.rows[0],
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Validate adjustment error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to validate adjustment." });
  } finally {
    client.release();
  }
};
