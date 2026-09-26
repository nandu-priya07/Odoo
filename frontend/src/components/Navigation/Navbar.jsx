import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();
  const path = location.pathname;

  const navItems = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Products", path: "/products" },
    { label: "Receipts", path: "/receipts" },
    { label: "Deliveries", path: "/deliveries" },
    { label: "Transfers", path: "/transfers" },
    { label: "Adjustments", path: "/adjustments" },
    { label: "Move History", path: "/move-history" },
    { label: "Warehouses", path: "/warehouses" },
    { label: "Reorder Rules", path: "/reorder-rules" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <nav className="stocksense-navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <span className="brand-logo">📦</span>
          <span className="brand-text">StockSense</span>
        </Link>

        <div className="navbar-links">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-link ${path === item.path ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="navbar-user">
          <Link to="/profile" className="user-badge" title="User Profile">
            <span>👤 Admin Staff</span>
          </Link>
          <Link to="/login" className="logout-btn" title="Logout">
            Logout
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
