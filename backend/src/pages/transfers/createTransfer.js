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
    // Ignore invalid token and fallback
  }
  const defaultUser = await pool.query("SELECT id FROM users ORDER BY created_at ASC LIMIT 1");
  return defaultUser.rows[0]?.id || null;
};

// POST /api/transfers
export const createTransfer = async (req, res) => {
  const client = await pool.connect();

  try {
    const { fromLocationId, toLocationId, productId, quantity } = req.body;

    // 1. Validate required fields
    if (!fromLocationId) {
      return res.status(400).json({ success: false, message: "Source location is required." });
    }
    if (!toLocationId) {
      return res.status(400).json({ success: false, message: "Destination location is required." });
    }
    if (!productId) {
      return res.status(400).json({ success: false, message: "Product is required." });
    }

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: "Quantity must be greater than zero." });
    }

    // 2. Verify source and destination are different
    if (fromLocationId === toLocationId) {
      return res.status(400).json({
        success: false,
        message: "Source and destination locations must be different.",
      });
    }

    // 3. Verify locations exist
    const fromLocRes = await pool.query("SELECT id, name FROM locations WHERE id = $1", [fromLocationId]);
    if (fromLocRes.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Source location does not exist." });
    }

    const toLocRes = await pool.query("SELECT id, name FROM locations WHERE id = $1", [toLocationId]);
    if (toLocRes.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Destination location does not exist." });
    }

    // 4. Verify product exists
    const prodRes = await pool.query("SELECT id, name, unit_of_measure FROM products WHERE id = $1", [productId]);
    if (prodRes.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Selected product does not exist." });
    }
    const product = prodRes.rows[0];

    // 5. Verify sufficient stock at source location
    const stockRes = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) AS available_stock 
       FROM stock 
       WHERE product_id = $1 AND location_id = $2`,
      [productId, fromLocationId]
    );
    const availableStock = parseFloat(stockRes.rows[0]?.available_stock || 0);

    if (qty > availableStock) {
      return res.status(400).json({
        success: false,
        message: `Only ${availableStock} ${product.unit_of_measure || "units"} available at the source location.`,
        availableStock,
      });
    }

    // 6. Generate sequential transfer number (TRF-00001, TRF-00002...)
    const maxTrfRes = await pool.query(
      `SELECT COALESCE(MAX(CAST(SUBSTRING(transfer_number FROM 5) AS INTEGER)), 0) AS max_num 
       FROM internal_transfers 
       WHERE transfer_number ~ '^TRF-[0-9]+$'`
    );
    const nextNum = (parseInt(maxTrfRes.rows[0]?.max_num, 10) || 0) + 1;
    const transferNumber = `TRF-${String(nextNum).padStart(5, "0")}`;

    const userId = await getAuthenticatedUserId(req);

    // 7. Begin PostgreSQL transaction
    await client.query("BEGIN");

    // Insert internal transfer
    const insertTrfRes = await client.query(
      `INSERT INTO internal_transfers (transfer_number, from_location_id, to_location_id, status, created_by)
       VALUES ($1, $2, $3, 'DRAFT', $4)
       RETURNING *`,
      [transferNumber, fromLocationId, toLocationId, userId]
    );
    const newTransfer = insertTrfRes.rows[0];

    // Insert transfer item
    await client.query(
      `INSERT INTO transfer_items (transfer_id, product_id, quantity)
       VALUES ($1, $2, $3)`,
      [newTransfer.id, productId, qty]
    );

    // NOTE: Creating the transfer must NOT change stock!
    // Stock changes only when the transfer is validated.
    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: `Transfer ${transferNumber} created successfully in DRAFT status.`,
      data: {
        ...newTransfer,
        product_id: productId,
        product_name: product.name,
        quantity: qty,
        unit_of_measure: product.unit_of_measure,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create transfer error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create transfer.",
    });
  } finally {
    client.release();
  }
};

export default createTransfer;
