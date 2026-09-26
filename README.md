# 📦 StockSense - Enterprise Stock & Inventory Management System

StockSense is an Odoo-inspired, full-stack enterprise inventory and stock management system designed for multi-warehouse monitoring, internal stock transfers, receipts processing, delivery execution, inventory reconciliation, reorder automation, and real-time stock ledger auditing.

---

## ✨ Features

- 🔐 **Authentication & Access Control**: Secure JWT authentication with role-based access controls and OTP verification flow.
- 📊 **Executive Dashboard**: Real-time overview of inventory metrics, stock valuation, low-stock warnings, and activity feeds.
- 📦 **Product Catalog & Categories**: Manage SKUs, product metadata, units of measure, categories, and initial stock baselines.
- 🏬 **Multi-Warehouse & Location Management**: Hierarchical management of physical warehouses and sub-locations (bays, aisles, shelves).
- 📥 **Stock Receipts (Goods In)**: Create and process inbound purchase receipts from suppliers into specific locations, automatically increasing inventory.
- 🚚 **Delivery Orders (Goods Out)**: Manage customer shipments with automatic stock deduction and status lifecycle (`DRAFT` ➔ `DONE`).
- 🔄 **Internal Location Transfers**: Track stock movements between locations with full traceability.
- ⚖️ **Physical Stock Adjustments**: Record stock takes, compute difference variances (System vs Counted), and execute inventory reconciliations.
- 📜 **Audit Stock Ledger**: Immutable transaction log keeping track of exact quantity changes, transaction references, timestamps, and balance history.
- 🚨 **Reorder Rules & Low Stock Alerts**: Define minimum safety stock levels per product and trigger automated replenishment alerts.

---

## 🏗️ Architecture Overview

```text
                     +---------------------------------------+
                     |         React 19 SPA (Vite)          |
                     | Components | Pages | Context | Services|
                     +-------------------+-------------------+
                                         |
                                 REST API (Axios)
                                         |
                     +-------------------v-------------------+
                     |        Node.js + Express 5 API        |
                     |  Auth | Stock | Receipts | Deliveries |
                     +-------------------+-------------------+
                                         |
                                PostgreSQL Query Pool
                                         |
                     +-------------------v-------------------+
                     |       PostgreSQL / Supabase Database  |
                     |  Users, Products, Stock, Ledger, etc. |
                     +---------------------------------------+
```

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **HTTP Client**: Axios / Native Fetch API
- **Styling**: Vanilla CSS with custom modern design system & responsive UI components

