import express from "express";
import {
  getWarehouses,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deactivateWarehouse,
} from "../pages/warehouses/warehouse.js";
import {
  getLocations,
  getLocationById,
  getWarehouseLocations,
} from "../pages/locations/location.js";

const router = express.Router();

// Specific routes before param :id
router.get("/locations", getLocations);
router.get("/locations/:id/stock", getLocationById);
router.get("/:warehouseId/locations", getWarehouseLocations);

// Core Warehouse Routes
router.get("/", getWarehouses);
router.get("/:id", getWarehouseById);
router.post("/", createWarehouse);
router.patch("/:id", updateWarehouse);
router.put("/:id", updateWarehouse); // Alias for compatibility
router.post("/:id/deactivate", deactivateWarehouse);

export default router;
