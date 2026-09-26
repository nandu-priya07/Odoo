import { pool } from "../../config/database.js";

export const getDashboard = async (req, res) => {
  try {
    // 1. Total products count
    const totalProductsRes = await pool.query("SELECT COUNT(*) FROM products");
    const totalProducts = parseInt(totalProductsRes.rows[0]?.count || 0);

    // 2. Total Stock Units
    const totalStockRes = await pool.query("SELECT COALESCE(SUM(quantity), 0) AS total_units FROM stock");
    const totalStockUnits = Number(totalStockRes.rows[0]?.total_units || 0);

    // 3. Stock items (Low stock <= 50, Out of stock <= 0)
    const stockItemsRes = await pool.query(`
      SELECT 
        s.id AS stock_id,
        s.quantity,
        s.product_id,
        s.location_id,
        l.warehouse_id,
        p.name AS product_name,
        p.sku,
        c.name AS category_name,
        l.name AS location_name,
        w.name AS warehouse_name
      FROM stock s
      JOIN products p ON s.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN locations l ON s.location_id = l.id
      LEFT JOIN warehouses w ON l.warehouse_id = w.id
      ORDER BY s.quantity ASC
    `);

    const stockItems = stockItemsRes.rows;
    const lowStockItems = stockItems.filter(
      (item) => Number(item.quantity) > 0 && Number(item.quantity) <= 50
    );
    const outOfStockItems = stockItems.filter(
      (item) => Number(item.quantity) <= 0
    );

    // 4. Pending operation counts
    const pendingReceiptsRes = await pool.query("SELECT COUNT(*) FROM receipts WHERE status IN ('DRAFT', 'WAITING', 'READY')");
    const pendingReceipts = parseInt(pendingReceiptsRes.rows[0]?.count || 0);

    const pendingDeliveriesRes = await pool.query("SELECT COUNT(*) FROM deliveries WHERE status IN ('DRAFT', 'WAITING', 'READY')");
    const pendingDeliveries = parseInt(pendingDeliveriesRes.rows[0]?.count || 0);

    const pendingTransfersRes = await pool.query("SELECT COUNT(*) FROM internal_transfers WHERE status IN ('DRAFT', 'WAITING', 'READY')");
    const pendingTransfers = parseInt(pendingTransfersRes.rows[0]?.count || 0);

    const warehousesRes = await pool.query("SELECT id, name FROM warehouses ORDER BY name ASC");
    const categoriesRes = await pool.query("SELECT id, name FROM categories ORDER BY name ASC");
    const suppliersRes = await pool.query("SELECT id, name FROM suppliers ORDER BY name ASC");
    const locationsRes = await pool.query("SELECT id, name, warehouse_id FROM locations ORDER BY name ASC");

    // 5. Detail Lists for Modal Cards
    const productsListRes = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.unit_of_measure,
        p.initial_stock,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.name ASC
    `);

    const receiptsListRes = await pool.query(`
      SELECT 
        r.id,
        r.receipt_number,
        r.status,
        r.recipient_address,
        COALESCE(r.net_qty, 0) AS net_qty,
        COALESCE(r.receipt_date, r.created_at) AS receipt_date,
        r.created_at,
        sup.name AS supplier_name,
        w.name AS warehouse_name
      FROM receipts r
      LEFT JOIN suppliers sup ON r.supplier_id = sup.id
      LEFT JOIN warehouses w ON r.warehouse_id = w.id
      ORDER BY r.created_at DESC
    `);

    const deliveriesListRes = await pool.query(`
      SELECT 
        d.id,
        d.delivery_number,
        d.customer_name,
        d.status,
        d.created_at,
        w.name AS warehouse_name
      FROM deliveries d
      LEFT JOIN warehouses w ON d.warehouse_id = w.id
      ORDER BY d.created_at DESC
    `);

    const transfersListRes = await pool.query(`
      SELECT 
        t.id,
        t.transfer_number,
        t.status,
        t.created_at,
        fl.name AS from_location,
        tl.name AS to_location
      FROM internal_transfers t
      LEFT JOIN locations fl ON t.from_location_id = fl.id
      LEFT JOIN locations tl ON t.to_location_id = tl.id
      ORDER BY t.created_at DESC
    `);

    // 6. Operations List
    const operationsRes = await pool.query(`
      (
        SELECT 
          r.id,
          'Receipt' AS document_type,
          r.receipt_number AS reference_no,
          r.status,
          w.name AS warehouse_name,
          r.created_at
        FROM receipts r
        LEFT JOIN warehouses w ON r.warehouse_id = w.id
      )
      UNION ALL
      (
        SELECT 
          d.id,
          'Delivery' AS document_type,
          d.delivery_number AS reference_no,
          d.status,
          w.name AS warehouse_name,
          d.created_at
        FROM deliveries d
        LEFT JOIN warehouses w ON d.warehouse_id = w.id
      )
      UNION ALL
      (
        SELECT 
          t.id,
          'Internal Transfer' AS document_type,
          t.transfer_number AS reference_no,
          t.status,
          'Location Transfer' AS warehouse_name,
          t.created_at
        FROM internal_transfers t
      )
      UNION ALL
      (
        SELECT 
          sa.id,
          'Adjustment' AS document_type,
          sa.adjustment_number AS reference_no,
          sa.status,
          'Stock Adjustment' AS warehouse_name,
          sa.created_at
        FROM stock_adjustments sa
      )
      ORDER BY created_at DESC
      LIMIT 100
    `);

    // 7. Top Products by Stock
    const topProductsRes = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.sku,
        p.unit_of_measure,
        c.name AS category_name,
        COALESCE(SUM(s.quantity), 0) AS total_quantity
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN stock s ON p.id = s.product_id
      GROUP BY p.id, p.name, p.sku, p.unit_of_measure, c.name
      ORDER BY total_quantity DESC
      LIMIT 10
    `);

    // 8. Recent activity
    const recentActivityRes = await pool.query(`
      SELECT 
        sl.id,
        sl.transaction_type AS type,
        sl.quantity_change AS quantity,
        sl.created_at AS date,
        p.name AS item,
        p.sku,
        l.name AS location
      FROM stock_ledger sl
      LEFT JOIN products p ON sl.product_id = p.id
      LEFT JOIN locations l ON sl.location_id = l.id
      ORDER BY sl.created_at DESC
      LIMIT 15
    `);

    // 9. Stock alerts
    const stockAlerts = stockItems
      .filter((item) => Number(item.quantity) <= 50)
      .map((item) => ({
        id: item.stock_id,
        product: item.product_name,
        sku: item.sku,
        category: item.category_name || "General",
        location: item.location_name || item.warehouse_name || "Main Area",
        status: Number(item.quantity) <= 0 ? "Out of Stock" : "Low Stock",
        quantity: Number(item.quantity),
      }));

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalProducts,
          totalStockUnits,
          lowStock: lowStockItems.length,
          outOfStock: outOfStockItems.length,
          lowOrOutOfStock: lowStockItems.length + outOfStockItems.length,
          pendingReceipts,
          pendingDeliveries,
          internalTransfers: pendingTransfers,
          totalWarehouses: warehousesRes.rows.length,
          totalCategories: categoriesRes.rows.length,
        },
        warehouses: warehousesRes.rows,
        categories: categoriesRes.rows,
        suppliers: suppliersRes.rows,
        locations: locationsRes.rows,
        productsList: productsListRes.rows,
        stockList: stockItems,
        receiptsList: receiptsListRes.rows,
        deliveriesList: deliveriesListRes.rows,
        transfersList: transfersListRes.rows,
        operations: operationsRes.rows,
        topProducts: topProductsRes.rows,
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

