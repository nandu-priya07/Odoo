import express from "express";
import login from "../pages/auth/login.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", login);

export default router;
