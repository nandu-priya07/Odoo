import { pool } from "../../config/database.js";

// GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { search, category, stockStatus, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 20);
    const offset = (pageNum - 1) * limitNum;

    let baseQuery = `
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN stock s ON p.id = s.product_id
      LEFT JOIN locations l ON s.location_id = l.id
      LEFT JOIN warehouses w ON l.warehouse_id = w.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (search && search.trim()) {
      baseQuery += ` AND (p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    if (category && category !== "All") {
      baseQuery += ` AND (c.id = $${paramIndex} OR c.name = $${paramIndex})`;
      params.push(category);
      paramIndex++;
    }

    // Common grouping & selection
    const fullQuery = `
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.category_id,
        p.unit_of_measure,
        p.initial_stock,
        p.created_at,
        p.updated_at,
        COALESCE(c.name, 'Uncategorized') AS category_name,
        COALESCE(SUM(s.quantity), 0) AS total_stock,
        COALESCE(
          (
            SELECT w2.name 
            FROM stock s2 
            JOIN locations l2 ON s2.location_id = l2.id 
            JOIN warehouses w2 ON l2.warehouse_id = w2.id 
            WHERE s2.product_id = p.id AND s2.quantity > 0 
            LIMIT 1
          ),
          (
            SELECT w3.name 
            FROM warehouses w3 
            ORDER BY w3.created_at ASC 
            LIMIT 1
          ),
          'Main Warehouse'
        ) AS location_name,
        CASE
          WHEN COALESCE(SUM(s.quantity), 0) <= 0 THEN 'Out of Stock'
          WHEN COALESCE(SUM(s.quantity), 0) <= 10 THEN 'Low Stock'
          ELSE 'In Stock'
        END AS status
      ${baseQuery}
      GROUP BY p.id, p.name, p.sku, p.category_id, p.unit_of_measure, p.initial_stock, p.created_at, p.updated_at, c.name
    `;

    // Filter by stockStatus having clause if provided
    let finalQuery = fullQuery;
    if (stockStatus && stockStatus !== "All") {
      if (stockStatus === "Out of Stock") {
        finalQuery += ` HAVING COALESCE(SUM(s.quantity), 0) <= 0`;
      } else if (stockStatus === "Low Stock") {
        finalQuery += ` HAVING COALESCE(SUM(s.quantity), 0) > 0 AND COALESCE(SUM(s.quantity), 0) <= 10`;
      } else if (stockStatus === "In Stock") {
        finalQuery += ` HAVING COALESCE(SUM(s.quantity), 0) > 10`;
      }
    }

    // Get count
    const countSql = `SELECT COUNT(*) FROM (${finalQuery}) AS count_tbl`;
    const countRes = await pool.query(countSql, params);
    const totalRecords = parseInt(countRes.rows[0]?.count || 0);

    // Apply pagination
    finalQuery += ` ORDER BY p.name ASC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limitNum, offset);

    const result = await pool.query(finalQuery, params);

    return res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        total: totalRecords,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalRecords / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

// GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Basic product info
    const productRes = await pool.query(
      `SELECT 
         p.id,
         p.name,
         p.sku,
         p.category_id,
         p.unit_of_measure,
         p.initial_stock,
         p.created_at,
         p.updated_at,
         COALESCE(c.name, 'Uncategorized') AS category_name,
         COALESCE(SUM(s.quantity), 0) AS total_stock
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN stock s ON p.id = s.product_id
       WHERE p.id = $1
       GROUP BY p.id, c.name`,
      [id]
    );

    if (productRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const product = productRes.rows[0];

    // 2. Stock by location
    const stockRes = await pool.query(
      `SELECT 
         w.name AS warehouse_name,
         l.name AS location_name,
         s.quantity
       FROM stock s
       JOIN locations l ON s.location_id = l.id
       JOIN warehouses w ON l.warehouse_id = w.id
       WHERE s.product_id = $1 AND s.quantity > 0
       ORDER BY w.name, l.name`,
      [id]
    );
    product.stock_by_location = stockRes.rows;

    // 3. Reorder rule
    const ruleRes = await pool.query(
      `SELECT minimum_stock, reorder_quantity FROM reorder_rules WHERE product_id = $1 LIMIT 1`,
      [id]
    );
    product.reorder_minimum = ruleRes.rows[0]?.minimum_stock || null;
    product.reorder_quantity = ruleRes.rows[0]?.reorder_quantity || null;

    // 4. Recent stock movements
    const movementsRes = await pool.query(
      `SELECT 
         sl.id,
         sl.transaction_type,
         sl.quantity_change,
         sl.quantity_after,
         sl.created_at,
         l.name AS location_name,
         w.name AS warehouse_name
       FROM stock_ledger sl
       LEFT JOIN locations l ON sl.location_id = l.id
       LEFT JOIN warehouses w ON l.warehouse_id = w.id
       WHERE sl.product_id = $1
       ORDER BY sl.created_at DESC
       LIMIT 10`,
      [id]
    );
    product.recent_movements = movementsRes.rows;

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error("Get product error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch product" });
  }
};

// GET /api/products/:id/stock
export const getProductStock = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT 
         w.name AS warehouse_name,
         l.id AS location_id,
         l.name AS location_name,
         s.quantity,
         p.unit_of_measure
       FROM stock s
       JOIN locations l ON s.location_id = l.id
       JOIN warehouses w ON l.warehouse_id = w.id
       JOIN products p ON s.product_id = p.id
       WHERE s.product_id = $1 AND s.quantity > 0
       ORDER BY w.name, l.name`,
      [id]
    );

    const total = result.rows.reduce((sum, row) => sum + parseFloat(row.quantity || 0), 0);

    return res.status(200).json({
      success: true,
      data: {
        locations: result.rows,
        total_stock: total,
      },
    });
  } catch (error) {
    console.error("Get product stock error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch stock for product" });
  }
};

// GET /api/categories
export const getCategories = async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name FROM categories ORDER BY name ASC");
    return res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Get categories error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch categories" });
  }
};

export default {
  getProducts,
  getProductById,
  getProductStock,
  getCategories,
};
