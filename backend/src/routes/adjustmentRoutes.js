import express from "express";
import { getAdjustments, getLocationStock } from "../pages/adjustments/adjustment.js";
import { createAdjustment } from "../pages/adjustments/createAdjustment.js";
import { getAdjustment } from "../pages/adjustments/getAdjustment.js";
import { updateAdjustmentStatus, cancelAdjustment } from "../pages/adjustments/updateAdjustmentStatus.js";
import { validateAdjustment } from "../pages/adjustments/validateAdjustment.js";

const router = express.Router();

router.get("/stock", getLocationStock);
router.get("/:id", getAdjustment);
router.get("/", getAdjustments);
router.post("/", createAdjustment);
router.patch("/:id/status", updateAdjustmentStatus);
router.post("/:id/validate", validateAdjustment);
router.post("/:id/cancel", cancelAdjustment);

export default router;
