import express from "express";
import { getReorderRules, upsertReorderRule, deleteReorderRule } from "../pages/reorderRules/reorderRule.js";

const router = express.Router();

router.get("/", getReorderRules);
router.post("/", upsertReorderRule);
router.delete("/:id", deleteReorderRule);

export default router;
