import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

function BrandMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M16 4.5 26.5 10.5 16 16.5 5.5 10.5Z" fill="#fff" />
      <path d="M5.5 10.5 16 16.5v11L5.5 21.5Z" fill="#fff" fillOpacity=".72" />
      <path d="M26.5 10.5 16 16.5v11l10.5-6Z" fill="#fff" fillOpacity=".45" />
    </svg>
  );
}

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
    <header className="stocksense-navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/dashboard" className="navbar-brand">
          <span className="navbar-brand-mark">
            <BrandMark />
          </span>
          <div className="navbar-brand-text">
            <span className="navbar-brand-name">StockSense</span>
            <span className="navbar-brand-tag">Operations</span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="navbar-links" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive = path === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                <span>{item.label}</span>
                {isActive && <span className="nav-indicator" />}
              </Link>
            );
          })}
        </nav>

        {/* User Status & Profile */}
        <div className="navbar-user">
          <div className="navbar-live-status" title="Warehouse telemetry active">
            <span className="navbar-live-dot" />
            <span>Live Sync</span>
          </div>

          <Link to="/profile" className="user-badge" title="User Profile">
            <span className="user-avatar-initials">AD</span>
            <span className="user-name-text">Admin Staff</span>
          </Link>

          <Link to="/login" className="logout-btn" title="Sign out of StockSense">
            Sign out
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
