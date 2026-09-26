import express from "express";
import login from "../pages/auth/login.js";
import signup from "../pages/auth/signup.js";

const router = express.Router();

// POST /api/auth/login
router.post("/login", login);

// POST /api/auth/signup
router.post("/signup", signup);

export default router;

