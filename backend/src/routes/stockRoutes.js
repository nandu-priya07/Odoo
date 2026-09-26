import express from "express";
import { getStockOverview, getStockLedger } from "../pages/stock/stock.js";

const router = express.Router();

router.get("/overview", getStockOverview);
router.get("/ledger", getStockLedger);
router.get("/history", getStockLedger);

export default router;
