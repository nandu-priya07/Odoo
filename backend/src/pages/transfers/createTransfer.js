import { pool } from "../../config/database.js";

export const createTransfer = async (req, res) => {
  const client = await pool.connect();

  try {
    const { fromLocationId, toLocationId, items, status = "DRAFT" } = req.body;

    if (!fromLocationId || !toLocationId) {
      return res.status(400).json({ success: false, message: "Source and Target locations are required." });
    }

    if (fromLocationId === toLocationId) {
      return res.status(400).json({ success: false, message: "Source and Target locations cannot be the same." });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "At least one product item is required for transfer." });
    }

    await client.query("BEGIN");

    const countRes = await client.query("SELECT COUNT(*) FROM internal_transfers");
    const nextSeq = parseInt(countRes.rows[0].count, 10) + 1;
    const transferNumber = `TRF-${String(nextSeq).padStart(5, "0")}`;

    const result = await client.query(
      `INSERT INTO internal_transfers (transfer_number, from_location_id, to_location_id, status)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [transferNumber, fromLocationId, toLocationId, status]
    );

    const newTransfer = result.rows[0];

    for (const item of items) {
      const pId = item.productId;
      const pQty = Number(item.quantity) || 1;

      await client.query(
        `INSERT INTO transfer_items (transfer_id, product_id, quantity)
         VALUES ($1, $2, $3)`,
        [newTransfer.id, pId, pQty]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: `Stock transfer ${transferNumber} created successfully as ${status}.`,
      data: newTransfer,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create transfer error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create transfer." });
  } finally {
    client.release();
  }
};
