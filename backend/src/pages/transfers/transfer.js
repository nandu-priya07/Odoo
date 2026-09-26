import { pool } from "../../config/database.js";

// GET /api/transfers - List with search, filters, pagination
export const getTransfers = async (req, res) => {
  try {
    const { search, status, warehouse, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 20);
    const offset = (pageNum - 1) * limitNum;

    let baseQuery = `
      FROM internal_transfers t
      JOIN locations fl ON t.from_location_id = fl.id
      JOIN warehouses fw ON fl.warehouse_id = fw.id
      JOIN locations tl ON t.to_location_id = tl.id
      JOIN warehouses tw ON tl.warehouse_id = tw.id
      LEFT JOIN transfer_items ti ON t.id = ti.transfer_id
      LEFT JOIN products p ON ti.product_id = p.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    if (search && search.trim()) {
      baseQuery += ` AND (t.transfer_number ILIKE $${paramIndex} OR p.name ILIKE $${paramIndex} OR p.sku ILIKE $${paramIndex})`;
      params.push(`%${search.trim()}%`);
      paramIndex++;
    }

    if (status && status !== "All") {
      baseQuery += ` AND t.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    if (warehouse && warehouse !== "All") {
      baseQuery += ` AND (fw.id::text = $${paramIndex} OR fw.name = $${paramIndex} OR tw.id::text = $${paramIndex} OR tw.name = $${paramIndex})`;
      params.push(warehouse);
      paramIndex++;
    }

    // Total count query
    const countSql = `SELECT COUNT(DISTINCT t.id) ${baseQuery}`;
    const countRes = await pool.query(countSql, params);
    const totalRecords = parseInt(countRes.rows[0]?.count || 0);

    // List query
    const listSql = `
      SELECT 
        t.id,
        t.transfer_number,
        t.status,
        t.created_at,
        t.updated_at,
        fl.id AS from_location_id,
        fl.name AS from_location_name,
        fw.id AS from_warehouse_id,
        fw.name AS from_warehouse_name,
        tl.id AS to_location_id,
        tl.name AS to_location_name,
        tw.id AS to_warehouse_id,
        tw.name AS to_warehouse_name,
        ti.product_id,
        COALESCE(p.name, 'N/A') AS product_name,
        COALESCE(p.sku, 'N/A') AS sku,
        COALESCE(p.unit_of_measure, 'units') AS unit_of_measure,
        COALESCE(ti.quantity, 0) AS quantity,
        COALESCE(u.name, 'Admin') AS created_by_name
      ${baseQuery}
      ORDER BY t.created_at DESC
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
    console.error("Get transfers error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch transfers" });
  }
};

// GET /api/transfers/stock?productId=...&locationId=...
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
      `SELECT COALESCE(SUM(quantity), 0) AS available_stock 
       FROM stock 
       WHERE product_id = $1 AND location_id = $2`,
      [productId, locationId]
    );

    const availableStock = parseFloat(result.rows[0]?.available_stock || 0);

    return res.status(200).json({
      success: true,
      data: {
        productId,
        locationId,
        availableStock,
      },
    });
  } catch (error) {
    console.error("Get location stock error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch location stock" });
  }
};

export default {
  getTransfers,
  getLocationStock,
};
