import { pool } from "../../config/database.js";

export const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    let query = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.category_id,
        p.unit_of_measure,
        p.initial_stock,
        p.created_at,
        p.updated_at,
        c.name AS category_name,
        COALESCE(SUM(s.quantity), 0) AS total_stock
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN stock s ON p.id = s.product_id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (search && search.trim()) {
      query += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    if (category && category !== "All") {
      query += ` AND (c.id = $${paramIndex} OR c.name = $${paramIndex})`;
      params.push(category);
      paramIndex++;
    }

    query += ` GROUP BY p.id, p.name, p.sku, p.category_id, p.unit_of_measure, p.initial_stock, p.created_at, p.updated_at, c.name ORDER BY p.name ASC`;

    const result = await pool.query(query, params);
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT p.*, c.name AS category_name, COALESCE(SUM(s.quantity), 0) AS total_stock
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN stock s ON p.id = s.product_id
       WHERE p.id = $1
       GROUP BY p.id, c.name`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    return res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Get product error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
};

export default {
  getProducts,
  getProductById,
};
