import express from "express";
import { getTransfers, getLocationStock } from "../pages/transfers/transfer.js";
import { createTransfer } from "../pages/transfers/createTransfer.js";
import { getTransfer } from "../pages/transfers/getTransfer.js";
import { updateTransferStatus, cancelTransfer } from "../pages/transfers/updateTransferStatus.js";
import { validateTransfer } from "../pages/transfers/validateTransfer.js";

const router = express.Router();

router.get("/stock", getLocationStock);
router.get("/:id", getTransfer);
router.get("/", getTransfers);
router.post("/", createTransfer);
router.patch("/:id/status", updateTransferStatus);
router.post("/:id/validate", validateTransfer);
router.post("/:id/cancel", cancelTransfer);

export default router;
