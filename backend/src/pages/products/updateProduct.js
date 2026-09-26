import { pool } from "../../config/database.js";

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, categoryId, unitOfMeasure, initialStock } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Product name is required" });
    }

    if (sku) {
      const skuCheck = await pool.query("SELECT id FROM products WHERE sku = $1 AND id != $2", [sku.trim(), id]);
      if (skuCheck.rows.length > 0) {
        return res.status(400).json({ success: false, message: `SKU '${sku}' belongs to another product.` });
      }
    }

    const result = await pool.query(
      `UPDATE products
       SET name = $1,
           sku = COALESCE($2, sku),
           category_id = $3,
           unit_of_measure = COALESCE($4, unit_of_measure),
           initial_stock = COALESCE($5, initial_stock),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        name.trim(),
        sku ? sku.trim() : null,
        categoryId || null,
        unitOfMeasure || null,
        initialStock !== undefined && initialStock !== null && initialStock !== "" ? Number(initialStock) : null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update product" });
  }
};
