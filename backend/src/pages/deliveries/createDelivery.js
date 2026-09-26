import { pool } from "../../config/database.js";

export const createDelivery = async (req, res) => {
  const client = await pool.connect();

  try {
    const { customerName, warehouseId, items } = req.body;

    // 1. Validate customerName
    if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required.",
      });
    }

    // 2. Validate warehouseId
    if (!warehouseId) {
      return res.status(400).json({
        success: false,
        message: "Warehouse is required.",
      });
    }

    const whCheck = await client.query("SELECT id, name FROM warehouses WHERE id = $1", [warehouseId]);
    if (whCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Selected warehouse does not exist.",
      });
    }

    // 3. Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one product item is required for a delivery.",
      });
    }

    // Begin PostgreSQL Transaction
    await client.query("BEGIN");

    // Generate automatic Delivery Number (DEL-00001 format)
    const countRes = await client.query("SELECT COUNT(*) FROM deliveries");
    const nextSeq = parseInt(countRes.rows[0].count, 10) + 1;
    const deliveryNumber = `DEL-${String(nextSeq).padStart(5, "0")}`;

    // Validate each item against database
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rowNum = i + 1;

      if (!item.productId) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: `Item #${rowNum}: Product is required.`,
        });
      }

      if (!item.locationId) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: `Item #${rowNum}: Location is required.`,
        });
      }

      const qty = Number(item.quantity);
      if (isNaN(qty) || qty <= 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: `Item #${rowNum}: Quantity must be greater than 0.`,
        });
      }

      // Verify product exists
      const prodCheck = await client.query("SELECT id, name, sku FROM products WHERE id = $1", [item.productId]);
      if (prodCheck.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: `Item #${rowNum}: Product does not exist.`,
        });
      }
      const product = prodCheck.rows[0];

      // Verify location belongs to selected warehouse
      const locCheck = await client.query(
        "SELECT id, name FROM locations WHERE id = $1 AND warehouse_id = $2",
        [item.locationId, warehouseId]
      );
      if (locCheck.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: `Item #${rowNum}: Location does not belong to the selected warehouse.`,
        });
      }
      const location = locCheck.rows[0];

      // Verify available stock in PostgreSQL
      const stockCheck = await client.query(
        "SELECT COALESCE(quantity, 0) AS available FROM stock WHERE product_id = $1 AND location_id = $2",
        [item.productId, item.locationId]
      );
      const availableStock = Number(stockCheck.rows[0]?.available || 0);

      if (qty > availableStock) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name} at location ${location.name}. Available: ${availableStock} units, Requested: ${qty} units.`,
        });
      }
    }

    // Insert into deliveries table with DRAFT status
    const deliveryResult = await client.query(
      `INSERT INTO deliveries (delivery_number, customer_name, warehouse_id, status)
       VALUES ($1, $2, $3, 'DRAFT')
       RETURNING *`,
      [deliveryNumber, customerName.trim(), warehouseId]
    );
    const newDelivery = deliveryResult.rows[0];

    // Insert into delivery_items table
    for (const item of items) {
      await client.query(
        `INSERT INTO delivery_items (delivery_id, product_id, location_id, quantity)
         VALUES ($1, $2, $3, $4)`,
        [newDelivery.id, item.productId, item.locationId, Number(item.quantity)]
      );
    }

    // Commit Transaction (NOTE: Do NOT modify stock or ledger because status is DRAFT)
    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: `Delivery ${deliveryNumber} created successfully as DRAFT.`,
      data: newDelivery,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create delivery error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create delivery.",
    });
  } finally {
    client.release();
  }
};
