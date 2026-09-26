import { pool } from "../../config/database.js";

// DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists
    const prodRes = await pool.query("SELECT id, name FROM products WHERE id = $1", [id]);
    if (prodRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const productName = prodRes.rows[0].name;

    // Check inventory dependencies:
    // 1. Current stock > 0
    const stockRes = await pool.query("SELECT COALESCE(SUM(quantity), 0) AS total FROM stock WHERE product_id = $1", [id]);
    const totalStock = parseFloat(stockRes.rows[0]?.total || 0);
    if (totalStock > 0) {
      return res.status(400).json({
        success: false,
        message: "This product cannot be deleted because it has inventory history.",
        detail: "Current stock quantity is greater than 0.",
      });
    }

    // 2. Receipts
    const receiptsRes = await pool.query("SELECT COUNT(*) FROM receipt_items WHERE product_id = $1", [id]);
    if (parseInt(receiptsRes.rows[0]?.count || 0) > 0) {
      return res.status(400).json({
        success: false,
        message: "This product cannot be deleted because it has inventory history.",
        detail: "Product has associated incoming receipt history.",
      });
    }

    // 3. Deliveries
    const deliveriesRes = await pool.query("SELECT COUNT(*) FROM delivery_items WHERE product_id = $1", [id]);
    if (parseInt(deliveriesRes.rows[0]?.count || 0) > 0) {
      return res.status(400).json({
        success: false,
        message: "This product cannot be deleted because it has inventory history.",
        detail: "Product has associated outgoing delivery history.",
      });
    }

    // 4. Transfers
    const transfersRes = await pool.query("SELECT COUNT(*) FROM transfer_items WHERE product_id = $1", [id]);
    if (parseInt(transfersRes.rows[0]?.count || 0) > 0) {
      return res.status(400).json({
        success: false,
        message: "This product cannot be deleted because it has inventory history.",
        detail: "Product has associated internal transfer history.",
      });
    }

    // 5. Adjustments
    const adjustmentsRes = await pool.query("SELECT COUNT(*) FROM stock_adjustment_items WHERE product_id = $1", [id]);
    if (parseInt(adjustmentsRes.rows[0]?.count || 0) > 0) {
      return res.status(400).json({
        success: false,
        message: "This product cannot be deleted because it has inventory history.",
        detail: "Product has associated stock adjustment records.",
      });
    }

    // 6. Stock Ledger history
    const ledgerRes = await pool.query("SELECT COUNT(*) FROM stock_ledger WHERE product_id = $1", [id]);
    if (parseInt(ledgerRes.rows[0]?.count || 0) > 0) {
      return res.status(400).json({
        success: false,
        message: "This product cannot be deleted because it has inventory history.",
        detail: "Product has associated move ledger audit history.",
      });
    }

    // 7. Clean up reorder_rules or zero-stock records if they exist without historical records
    await pool.query("DELETE FROM reorder_rules WHERE product_id = $1", [id]);
    await pool.query("DELETE FROM stock WHERE product_id = $1", [id]);

    // Finally delete product
    await pool.query("DELETE FROM products WHERE id = $1", [id]);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
      productName,
    });
  } catch (error) {
    console.error("Delete product error:", error);
    return res.status(500).json({
      success: false,
      message: "Cannot delete product due to database constraints.",
    });
  }
};

export default deleteProduct;
