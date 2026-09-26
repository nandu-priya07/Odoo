import pool from "../../config/database.js";

// Get all reorder rules with product info and current stock
export const getReorderRules = async (req, res) => {
  try {
    const query = `
      SELECT 
        rr.id,
        rr.product_id,
        rr.minimum_stock,
        rr.reorder_quantity,
        rr.created_at,
        rr.updated_at,
        p.name AS product_name,
        p.sku,
        p.unit_of_measure,
        COALESCE(c.name, 'Uncategorized') AS category_name,
        COALESCE(SUM(s.quantity), 0) AS current_stock,
        CASE
          WHEN COALESCE(SUM(s.quantity), 0) = 0 THEN 'OUT OF STOCK'
          WHEN COALESCE(SUM(s.quantity), 0) <= rr.minimum_stock THEN 'LOW STOCK'
          ELSE 'NORMAL'
        END AS stock_status
      FROM reorder_rules rr
      JOIN products p ON rr.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN stock s ON p.id = s.product_id
      GROUP BY rr.id, rr.product_id, rr.minimum_stock, rr.reorder_quantity, rr.created_at, rr.updated_at, p.name, p.sku, p.unit_of_measure, c.name
      ORDER BY p.name ASC
    `;

    const result = await pool.query(query);

    return res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    console.error("Error fetching reorder rules:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error fetching reorder rules",
      error: error.message,
    });
  }
};

// Create or Update reorder rule
export const upsertReorderRule = async (req, res) => {
  try {
    const { product_id, minimum_stock, reorder_quantity } = req.body;

    if (!product_id || minimum_stock === undefined || reorder_quantity === undefined) {
      return res.status(400).json({
        success: false,
        message: "product_id, minimum_stock, and reorder_quantity are required",
      });
    }

    const query = `
      INSERT INTO reorder_rules (product_id, minimum_stock, reorder_quantity, updated_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      ON CONFLICT (product_id) 
      DO UPDATE SET 
        minimum_stock = EXCLUDED.minimum_stock,
        reorder_quantity = EXCLUDED.reorder_quantity,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    const result = await pool.query(query, [product_id, minimum_stock, reorder_quantity]);

    return res.status(200).json({
      success: true,
      data: result.rows[0],
      message: "Reorder rule saved successfully",
    });
  } catch (error) {
    console.error("Error saving reorder rule:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error saving reorder rule",
      error: error.message,
    });
  }
};

// Delete reorder rule
export const deleteReorderRule = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("DELETE FROM reorder_rules WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Reorder rule not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Reorder rule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting reorder rule:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error deleting reorder rule",
      error: error.message,
    });
  }
};
