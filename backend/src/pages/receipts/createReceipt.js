import { pool } from "../../config/database.js";

export const createReceipt = async (req, res) => {
  const client = await pool.connect();

  try {
    const { supplierId, warehouseId, recipientAddress, receiptDate, items, status = "DRAFT" } = req.body;

    if (!warehouseId) {
      return res.status(400).json({ success: false, message: "Destination Warehouse is required." });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: "At least one product line item is required." });
    }

    await client.query("BEGIN");

    const countRes = await client.query("SELECT COUNT(*) FROM receipts");
    const nextSeq = parseInt(countRes.rows[0].count, 10) + 1;
    const receiptNumber = `REC-${String(nextSeq).padStart(5, "0")}`;

    const computedNetQty = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
    const finalDate = receiptDate ? new Date(receiptDate) : new Date();

    const result = await client.query(
      `INSERT INTO receipts (receipt_number, supplier_id, warehouse_id, status, recipient_address, net_qty, receipt_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [receiptNumber, supplierId || null, warehouseId, status, recipientAddress || null, computedNetQty, finalDate]
    );

    const newReceipt = result.rows[0];

    const locRes = await client.query("SELECT id FROM locations WHERE warehouse_id = $1 LIMIT 1", [warehouseId]);
    const defaultLocId = locRes.rows[0]?.id || null;

    for (const item of items) {
      const pId = item.productId;
      const pQty = Number(item.quantity) || 1;
      const locId = item.locationId || defaultLocId;

      await client.query(
        `INSERT INTO receipt_items (receipt_id, product_id, location_id, quantity)
         VALUES ($1, $2, $3, $4)`,
        [newReceipt.id, pId, locId, pQty]
      );
    }

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: `Receipt ${receiptNumber} created successfully as ${status}.`,
      data: newReceipt,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create receipt error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create receipt." });
  } finally {
    client.release();
  }
};
