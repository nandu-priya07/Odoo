import express from "express";
import { createDelivery } from "../pages/deliveries/createDelivery.js";

const router = express.Router();

// POST /api/deliveries
router.post("/", createDelivery);

export default router;
