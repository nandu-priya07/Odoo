import express from "express";
import { getWarehouses, getWarehouseById } from "../pages/warehouses/warehouse.js";
import { createWarehouse, updateWarehouse } from "../pages/warehouses/createWarehouse.js";
import { getLocations, createLocation, getStockByLocation } from "../pages/warehouses/location.js";

const router = express.Router();

router.get("/", getWarehouses);
router.get("/locations", getLocations);
router.get("/locations/:locationId/stock", getStockByLocation);
router.get("/:id", getWarehouseById);
router.post("/", createWarehouse);
router.put("/:id", updateWarehouse);
router.post("/locations", createLocation);

export default router;