export const createOperation = async (req, res) => {
  try {
    const {
      type,
      referenceNo,
      supplierId,
      customerName,
      warehouseId,
      fromLocationId,
      toLocationId,
      status = "DRAFT",
      productId,
      quantity = 1,
      items,
      netQty,
      receiptDate,
      recipientAddress,
    } = req.body;

    if (!type) {
      return res.status(400).json({ success: false, message: "Operation type is required" });
    }

    const qtyNum = Number(quantity) || 1;

    if (type === "receipt") {
      let whId = warehouseId || null;
      if (!whId) {
        const defaultWh = await pool.query("SELECT id FROM warehouses ORDER BY created_at ASC LIMIT 1");
        whId = defaultWh.rows[0]?.id || null;
      }

      const recNo = (referenceNo && referenceNo.trim()) ? referenceNo.trim() : `REC-${Math.floor(10000 + Math.random() * 90000)}`;

      // Build items array from items param or fallback single productId
      let itemsList = Array.isArray(items) && items.length > 0 ? items : [];
      if (itemsList.length === 0 && productId) {
        itemsList.push({ productId, quantity: qtyNum });
      }

      const computedNetQty = itemsList.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
      const finalNetQty = netQty !== undefined && netQty !== null && netQty !== "" ? Number(netQty) : computedNetQty;
      const finalReceiptDate = receiptDate ? new Date(receiptDate) : new Date();

      const result = await pool.query(
        `INSERT INTO receipts (receipt_number, supplier_id, warehouse_id, status, recipient_address, net_qty, receipt_date)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [recNo, supplierId || null, whId, status, recipientAddress || null, finalNetQty, finalReceiptDate]
      );

      const locRes = await pool.query("SELECT id FROM locations WHERE warehouse_id = $1 LIMIT 1", [whId]);
      const locId = locRes.rows[0]?.id || null;

      for (const item of itemsList) {
        const pId = item.productId;
        const pQty = Number(item.quantity) || 1;
        if (!pId) continue;

        await pool.query(
          `INSERT INTO receipt_items (receipt_id, product_id, location_id, quantity)
           VALUES ($1, $2, $3, $4)`,
          [result.rows[0].id, pId, locId, pQty]
        );

        if ((status === "DONE" || status === "READY") && locId) {
          await pool.query(
            `INSERT INTO stock (product_id, location_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (product_id, location_id)
             DO UPDATE SET quantity = stock.quantity + $3, updated_at = CURRENT_TIMESTAMP`,
            [pId, locId, pQty]
          );

          const stockRes = await pool.query(
            `SELECT quantity FROM stock WHERE product_id = $1 AND location_id = $2`,
            [pId, locId]
          );
          const currentQty = stockRes.rows[0]?.quantity || pQty;

          await pool.query(
            `INSERT INTO stock_ledger (product_id, location_id, transaction_type, reference_id, quantity_change, quantity_after)
             VALUES ($1, $2, 'RECEIPT', $3, $4, $5)`,
            [pId, locId, result.rows[0].id, pQty, currentQty]
          );
        }
      }

      return res.status(201).json({
        success: true,
        message: "Receipt created successfully",
        data: result.rows[0],
      });
    }

    if (type === "delivery") {
      let whId = warehouseId || null;
      if (!whId) {
        const defaultWh = await pool.query("SELECT id FROM warehouses ORDER BY created_at ASC LIMIT 1");
        whId = defaultWh.rows[0]?.id || null;
      }

      const delNo = (referenceNo && referenceNo.trim()) ? referenceNo.trim() : `DEL-${Math.floor(10000 + Math.random() * 90000)}`;
      const result = await pool.query(
        `INSERT INTO deliveries (delivery_number, customer_name, warehouse_id, status)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [delNo, customerName || "General Customer", whId, status]
      );

      if (productId) {
        const locRes = await pool.query("SELECT id FROM locations WHERE warehouse_id = $1 LIMIT 1", [whId]);
        const locId = locRes.rows[0]?.id || null;

        await pool.query(
          `INSERT INTO delivery_items (delivery_id, product_id, location_id, quantity)
           VALUES ($1, $2, $3, $4)`,
          [result.rows[0].id, productId, locId, qtyNum]
        );

        if ((status === "DONE" || status === "READY") && locId) {
          const updStock = await pool.query(
            `INSERT INTO stock (product_id, location_id, quantity)
             VALUES ($1, $2, 0)
             ON CONFLICT (product_id, location_id)
             DO UPDATE SET quantity = GREATEST(0, stock.quantity - $3), updated_at = CURRENT_TIMESTAMP
             RETURNING quantity`,
            [productId, locId, qtyNum]
          );
          const qtyAfter = updStock.rows[0]?.quantity || 0;

          await pool.query(
            `INSERT INTO stock_ledger (product_id, location_id, transaction_type, reference_id, quantity_change, quantity_after)
             VALUES ($1, $2, 'DELIVERY', $3, -$4, $5)`,
            [productId, locId, result.rows[0].id, qtyNum, qtyAfter]
          );
        }
      }

      return res.status(201).json({
        success: true,
        message: "Delivery created successfully",
        data: result.rows[0],
      });
    }

    if (type === "transfer") {
      let fLoc = fromLocationId || null;
      let tLoc = toLocationId || null;

      if (!fLoc || !tLoc) {
        const locs = await pool.query("SELECT id FROM locations ORDER BY created_at ASC LIMIT 2");
        if (locs.rows.length >= 1 && !fLoc) fLoc = locs.rows[0].id;
        if (locs.rows.length >= 2 && !tLoc) tLoc = locs.rows[1].id;
        if (locs.rows.length === 1 && !tLoc) tLoc = locs.rows[0].id;
      }

      const trfNo = (referenceNo && referenceNo.trim()) ? referenceNo.trim() : `TRF-${Math.floor(10000 + Math.random() * 90000)}`;
      const result = await pool.query(
        `INSERT INTO internal_transfers (transfer_number, from_location_id, to_location_id, status)
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [trfNo, fLoc, tLoc, status]
      );

      if (productId) {
        await pool.query(
          `INSERT INTO transfer_items (transfer_id, product_id, quantity)
           VALUES ($1, $2, $3)`,
          [result.rows[0].id, productId, qtyNum]
        );

        if ((status === "DONE" || status === "READY") && fLoc && tLoc) {
          const srcStock = await pool.query(
            `INSERT INTO stock (product_id, location_id, quantity)
             VALUES ($1, $2, 0)
             ON CONFLICT (product_id, location_id)
             DO UPDATE SET quantity = GREATEST(0, stock.quantity - $3), updated_at = CURRENT_TIMESTAMP
             RETURNING quantity`,
            [productId, fLoc, qtyNum]
          );
          const srcQtyAfter = srcStock.rows[0]?.quantity || 0;

          const dstStock = await pool.query(
            `INSERT INTO stock (product_id, location_id, quantity)
             VALUES ($1, $2, $3)
             ON CONFLICT (product_id, location_id)
             DO UPDATE SET quantity = stock.quantity + $3, updated_at = CURRENT_TIMESTAMP
             RETURNING quantity`,
            [productId, tLoc, qtyNum]
          );
          const dstQtyAfter = dstStock.rows[0]?.quantity || qtyNum;

          // TRANSFER_OUT for source location
          await pool.query(
            `INSERT INTO stock_ledger (product_id, location_id, transaction_type, reference_id, quantity_change, quantity_after)
             VALUES ($1, $2, 'TRANSFER_OUT', $3, -$4, $5)`,
            [productId, fLoc, result.rows[0].id, qtyNum, srcQtyAfter]
          );

          // TRANSFER_IN for destination location
          await pool.query(
            `INSERT INTO stock_ledger (product_id, location_id, transaction_type, reference_id, quantity_change, quantity_after)
             VALUES ($1, $2, 'TRANSFER_IN', $3, $4, $5)`,
            [productId, tLoc, result.rows[0].id, qtyNum, dstQtyAfter]
          );
        }
      }

      return res.status(201).json({
        success: true,
        message: "Internal transfer created successfully",
        data: result.rows[0],
      });
    }

    return res.status(400).json({ success: false, message: "Invalid operation type" });
  } catch (error) {
    console.error("Create operation error:", error);
    return res.status(500).json({ success: false, message: error.message || "Failed to create operation" });
  }
};

export default getDashboard;