import express from "express";
import { getTransfers, getTransferById } from "../pages/transfers/transfer.js";
import { createTransfer } from "../pages/transfers/createTransfer.js";
import { validateTransfer } from "../pages/transfers/validateTransfer.js";

const router = express.Router();

router.get("/", getTransfers);
router.get("/:id", getTransferById);
router.post("/", createTransfer);
router.put("/:id/validate", validateTransfer);

export default router;
