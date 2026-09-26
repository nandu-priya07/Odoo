import { pool } from "../../config/database.js";

// POST /api/products
export const createProduct = async (req, res) => {
  try {
    const { name, sku, categoryId, unitOfMeasure, initialStock = 0, locationId } = req.body;

    // 1. Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Product name is required" });
    }

    if (!sku || !sku.trim()) {
      return res.status(400).json({ success: false, message: "SKU / Code is required" });
    }

    if (!categoryId) {
      return res.status(400).json({ success: false, message: "Category is required" });
    }

    if (!unitOfMeasure || !unitOfMeasure.trim()) {
      return res.status(400).json({ success: false, message: "Unit of Measure is required" });
    }

    const initStockNum = parseFloat(initialStock);
    if (isNaN(initStockNum) || initStockNum < 0) {
      return res.status(400).json({ success: false, message: "Initial stock must be a non-negative number (>= 0)" });
    }

    // 2. Verify category exists
    const categoryCheck = await pool.query("SELECT id FROM categories WHERE id = $1", [categoryId]);
    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({ success: false, message: "Selected category does not exist" });
    }

    // 3. Check SKU uniqueness
    const skuClean = sku.trim();
    const skuCheck = await pool.query("SELECT id FROM products WHERE LOWER(sku) = LOWER($1)", [skuClean]);
    if (skuCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: `SKU '${skuClean}' is already in use by another product.` });
    }

    // 4. Create the product
    const insertRes = await pool.query(
      `INSERT INTO products (name, sku, category_id, unit_of_measure, initial_stock)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name.trim(), skuClean, categoryId, unitOfMeasure.trim(), initStockNum]
    );

    const newProduct = insertRes.rows[0];

    // 5. Handle initial stock correctly
    // If a valid locationId was provided and initStockNum > 0, create stock record
    if (initStockNum > 0 && locationId) {
      const locCheck = await pool.query("SELECT id FROM locations WHERE id = $1", [locationId]);
      if (locCheck.rows.length > 0) {
        await pool.query(
          `INSERT INTO stock (product_id, location_id, quantity)
           VALUES ($1, $2, $3)
           ON CONFLICT (product_id, location_id)
           DO UPDATE SET quantity = stock.quantity + $3, updated_at = CURRENT_TIMESTAMP`,
          [newProduct.id, locationId, initStockNum]
        );

        await pool.query(
          `INSERT INTO stock_ledger (product_id, location_id, transaction_type, reference_no, quantity_change, quantity_after)
           VALUES ($1, $2, 'RECEIPT', 'INITIAL-STOCK', $3, $3)`,
          [newProduct.id, locationId, initStockNum]
        );
      }
    }
    // If no location is provided, do NOT invent fake locations; initial_stock is kept in products table

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      data: newProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create product" });
  }
};

export default createProduct;
