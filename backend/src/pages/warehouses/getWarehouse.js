import { pool } from "../../config/database.js";

// GET /api/warehouses
export const getWarehouses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      sortBy = "name",
      sortOrder = "ASC",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 20);
    const offset = (pageNum - 1) * limitNum;

    let baseWhere = "WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    // Search by name or address
    if (search && search.trim()) {
      const searchPattern = `%${search.trim()}%`;
      baseWhere += ` AND (w.name ILIKE $${paramIndex} OR COALESCE(w.address, '') ILIKE $${paramIndex})`;
      params.push(searchPattern);
      paramIndex++;
    }

    // Status filter (ACTIVE, INACTIVE, or All)
    if (status && status !== "All" && status !== "ALL") {
      baseWhere += ` AND w.status = $${paramIndex}`;
      params.push(status.toUpperCase());
      paramIndex++;
    }

    // Count query
    const countSql = `SELECT COUNT(w.id) FROM warehouses w ${baseWhere}`;
    const countRes = await pool.query(countSql, params);
    const totalRecords = parseInt(countRes.rows[0]?.count || 0);

    // List query with location count and total stock units
    const orderCol = ["name", "created_at", "status"].includes(sortBy)
      ? `w.${sortBy}`
      : "w.name";
    const orderDir = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const listSql = `
      SELECT 
        w.id,
        w.name,
        w.address,
        COALESCE(w.status, 'ACTIVE') AS status,
        w.created_at,
        COUNT(DISTINCT l.id) AS location_count,
        COALESCE(SUM(s.quantity), 0) AS total_units
      FROM warehouses w
      LEFT JOIN locations l ON w.id = l.warehouse_id
      LEFT JOIN stock s ON l.id = s.location_id
      ${baseWhere}
      GROUP BY w.id, w.name, w.address, w.status, w.created_at
      ORDER BY ${orderCol} ${orderDir}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limitNum, offset);

    const listRes = await pool.query(listSql, params);

    const formattedData = listRes.rows.map((row) => ({
      id: row.id,
      name: row.name,
      address: row.address || "",
      status: row.status,
      locationCount: parseInt(row.location_count || 0),
      totalUnits: parseFloat(row.total_units || 0),
      createdAt: row.created_at,
    }));

    return res.status(200).json({
      success: true,
      data: formattedData,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: totalRecords,
        totalPages: Math.ceil(totalRecords / limitNum) || 1,
      },
    });
  } catch (error) {
    console.error("Get warehouses error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load warehouses.",
    });
  }
};

// GET /api/warehouses/:id
export const getWarehouseById = async (req, res) => {
  try {
    const { id } = req.params;

    // Warehouse info and aggregated metrics
    const whRes = await pool.query(
      `SELECT 
        w.id,
        w.name,
        w.address,
        COALESCE(w.status, 'ACTIVE') AS status,
        w.created_at,
        COUNT(DISTINCT l.id) AS location_count,
        COUNT(DISTINCT s.product_id) FILTER (WHERE s.quantity > 0) AS total_products,
        COALESCE(SUM(s.quantity), 0) AS total_units
      FROM warehouses w
      LEFT JOIN locations l ON w.id = l.warehouse_id
      LEFT JOIN stock s ON l.id = s.location_id
      WHERE w.id = $1
      GROUP BY w.id, w.name, w.address, w.status, w.created_at`,
      [id]
    );

    if (whRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found.",
      });
    }

    const wh = whRes.rows[0];

    // Locations inside this warehouse with their stock metrics
    const locRes = await pool.query(
      `SELECT 
        l.id,
        l.name,
        COALESCE(l.status, 'ACTIVE') AS status,
        l.created_at,
        COUNT(DISTINCT s.product_id) FILTER (WHERE s.quantity > 0) AS product_count,
        COALESCE(SUM(s.quantity), 0) AS total_units
      FROM locations l
      LEFT JOIN stock s ON l.id = s.location_id
      WHERE l.warehouse_id = $1
      GROUP BY l.id, l.name, l.status, l.created_at
      ORDER BY l.name ASC`,
      [id]
    );

    const locations = locRes.rows.map((loc) => ({
      id: loc.id,
      name: loc.name,
      status: loc.status,
      productCount: parseInt(loc.product_count || 0),
      totalUnits: parseFloat(loc.total_units || 0),
      createdAt: loc.created_at,
    }));

    return res.status(200).json({
      success: true,
      data: {
        id: wh.id,
        name: wh.name,
        address: wh.address || "",
        status: wh.status,
        locationCount: parseInt(wh.location_count || 0),
        totalProducts: parseInt(wh.total_products || 0),
        totalUnits: parseFloat(wh.total_units || 0),
        createdAt: wh.created_at,
        locations,
      },
    });
  } catch (error) {
    console.error("Get warehouse details error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load warehouse details.",
    });
  }
};

export default { getWarehouses, getWarehouseById };
