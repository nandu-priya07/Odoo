import { pool } from "../../config/database.js";

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING id, name", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({
      success: true,
      message: `Product '${result.rows[0].name}' deleted successfully.`,
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: "Cannot delete product because it has associated stock movements or orders.",
    });
  }
};
