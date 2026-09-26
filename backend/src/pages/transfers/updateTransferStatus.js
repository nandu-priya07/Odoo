import { pool } from "../../config/database.js";

// PATCH /api/transfers/:id/status
export const updateTransferStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status: targetStatus } = req.body;

    if (!targetStatus) {
      return res.status(400).json({ success: false, message: "Target status is required." });
    }

    const checkRes = await pool.query(
      "SELECT id, status, transfer_number FROM internal_transfers WHERE id = $1",
      [id]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Transfer not found." });
    }

    const currentStatus = checkRes.rows[0].status;

    // Check validity of transitions:
    // DRAFT -> WAITING
    // WAITING -> READY
    const validTransitions = {
      DRAFT: ["WAITING"],
      WAITING: ["READY"],
      READY: [], // Must use validate endpoint
      DONE: [], // Terminal
      CANCELED: [], // Terminal
    };

    if (currentStatus === "DONE" || currentStatus === "CANCELED") {
      return res.status(400).json({
        success: false,
        message: `Cannot change status of a ${currentStatus} transfer.`,
      });
    }

    if (!validTransitions[currentStatus]?.includes(targetStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${currentStatus} to ${targetStatus}.`,
      });
    }

    const updateRes = await pool.query(
      `UPDATE internal_transfers 
       SET status = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [targetStatus, id]
    );

    return res.status(200).json({
      success: true,
      message: `Transfer ${checkRes.rows[0].transfer_number} status updated to ${targetStatus}.`,
      data: updateRes.rows[0],
    });
  } catch (error) {
    console.error("Update transfer status error:", error);
    return res.status(500).json({ success: false, message: "Failed to update transfer status" });
  }
};

// POST /api/transfers/:id/cancel
export const cancelTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    const checkRes = await pool.query(
      "SELECT id, status, transfer_number FROM internal_transfers WHERE id = $1",
      [id]
    );

    if (checkRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Transfer not found." });
    }

    const currentStatus = checkRes.rows[0].status;

    if (currentStatus === "DONE") {
      return res.status(400).json({
        success: false,
        message: "Completed transfers cannot be canceled.",
      });
    }

    if (currentStatus === "CANCELED") {
      return res.status(400).json({
        success: false,
        message: "Transfer is already canceled.",
      });
    }

    const updateRes = await pool.query(
      `UPDATE internal_transfers 
       SET status = 'CANCELED', updated_at = CURRENT_TIMESTAMP 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    return res.status(200).json({
      success: true,
      message: `Transfer ${checkRes.rows[0].transfer_number} has been canceled.`,
      data: updateRes.rows[0],
    });
  } catch (error) {
    console.error("Cancel transfer error:", error);
    return res.status(500).json({ success: false, message: "Failed to cancel transfer" });
  }
};

export default {
  updateTransferStatus,
  cancelTransfer,
};
