import { pool } from "../../config/database.js";

// PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, unitOfMeasure } = req.body;

    // Check if product exists
    const existingRes = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (existingRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Product name is required" });
    }

    // Verify category if provided
    if (categoryId) {
      const catCheck = await pool.query("SELECT id FROM categories WHERE id = $1", [categoryId]);
      if (catCheck.rows.length === 0) {
        return res.status(400).json({ success: false, message: "Selected category does not exist" });
      }
    }

    // Update product: Name, Category, Unit of Measure
    // SKU is preserved. Historical stock is untouched.
    const result = await pool.query(
      `UPDATE products
       SET name = $1,
           category_id = COALESCE($2, category_id),
           unit_of_measure = COALESCE($3, unit_of_measure),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [
        name.trim(),
        categoryId || null,
        unitOfMeasure ? unitOfMeasure.trim() : null,
        id,
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update product error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to update product" });
  }
};

export default updateProduct;
