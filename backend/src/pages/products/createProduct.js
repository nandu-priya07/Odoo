import { pool } from "../../config/database.js";

export const createProduct = async (req, res) => {
  try {
    const { name, sku, categoryId, unitOfMeasure = "pcs", initialStock = 0 } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Product name is required" });
    }

    const generateSku = sku && sku.trim() ? sku.trim() : `SKU-${Math.floor(100000 + Math.random() * 900000)}`;

    const skuCheck = await pool.query("SELECT id FROM products WHERE sku = $1", [generateSku]);
    if (skuCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: `SKU '${generateSku}' already exists.` });
    }

    const result = await pool.query(
      `INSERT INTO products (name, sku, category_id, unit_of_measure, initial_stock)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [name.trim(), generateSku, categoryId || null, unitOfMeasure || "pcs", Number(initialStock) || 0]
    );

    const newProduct = result.rows[0];

    const initStockNum = Number(initialStock) || 0;
    if (initStockNum > 0) {
      const locRes = await pool.query("SELECT id FROM locations ORDER BY created_at ASC LIMIT 1");
      if (locRes.rows.length > 0) {
        const locId = locRes.rows[0].id;
        await pool.query(
          `INSERT INTO stock (product_id, location_id, quantity)
           VALUES ($1, $2, $3)
           ON CONFLICT (product_id, location_id)
           DO UPDATE SET quantity = stock.quantity + $3`,
          [newProduct.id, locId, initStockNum]
        );
      }
    }

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct,
    });
  } catch (error) {
    console.error("Create product error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create product" });
  }
};
