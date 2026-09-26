import { pool } from "../../config/database.js";

// GET /api/adjustments - List adjustments with search, filters, pagination
export const getAdjustments = async (req, res) => {
  try {
    const { search, status, warehouse, location, product, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 20);
    const offset = (pageNum - 1) * limitNum;

    let baseQuery = `
      FROM stock_adjustments sa
      JOIN locations l ON sa.location_id = l.id
      JOIN warehouses w ON l.warehouse_id = w.id
      LEFT JOIN stock_adjustment_items sai ON sa.id = sai.adjustment_id
      LEFT JOIN products p ON sai.product_id = p.id
      LEFT JOIN users u ON sa.created_by = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (search && search.trim()) {
      baseQuery += ` AND (sa.adjustment_number ILIKE $${paramIndex} OR p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex} OR l.name ILIKE $${paramIndex})`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    if (status && status !== "All") {
      baseQuery += ` AND sa.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (warehouse && warehouse !== "All") {
      baseQuery += ` AND (w.id::text = $${paramIndex} OR w.name = $${paramIndex})`;
      params.push(warehouse);
      paramIndex++;
    }

    if (location && location !== "All") {
      baseQuery += ` AND (l.id::text = $${paramIndex} OR l.name = $${paramIndex})`;
      params.push(location);
      paramIndex++;
    }

    if (product && product !== "All") {
      baseQuery += ` AND (p.id::text = $${paramIndex} OR p.name = $${paramIndex})`;
      params.push(product);
      paramIndex++;
    }

    // Total count query
    const countSql = `SELECT COUNT(DISTINCT sa.id) ${baseQuery}`;
    const countRes = await pool.query(countSql, params);
    const totalRecords = parseInt(countRes.rows[0]?.count || 0);

    // List query
    const listSql = `
      SELECT 
        sa.id,
        sa.adjustment_number,
        sa.status,
        sa.reason,
        sa.created_at,
        l.id AS location_id,
        l.name AS location_name,
        w.id AS warehouse_id,
        w.name AS warehouse_name,
        sai.product_id,
        COALESCE(p.name, 'N/A') AS product_name,
        COALESCE(p.sku, 'N/A') AS sku,
        COALESCE(p.unit_of_measure, 'units') AS unit_of_measure,
        COALESCE(sai.system_quantity, 0) AS system_quantity,
        COALESCE(sai.counted_quantity, 0) AS counted_quantity,
        COALESCE(sai.difference, 0) AS difference,
        COALESCE(u.name, 'Admin') AS created_by_name
      ${baseQuery}
      ORDER BY sa.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limitNum, offset);

    const result = await pool.query(listSql, params);

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
    console.error("Get adjustments error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch adjustments" });
  }
};

// GET /api/adjustments/stock?productId=...&locationId=...
export const getLocationStock = async (req, res) => {
  try {
    const { productId, locationId } = req.query;

    if (!productId || !locationId) {
      return res.status(400).json({
        success: false,
        message: "productId and locationId are required",
      });
    }

    const result = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) AS system_quantity 
       FROM stock 
       WHERE product_id = $1 AND location_id = $2`,
      [productId, locationId]
    );

    const systemQuantity = parseFloat(result.rows[0]?.system_quantity || 0);

    return res.status(200).json({
      success: true,
      data: {
        productId,
        locationId,
        systemQuantity,
      },
    });
  } catch (error) {
    console.error("Get adjustment location stock error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch current stock" });
  }
};

export default {
  getAdjustments,
  getLocationStock,
};
