import express from "express";
import { getProducts, getProductById, getProductStock, getCategories } from "../pages/products/product.js";
import { createProduct } from "../pages/products/createProduct.js";
import { updateProduct } from "../pages/products/updateProduct.js";
import { deleteProduct } from "../pages/products/deleteProduct.js";

const router = express.Router();

router.get("/categories", getCategories);
router.get("/:id/stock", getProductStock);
router.get("/:id", getProductById);
router.get("/", getProducts);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
