import express from "express";
import { getLedger, getLedgerDetails } from "../pages/stockLedger/stockLedger.js";

const router = express.Router();

// READ-ONLY: Ledger entries cannot be created, edited, or deleted manually
router.get("/", getLedger);
router.get("/:id", getLedgerDetails);

export default router;
