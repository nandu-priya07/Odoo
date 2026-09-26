import { pool } from "../../config/database.js";

// GET /api/locations
export const getLocations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      warehouseId,
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

    // Search by location name
    if (search && search.trim()) {
      const searchPattern = `%${search.trim()}%`;
      baseWhere += ` AND l.name ILIKE $${paramIndex}`;
      params.push(searchPattern);
      paramIndex++;
    }

    // Warehouse filter
    if (warehouseId && warehouseId !== "All" && warehouseId !== "ALL") {
      baseWhere += ` AND (l.warehouse_id::text = $${paramIndex} OR w.name = $${paramIndex})`;
      params.push(warehouseId);
      paramIndex++;
    }

    // Status filter
    if (status && status !== "All" && status !== "ALL") {
      baseWhere += ` AND l.status = $${paramIndex}`;
      params.push(status.toUpperCase());
      paramIndex++;
    }

    // Total count query
    const countSql = `
      SELECT COUNT(l.id)
      FROM locations l
      JOIN warehouses w ON l.warehouse_id = w.id
      ${baseWhere}
    `;
    const countRes = await pool.query(countSql, params);
    const totalRecords = parseInt(countRes.rows[0]?.count || 0);

    // List query with stock metrics
    const orderCol = ["name", "created_at", "status"].includes(sortBy)
      ? `l.${sortBy}`
      : "l.name";
    const orderDir = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

    const listSql = `
      SELECT 
        l.id,
        l.name,
        COALESCE(l.status, 'ACTIVE') AS status,
        l.created_at,
        w.id AS warehouse_id,
        w.name AS warehouse_name,
        COALESCE(w.status, 'ACTIVE') AS warehouse_status,
        COUNT(DISTINCT s.product_id) FILTER (WHERE s.quantity > 0) AS product_count,
        COALESCE(SUM(s.quantity), 0) AS total_units
      FROM locations l
      JOIN warehouses w ON l.warehouse_id = w.id
      LEFT JOIN stock s ON l.id = s.location_id
      ${baseWhere}
      GROUP BY l.id, l.name, l.status, l.created_at, w.id, w.name, w.status
      ORDER BY ${orderCol} ${orderDir}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limitNum, offset);

    const listRes = await pool.query(listSql, params);

    const formattedData = listRes.rows.map((row) => ({
      id: row.id,
      name: row.name,
      status: row.status,
      warehouse: {
        id: row.warehouse_id,
        name: row.warehouse_name,
        status: row.warehouse_status,
      },
      productCount: parseInt(row.product_count || 0),
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
    console.error("Get locations error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load locations.",
    });
  }
};

// GET /api/locations/:id
export const getLocationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Location & warehouse info
    const locRes = await pool.query(
      `SELECT 
        l.id,
        l.name,
        COALESCE(l.status, 'ACTIVE') AS status,
        l.created_at,
        l.warehouse_id,
        w.name AS warehouse_name,
        COALESCE(w.status, 'ACTIVE') AS warehouse_status,
        w.address AS warehouse_address
      FROM locations l
      JOIN warehouses w ON l.warehouse_id = w.id
      WHERE l.id = $1`,
      [id]
    );

    if (locRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Location not found.",
      });
    }

    const loc = locRes.rows[0];

    // Inventory stored at this location (quantity > 0)
    const stockRes = await pool.query(
      `SELECT 
        s.id AS stock_id,
        s.quantity,
        s.updated_at,
        p.id AS product_id,
        p.name AS product_name,
        p.sku,
        p.unit_of_measure,
        c.name AS category_name
      FROM stock s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE s.location_id = $1 AND s.quantity > 0
      ORDER BY p.name ASC`,
      [id]
    );

    const inventory = stockRes.rows.map((row) => ({
      stockId: row.stock_id,
      productId: row.product_id,
      productName: row.product_name,
      sku: row.sku,
      quantity: parseFloat(row.quantity),
      unit: row.unit_of_measure,
      category: row.category_name || "General",
      updatedAt: row.updated_at,
    }));

    const totalUnits = inventory.reduce((sum, item) => sum + item.quantity, 0);

    return res.status(200).json({
      success: true,
      data: {
        id: loc.id,
        name: loc.name,
        status: loc.status,
        createdAt: loc.created_at,
        warehouse: {
          id: loc.warehouse_id,
          name: loc.warehouse_name,
          status: loc.warehouse_status,
          address: loc.warehouse_address || "",
        },
        productCount: inventory.length,
        totalUnits,
        inventory,
      },
    });
  } catch (error) {
    console.error("Get location details error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load location details.",
    });
  }
};

// GET /api/warehouses/:warehouseId/locations
export const getWarehouseLocations = async (req, res) => {
  try {
    const { warehouseId } = req.params;
    const { status } = req.query;

    let sql = `
      SELECT 
        l.id,
        l.name,
        l.warehouse_id,
        COALESCE(l.status, 'ACTIVE') AS status,
        l.created_at,
        w.name AS warehouse_name,
        COUNT(DISTINCT s.product_id) FILTER (WHERE s.quantity > 0) AS product_count,
        COALESCE(SUM(s.quantity), 0) AS total_units
      FROM locations l
      JOIN warehouses w ON l.warehouse_id = w.id
      LEFT JOIN stock s ON l.id = s.location_id
      WHERE l.warehouse_id = $1
    `;
    const params = [warehouseId];

    if (status && status !== "All" && status !== "ALL") {
      sql += ` AND l.status = $2`;
      params.push(status.toUpperCase());
    }

    sql += ` GROUP BY l.id, l.name, l.warehouse_id, l.status, l.created_at, w.name ORDER BY l.name ASC`;

    const result = await pool.query(sql, params);

    const formatted = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      warehouseId: row.warehouse_id,
      warehouseName: row.warehouse_name,
      status: row.status,
      productCount: parseInt(row.product_count || 0),
      totalUnits: parseFloat(row.total_units || 0),
      createdAt: row.created_at,
    }));

    return res.status(200).json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("Get warehouse locations error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load locations for warehouse.",
    });
  }
};

export default { getLocations, getLocationById, getWarehouseLocations };
