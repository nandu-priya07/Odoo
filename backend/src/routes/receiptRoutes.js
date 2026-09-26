import express from "express";
import { getReceipts, getReceiptById } from "../pages/receipts/receipt.js";
import { createReceipt } from "../pages/receipts/createReceipt.js";
import { validateReceipt } from "../pages/receipts/validateReceipt.js";

const router = express.Router();

router.get("/", getReceipts);
router.get("/:id", getReceiptById);
router.post("/", createReceipt);
router.put("/:id/validate", validateReceipt);

export default router;
