import express from "express";
import getDashboard, { createOperation } from "../pages/dashboard/dashboard.js";

const router = express.Router();

// GET /api/dashboard
router.get("/", getDashboard);

// POST /api/dashboard/create
router.post("/create", createOperation);

export default router;
