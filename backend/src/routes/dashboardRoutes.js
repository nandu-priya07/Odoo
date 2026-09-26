import express from "express";
import getDashboard from "../pages/dashboard/dashboard.js";

const router = express.Router();

// GET /api/dashboard
router.get("/", getDashboard);

export default router;
