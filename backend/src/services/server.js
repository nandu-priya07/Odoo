import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "../routes/authRoutes.js";
import dashboardRoutes from "../routes/dashboardRoutes.js";
import deliveryRoutes from "../routes/deliveryRoutes.js";
import productRoutes from "../routes/productRoutes.js";
import receiptRoutes from "../routes/receiptRoutes.js";
import transferRoutes from "../routes/transferRoutes.js";
import adjustmentRoutes from "../routes/adjustmentRoutes.js";
import stockRoutes from "../routes/stockRoutes.js";
import warehouseRoutes from "../routes/warehouseRoutes.js";
import reorderRoutes from "../routes/reorderRoutes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/deliveries", deliveryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/receipts", receiptRoutes);
app.use("/api/transfers", transferRoutes);
app.use("/api/adjustments", adjustmentRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/reorder-rules", reorderRoutes);


app.get("/", (req, res) => {
  res.json({ message: "StockSense API Server is running" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
