import { pool } from "../../config/database.js";

export const createAdjustment = async (req, res) => {
  const client = await pool.connect();

  try {
    const { locationId, reason, items, status = "DRAFT" } = req.body;

    if (!locationId) {
      return res.status(400).json({ success: false, message: "Location is required for stock adjustment." });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "At least one product item count is required." });
    }

    await client.query("BEGIN");

    const countRes = await client.query("SELECT COUNT(*) FROM stock_adjustments");
    const nextSeq = parseInt(countRes.rows[0].count, 10) + 1;
    const adjustmentNumber = `ADJ-${String(nextSeq).padStart(5, "0")}`;

    const result = await client.query(
      `INSERT INTO stock_adjustments (adjustment_number, location_id, reason, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [adjustmentNumber, locationId, reason || "Physical stock count verification", status]
    );

    const newAdj = result.rows[0];

    for (const item of items) {
      const pId = item.productId;
      const countedQty = Number(item.countedQuantity) || 0;

      const sysStockRes = await client.query(
        "SELECT COALESCE(quantity, 0) AS qty FROM stock WHERE product_id = $1 AND location_id = $2",
        [pId, locationId]
      );
      const systemQty = Number(sysStockRes.rows[0]?.qty || 0);
      const diff = countedQty - systemQty;

      await client.query(
        `INSERT INTO stock_adjustment_items (adjustment_id, product_id, system_quantity, counted_quantity, difference)
         VALUES ($1, $2, $3, $4, $5)`,
        [newAdj.id, pId, systemQty, countedQty, diff]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: `Stock adjustment ${adjustmentNumber} created successfully as ${status}.`,
      data: newAdj,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create adjustment error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create stock adjustment." });
  } finally {
    client.release();
  }
};
