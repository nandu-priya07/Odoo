import express from "express";
import {
  getLocations,
  getLocationById,
  getWarehouseLocations,
  createLocation,
  updateLocation,
  deactivateLocation,
} from "../pages/locations/location.js";

const router = express.Router();

// Core Location Routes
router.get("/", getLocations);
router.get("/:id", getLocationById);
router.post("/", createLocation);
router.patch("/:id", updateLocation);
router.put("/:id", updateLocation); // Alias for compatibility
router.post("/:id/deactivate", deactivateLocation);

export default router;
