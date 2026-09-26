import express from "express";
import { getAdjustments, getAdjustmentById } from "../pages/adjustments/adjustment.js";
import { createAdjustment } from "../pages/adjustments/createAdjustment.js";
import { validateAdjustment } from "../pages/adjustments/validateAdjustment.js";

const router = express.Router();

router.get("/", getAdjustments);
router.get("/:id", getAdjustmentById);
router.post("/", createAdjustment);
router.put("/:id/validate", validateAdjustment);

export default router;
