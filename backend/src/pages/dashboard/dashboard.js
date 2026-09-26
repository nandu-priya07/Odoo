import { pool } from "../../config/database.js";

const getDashboard = async (req, res) => {
  try {
    // 1. Total products count
    const totalProductsRes = await pool.query("SELECT COUNT(*) FROM products");
    const totalProducts = parseInt(totalProductsRes.rows[0]?.count || 0);

    // 2. Stock items summary
    const stockItemsRes = await pool.query(`
      SELECT 
        s.id,
        s.quantity,
        s.product_id,
        p.name AS product_name,
        p.sku,
        l.name AS location_name
      FROM stock s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN locations l ON s.location_id = l.id
    `);

    const stockItems = stockItemsRes.rows;
    const lowStockItems = stockItems.filter(
      (item) => Number(item.quantity) > 0 && Number(item.quantity) <= 10
    );
    const outOfStockItems = stockItems.filter(
      (item) => Number(item.quantity) <= 0
    );

    // 3. Pending receipts count
    const pendingReceiptsRes = await pool.query(`
      SELECT COUNT(*) FROM receipts 
      WHERE status IN ('DRAFT', 'WAITING', 'READY')
    `);
    const pendingReceipts = parseInt(pendingReceiptsRes.rows[0]?.count || 0);

    // 4. Pending deliveries count
    const pendingDeliveriesRes = await pool.query(`
      SELECT COUNT(*) FROM deliveries 
      WHERE status IN ('DRAFT', 'WAITING', 'READY')
    `);
    const pendingDeliveries = parseInt(pendingDeliveriesRes.rows[0]?.count || 0);

    // 5. Internal transfers count
    const pendingTransfersRes = await pool.query(`
      SELECT COUNT(*) FROM internal_transfers 
      WHERE status IN ('DRAFT', 'WAITING', 'READY')
    `);
    const pendingTransfers = parseInt(pendingTransfersRes.rows[0]?.count || 0);

    // 6. Warehouses & Categories list for dynamic dropdowns
    const warehousesRes = await pool.query("SELECT id, name FROM warehouses ORDER BY name ASC");
    const categoriesRes = await pool.query("SELECT id, name FROM categories ORDER BY name ASC");

    // 7. Recent activity (from stock_ledger)
    const recentActivityRes = await pool.query(`
      SELECT 
        sl.id,
        sl.transaction_type AS type,
        sl.quantity_change AS quantity,
        sl.created_at AS date,
        p.name AS item,
        l.name AS location
      FROM stock_ledger sl
      LEFT JOIN products p ON sl.product_id = p.id
      LEFT JOIN locations l ON sl.location_id = l.id
      ORDER BY sl.created_at DESC
      LIMIT 10
    `);

    // 8. Low stock alerts
    const stockAlerts = stockItems
      .filter((item) => Number(item.quantity) <= 10)
      .map((item) => ({
        product: item.product_name,
        status: Number(item.quantity) <= 0 ? "Out of Stock" : "Low Stock",
        quantity: `${Number(item.quantity)} units remaining`,
      }));

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProducts,
          lowStock: lowStockItems.length,
          outOfStock: outOfStockItems.length,
          lowOrOutOfStock: lowStockItems.length + outOfStockItems.length,
          pendingReceipts,
          pendingDeliveries,
          internalTransfers: pendingTransfers,
        },
        warehouses: warehousesRes.rows,
        categories: categoriesRes.rows,
        stockAlerts,
        recentActivity: recentActivityRes.rows,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
    });
  }
};

export default getDashboard;