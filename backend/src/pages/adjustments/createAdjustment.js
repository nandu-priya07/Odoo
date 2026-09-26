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

// POST /api/adjustments
export const createAdjustment = async (req, res) => {
  const client = await pool.connect();

  try {
    const { locationId, productId, physicalCount, reason } = req.body;

    // 1. Validate required fields
    if (!locationId) {
      return res.status(400).json({ success: false, message: "Location is required." });
    }
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product is required." });
    }
    if (physicalCount === undefined || physicalCount === null || physicalCount === "") {
      return res.status(400).json({ success: false, message: "Physical count is required." });
    }
    const countedQty = parseFloat(physicalCount);
    if (isNaN(countedQty) || countedQty < 0) {
      return res.status(400).json({ success: false, message: "Physical count cannot be negative." });
    }
    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: "Reason is required." });
    }

    // 2. Verify location and warehouse
    const locRes = await pool.query(
      `SELECT l.id, l.name, w.id AS warehouse_id, w.name AS warehouse_name 
       FROM locations l 
       JOIN warehouses w ON l.warehouse_id = w.id 
       WHERE l.id = $1`,
      [locationId]
    );
    if (locRes.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Selected location does not exist." });
    }

    // 3. Verify product
    const prodRes = await pool.query(
      "SELECT id, name, sku, unit_of_measure FROM products WHERE id = $1",
      [productId]
    );
    if (prodRes.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Selected product does not exist." });
    }
    const product = prodRes.rows[0];

    // 4. Fetch current stock from PostgreSQL (never trust frontend stock)
    const stockRes = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) AS system_quantity 
       FROM stock 
       WHERE product_id = $1 AND location_id = $2`,
      [productId, locationId]
    );
    const systemQuantity = parseFloat(stockRes.rows[0]?.system_quantity || 0);

    // 5. Calculate difference: difference = physicalCount - systemQuantity
    const difference = countedQty - systemQuantity;

    // 6. Generate sequential adjustment number (ADJ-00001, ADJ-00002...)
    const maxAdjRes = await pool.query(
      `SELECT COALESCE(MAX(CAST(SUBSTRING(adjustment_number FROM 5) AS INTEGER)), 0) AS max_num 
       FROM stock_adjustments 
       WHERE adjustment_number ~ '^ADJ-[0-9]+$'`
    );
    const nextNum = (parseInt(maxAdjRes.rows[0]?.max_num, 10) || 0) + 1;
    const adjustmentNumber = `ADJ-${String(nextNum).padStart(5, "0")}`;

    const userId = await getAuthenticatedUserId(req);

    // 7. Begin PostgreSQL transaction
    await client.query("BEGIN");

    // Create adjustment in DRAFT status
    const insertAdjRes = await client.query(
      `INSERT INTO stock_adjustments (adjustment_number, location_id, reason, status, created_by)
       VALUES ($1, $2, $3, 'DRAFT', $4)
       RETURNING *`,
      [adjustmentNumber, locationId, reason.trim(), userId]
    );
    const newAdjustment = insertAdjRes.rows[0];

    // Create adjustment item
    await client.query(
      `INSERT INTO stock_adjustment_items (adjustment_id, product_id, system_quantity, counted_quantity, difference)
       VALUES ($1, $2, $3, $4, $5)`,
      [newAdjustment.id, productId, systemQuantity, countedQty, difference]
    );

    // NOTE: Creating an adjustment must NOT change stock!
    // Stock changes ONLY when the adjustment is validated.
    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: `Adjustment ${adjustmentNumber} created successfully in DRAFT status.`,
      data: {
        ...newAdjustment,
        product_id: productId,
        product_name: product.name,
        sku: product.sku,
        unit_of_measure: product.unit_of_measure,
        system_quantity: systemQuantity,
        counted_quantity: countedQty,
        difference,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create adjustment error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create adjustment.",
    });
  } finally {
    client.release();
  }
};

export default createAdjustment;
