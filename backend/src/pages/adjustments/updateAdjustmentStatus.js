import { pool } from "../../config/database.js";

// PATCH /api/adjustments/:id/status
export const updateAdjustmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: targetStatus } = req.body;

    if (!targetStatus) {
      return res.status(400).json({ success: false, message: "Target status is required." });
    }

    const checkRes = await pool.query(
      "SELECT id, status, adjustment_number FROM stock_adjustments WHERE id = $1",
      [id]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Adjustment not found." });
    }

    const currentStatus = checkRes.rows[0].status;

    // Workflow validation:
    // DRAFT -> WAITING
    // WAITING -> READY
    const validTransitions = {
      DRAFT: ["WAITING"],
      WAITING: ["READY"],
      READY: [], // Must use validate endpoint
      DONE: [], // Terminal
      CANCELED: [], // Terminal
    };

    if (currentStatus === "DONE") {
      return res.status(400).json({
        success: false,
        message: "Adjustment has already been completed.",
      });
    }

    if (currentStatus === "CANCELED") {
      return res.status(400).json({
        success: false,
        message: "Adjustment has been canceled and cannot be modified.",
      });
    }

    if (!validTransitions[currentStatus]?.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${targetStatus}.`,
      });
    }

    const updateRes = await pool.query(
      `UPDATE stock_adjustments 
       SET status = $1 
       WHERE id = $2 
       RETURNING *`,
      [targetStatus, id]
    );

    return res.status(200).json({
      success: true,
      message: `Adjustment ${checkRes.rows[0].adjustment_number} status updated to ${targetStatus}.`,
      data: updateRes.rows[0],
    });
  } catch (error) {
    console.error("Update adjustment status error:", error);
    return res.status(500).json({ success: false, message: "Failed to update adjustment status" });
  }
};

// POST /api/adjustments/:id/cancel
export const cancelAdjustment = async (req, res) => {
  try {
    const { id } = req.params;

    const checkRes = await pool.query(
      "SELECT id, status, adjustment_number FROM stock_adjustments WHERE id = $1",
      [id]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Adjustment not found." });
    }

    const currentStatus = checkRes.rows[0].status;

    if (currentStatus === "DONE") {
      return res.status(400).json({
        success: false,
        message: "Adjustment has already been completed and cannot be canceled.",
      });
    }

    if (currentStatus === "CANCELED") {
      return res.status(400).json({
        success: false,
        message: "Adjustment is already canceled.",
      });
    }

    const updateRes = await pool.query(
      `UPDATE stock_adjustments 
       SET status = 'CANCELED' 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: `Adjustment ${checkRes.rows[0].adjustment_number} has been canceled.`,
      data: updateRes.rows[0],
    });
  } catch (error) {
    console.error("Cancel adjustment error:", error);
    return res.status(500).json({ success: false, message: "Failed to cancel adjustment" });
  }
};

export default {
  updateAdjustmentStatus,
  cancelAdjustment,
};
