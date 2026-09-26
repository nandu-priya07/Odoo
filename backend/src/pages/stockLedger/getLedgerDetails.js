import { pool } from "../../config/database.js";

// GET /api/stock-ledger/:id
export const getLedgerDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
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
        u.email AS created_by_email,
        COALESCE(
          rec.receipt_number,
          del.delivery_number,
          trf.transfer_number,
          adj.adjustment_number,
          CASE 
            WHEN sl.reference_id IS NOT NULL THEN 'REF-' || SUBSTRING(sl.reference_id::text FROM 1 FOR 8)
            ELSE 'INITIAL-STOCK'
          END
        ) AS reference_number,
        rec.status AS receipt_status,
        del.status AS delivery_status,
        trf.status AS transfer_status,
        adj.status AS adjustment_status
      FROM stock_ledger sl
      JOIN products p ON sl.product_id = p.id
      JOIN locations l ON sl.location_id = l.id
      JOIN warehouses w ON l.warehouse_id = w.id
      LEFT JOIN users u ON sl.created_by = u.id
      LEFT JOIN receipts rec ON sl.reference_id = rec.id AND sl.transaction_type = 'RECEIPT'
      LEFT JOIN deliveries del ON sl.reference_id = del.id AND sl.transaction_type = 'DELIVERY'
      LEFT JOIN internal_transfers trf ON sl.reference_id = trf.id AND sl.transaction_type IN ('TRANSFER_OUT', 'TRANSFER_IN')
      LEFT JOIN stock_adjustments adj ON sl.reference_id = adj.id AND sl.transaction_type = 'ADJUSTMENT'
      WHERE sl.id = $1
    `;

    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Ledger movement not found.",
      });
    }

    const row = result.rows[0];

    // Determine related operation type & info
    let relatedOpType = "OTHER";
    let relatedOpStatus = null;
    if (row.transaction_type === "RECEIPT") {
      relatedOpType = "RECEIPT";
      relatedOpStatus = row.receipt_status;
    } else if (row.transaction_type === "DELIVERY") {
      relatedOpType = "DELIVERY";
      relatedOpStatus = row.delivery_status;
    } else if (["TRANSFER_OUT", "TRANSFER_IN"].includes(row.transaction_type)) {
      relatedOpType = "TRANSFER";
      relatedOpStatus = row.transfer_status;
    } else if (row.transaction_type === "ADJUSTMENT") {
      relatedOpType = "ADJUSTMENT";
      relatedOpStatus = row.adjustment_status;
    }

    const response = {
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
      createdByEmail: row.created_by_email,
      createdAt: row.created_at,
      relatedOperation: {
        type: relatedOpType,
        id: row.reference_id,
        referenceNumber: row.reference_number,
        status: relatedOpStatus || "DONE",
      },
    };

    return res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Get ledger details error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load ledger details.",
    });
  }
};

export default getLedgerDetails;