### **Backend**
- **Runtime & Server**: [Node.js](https://nodejs.org/) (ES Modules) + [Express 5](https://expressjs.com/)
- **Database**: PostgreSQL (Supabase or direct PostgreSQL connection) using `pg` Connection Pool
- **Security & Auth**: JSON Web Tokens (`jsonwebtoken`), `bcrypt` password hashing, and OTP generator
- **Database Utilities**: Custom table setup script (`database.js`) with native `pgcrypto` support

---

## 📁 Repository Structure

```text
Odoo/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection pool & table schema setup (database.js)
│   │   ├── database/        # Sample seeding & cleanup scripts
│   │   ├── pages/           # Controller logic & business handlers for modules
│   │   ├── routes/          # Express route definitions (12 core modules)
│   │   └── services/        # Express app initialization & server entrypoint (server.js)
│   ├── .env                 # Backend environment variables
│   └── package.json         # Backend dependencies & scripts
│
├── frontend/
│   ├── src/
│   │   ├── assets/          # Static assets & icons
│   │   ├── components/      # Reusable UI components (Tables, Modals, Forms, Nav)
│   │   ├── pages/           # Screen views (Dashboard, Products, Receipts, Transfers, etc.)
│   │   ├── services/        # Service modules for backend API communication
│   │   ├── App.jsx          # Route configuration
│   │   └── main.jsx         # App mounting point
│   ├── index.html           # HTML template
│   ├── vite.config.js       # Vite build & server configuration
│   └── package.json         # Frontend dependencies & scripts
│
└── README.md                # Project documentation
```

---

## 🔌 API Endpoints Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/auth` | `POST` | User login, registration, and profile authentication |
| `/api/dashboard` | `GET` | Summary statistics, stock metrics, and system counts |
| `/api/products` | `GET`, `POST`, `PUT`, `DELETE` | Product catalog CRUD management |
| `/api/categories` | `GET` | Product category listings |
| `/api/warehouses` | `GET`, `POST`, `PUT`, `DELETE` | Warehouse management |
| `/api/locations` | `GET`, `POST`, `PUT`, `DELETE` | Warehouse sub-location setup |
| `/api/stock` | `GET` | Real-time stock levels across warehouses/locations |
| `/api/receipts` | `GET`, `POST`, `PUT`, `POST /validate` | Inbound stock receipts |
| `/api/deliveries` | `GET`, `POST`, `PUT`, `POST /validate` | Outbound delivery orders |
| `/api/transfers` | `GET`, `POST`, `PUT`, `POST /validate` | Internal location-to-location transfers |
| `/api/adjustments` | `GET`, `POST`, `PUT`, `POST /validate` | Physical inventory count reconciliations |
| `/api/reorder-rules` | `GET`, `POST`, `PUT`, `DELETE` | Min stock threshold definitions & alerts |
| `/api/stock-ledger` | `GET` | Complete immutable movement audit log |

---

## 🗄️ Database Schema Summary

StockSense utilizes a relational database structure designed for strict inventory integrity:

- **`users`**: Authentication credentials, roles (`admin`, `warehouse_staff`), timestamps.
- **`categories`**: Grouping for products.
- **`warehouses` & `locations`**: Storage hierarchy (Warehouse ➔ Locations).
- **`products`**: Item SKUs, unit of measure, initial baseline stock.
- **`suppliers`**: Supplier details for procurement & receipts.
- **`stock`**: Unique product-location pair quantities (`quantity` per location).
- **`receipts` & `receipt_items`**: Goods receipt headers and item line items.
- **`deliveries` & `delivery_items`**: Outbound shipments headers and line items.
- **`internal_transfers` & `transfer_items`**: Intra-warehouse move records.
- **`stock_adjustments` & `stock_adjustment_items`**: Inventory audit count & difference logs.
- **`stock_ledger`**: Complete audit trail of every quantity delta (`transaction_type`, `quantity_change`, `quantity_after`).
- **`reorder_rules`**: Minimum stock limits (`minimum_stock`, `reorder_quantity`).
- **`otp_codes`**: Multi-factor & password recovery tokens.

---

## ⚙️ Installation & Setup

### **Prerequisites**
- **Node.js** v18+
- **npm** v9+
- **PostgreSQL** database instance (Supabase or local PostgreSQL)

### **1. Clone Repository**
```bash
git clone <repository-url>
cd Odoo
```

### **2. Setup Backend**
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/stocksense
JWT_SECRET=your_jwt_secret_key_here
```

Initialize database tables and seed sample data:
```bash
npm run db:setup
npm run seed
```

Start the backend server:
```bash
# Development mode (auto-reloads on change)
npm run dev

# Production mode
npm start
```

### **3. Setup Frontend**
Open a new terminal window:
```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

Open your browser at:
`http://localhost:5173`

---

## 🧪 Available Scripts

### **Backend Scripts**
- `npm run dev`: Launch backend dev server using `node --watch`.
- `npm start`: Launch backend production server.
- `npm run db:setup`: Connect to database and execute table creation migrations.
- `npm run db:clear`: Wipe database tables for clean resets.
- `npm run seed`: Populate initial sample data (warehouses, products, receipts).

### **Frontend Scripts**
- `npm run dev`: Launch Vite dev server with hot module replacement (HMR).
- `npm run build`: Compile bundle for production release.
- `npm run preview`: Preview production build locally.
- `npm run lint`: Run ESLint analysis.

---

## 🔮 Roadmap & Future Enhancements

- 🤖 **AI-Powered Demand Forecasting**: Machine learning models for stock prediction.
- 📱 **Barcode / QR Code Scanner**: Native mobile/web scan integration for receipt processing.
- 📊 **Advanced Analytics & Export**: Custom report generation with PDF/Excel exports.
- 🔔 **Real-Time Push Notifications**: WebSockets integration for low-stock alerts.

---

## 📝 License

Distributed under the ISC License.