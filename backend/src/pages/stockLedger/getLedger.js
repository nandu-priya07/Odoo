import { pool } from "../../config/database.js";

// GET /api/stock-ledger
export const getLedger = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      transactionType,
      warehouseId,
      locationId,
      productId,
      fromDate,
      toDate,
      referenceNumber,
      direction,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, parseInt(limit) || 20);
    const offset = (pageNum - 1) * limitNum;

    // Base query with joins to products, locations, warehouses, users, and operation tables for reference numbers
    let baseWhere = "WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    // Search filter (Product name, SKU, or Reference number)
    if (search && search.trim()) {
      const searchPattern = `%${search.trim()}%`;
      baseWhere += ` AND (
        p.name ILIKE $${paramIndex} OR 
        p.sku ILIKE $${paramIndex} OR 
        rec.receipt_number ILIKE $${paramIndex} OR 
        del.delivery_number ILIKE $${paramIndex} OR 
        trf.transfer_number ILIKE $${paramIndex} OR 
        adj.adjustment_number ILIKE $${paramIndex}
      )`;
      params.push(searchPattern);
      paramIndex++;
    }

    // Specific reference number search
    if (referenceNumber && referenceNumber.trim()) {
      const refPattern = `%${referenceNumber.trim()}%`;
      baseWhere += ` AND (
        rec.receipt_number ILIKE $${paramIndex} OR 
        del.delivery_number ILIKE $${paramIndex} OR 
        trf.transfer_number ILIKE $${paramIndex} OR 
        adj.adjustment_number ILIKE $${paramIndex}
      )`;
      params.push(refPattern);
      paramIndex++;
    }

    // Transaction Type filter
    if (transactionType && transactionType !== "All") {
      baseWhere += ` AND sl.transaction_type = $${paramIndex}`;
      params.push(transactionType.toUpperCase());
      paramIndex++;
    }

    // Warehouse filter
    if (warehouseId && warehouseId !== "All") {
      baseWhere += ` AND (w.id::text = $${paramIndex} OR w.name = $${paramIndex})`;
      params.push(warehouseId);
      paramIndex++;
    }

    // Location filter
    if (locationId && locationId !== "All") {
      baseWhere += ` AND (l.id::text = $${paramIndex} OR l.name = $${paramIndex})`;
      params.push(locationId);
      paramIndex++;
    }

    // Product filter
    if (productId && productId !== "All") {
      baseWhere += ` AND (p.id::text = $${paramIndex} OR p.name = $${paramIndex})`;
      params.push(productId);
      paramIndex++;
    }

    // Quantity direction (in / out)
    if (direction) {
      const dirLower = direction.toLowerCase();
      if (dirLower === "in") {
        baseWhere += ` AND sl.quantity_change > 0`;
      } else if (dirLower === "out") {
        baseWhere += ` AND sl.quantity_change < 0`;
      }
    }

    // Date range filters
    if (fromDate) {
      baseWhere += ` AND sl.created_at >= $${paramIndex}::timestamp`;
      params.push(`${fromDate} 00:00:00`);
      paramIndex++;
    }
    if (toDate) {
      baseWhere += ` AND sl.created_at <= $${paramIndex}::timestamp`;
      params.push(`${toDate} 23:59:59`);
      paramIndex++;
    }

    const joinClause = `
      FROM stock_ledger sl
      JOIN products p ON sl.product_id = p.id
      JOIN locations l ON sl.location_id = l.id
      JOIN warehouses w ON l.warehouse_id = w.id
      LEFT JOIN users u ON sl.created_by = u.id
      LEFT JOIN receipts rec ON sl.reference_id = rec.id AND sl.transaction_type = 'RECEIPT'
      LEFT JOIN deliveries del ON sl.reference_id = del.id AND sl.transaction_type = 'DELIVERY'
      LEFT JOIN internal_transfers trf ON sl.reference_id = trf.id AND sl.transaction_type IN ('TRANSFER_OUT', 'TRANSFER_IN')
      LEFT JOIN stock_adjustments adj ON sl.reference_id = adj.id AND sl.transaction_type = 'ADJUSTMENT'
    `;

    // 1. Total count
    const countSql = `SELECT COUNT(sl.id) ${joinClause} ${baseWhere}`;
    const countRes = await pool.query(countSql, params);
    const totalRecords = parseInt(countRes.rows[0]?.count || 0);

    // 2. Summary counts for header stats
    const summarySql = `
      SELECT 
        COUNT(sl.id) AS total_movements,
        COUNT(CASE WHEN sl.quantity_change > 0 THEN 1 END) AS stock_in_count,
        COUNT(CASE WHEN sl.quantity_change < 0 THEN 1 END) AS stock_out_count,
        COUNT(CASE WHEN sl.transaction_type = 'ADJUSTMENT' THEN 1 END) AS adjustments_count
      ${joinClause}
      ${baseWhere}
    `;
    const summaryRes = await pool.query(summarySql, params);
    const summary = summaryRes.rows[0] || {
      total_movements: 0,
      stock_in_count: 0,
      stock_out_count: 0,
      adjustments_count: 0,
    };

    // 3. Paginated list
    const orderColumn = ["quantity_change", "quantity_after"].includes(sortBy)
      ? `sl.${sortBy}`
      : "sl.created_at";
    const orderDirection = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const listSql = `
      SELECT 
        sl.id,
        sl.transaction_type,
        sl.reference_id,
        sl.quantity_change,
        sl.quantity_after,
        sl.created_at,
        p.id AS product_id,
        p.name AS product_name,
        p.sku,
        p.unit_of_measure,
        w.id AS warehouse_id,
        w.name AS warehouse_name,
        l.id AS location_id,
        l.name AS location_name,
        COALESCE(u.name, 'System') AS created_by_name,
        COALESCE(
          rec.receipt_number,
          del.delivery_number,
          trf.transfer_number,
          adj.adjustment_number,
          CASE 
            WHEN sl.reference_id IS NOT NULL THEN 'REF-' || SUBSTRING(sl.reference_id::text FROM 1 FOR 8)
            ELSE 'INITIAL-STOCK'
          END
        ) AS reference_number
      ${joinClause}
      ${baseWhere}
      ORDER BY ${orderColumn} ${orderDirection}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;
    params.push(limitNum, offset);

    const listRes = await pool.query(listSql, params);

    // Format data as specified in API response schema
    const formattedData = listRes.rows.map((row) => ({
      id: row.id,
      transactionType: row.transaction_type,
      referenceId: row.reference_id,
      referenceNumber: row.reference_number,
      product: {
        id: row.product_id,
        name: row.product_name,
        sku: row.sku,
        unitOfMeasure: row.unit_of_measure,
      },
      warehouse: {
        id: row.warehouse_id,
        name: row.warehouse_name,
      },
      location: {
        id: row.location_id,
        name: row.location_name,
      },
      quantityChange: parseFloat(row.quantity_change),
      quantityAfter: parseFloat(row.quantity_after),
      createdBy: row.created_by_name,
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
      summary: {
        totalMovements: parseInt(summary.total_movements || 0),
        stockInCount: parseInt(summary.stock_in_count || 0),
        stockOutCount: parseInt(summary.stock_out_count || 0),
        adjustmentsCount: parseInt(summary.adjustments_count || 0),
      },
    });
  } catch (error) {
    console.error("Get stock ledger error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load inventory movements.",
    });
  }
};

export default getLedger;
