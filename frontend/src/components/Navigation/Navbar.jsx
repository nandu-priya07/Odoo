import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

/* ------------------------------------------------------------------ */
/* Inline Accessible SVG Icons                                        */
/* ------------------------------------------------------------------ */

function Icon({ children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

const LayoutDashboardIcon = (props) => (
  <Icon {...props}>
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </Icon>
);

const PackageIcon = (props) => (
  <Icon {...props}>
    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
    <path d="M12 22V12" />
    <path d="m3.3 7 7.7 4.73a2 2 0 0 0 2 0L20.7 7" />
  </Icon>
);

const ArrowDownLeftIcon = (props) => (
  <Icon {...props}>
    <line x1="17" y1="7" x2="7" y2="17" />
    <polyline points="17 17 7 17 7 7" />
  </Icon>
);

const ArrowUpRightIcon = (props) => (
  <Icon {...props}>
    <line x1="7" y1="17" x2="17" y2="7" />
    <polyline points="7 7 17 7 17 17" />
  </Icon>
);

const RepeatIcon = (props) => (
  <Icon {...props}>
    <path d="m17 2 4 4-4 4" />
    <path d="M3 11v-1a4 4 0 0 1 4-4h14" />
    <path d="m7 22-4-4 4-4" />
    <path d="M21 13v1a4 4 0 0 1-4 4H3" />
  </Icon>
);

const SlidersIcon = (props) => (
  <Icon {...props}>
    <line x1="4" x2="4" y1="21" y2="14" />
    <line x1="4" x2="4" y1="10" y2="3" />
    <line x1="12" x2="12" y1="21" y2="12" />
    <line x1="12" x2="12" y1="8" y2="3" />
    <line x1="20" x2="20" y1="21" y2="16" />
    <line x1="20" x2="20" y1="12" y2="3" />
    <line x1="1" x2="7" y1="14" y2="14" />
    <line x1="9" x2="15" y1="8" y2="8" />
    <line x1="17" x2="23" y1="16" y2="16" />
  </Icon>
);

const HistoryIcon = (props) => (
  <Icon {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </Icon>
);

const WarehouseIcon = (props) => (
  <Icon {...props}>
    <path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-3.2a2 2 0 0 1 1.48 0l8 3.2A2 2 0 0 1 22 8.35Z" />
    <path d="M6 18h12" />
    <path d="M6 14h12" />
    <rect width="12" height="12" x="6" y="10" />
  </Icon>
);

const AlertCircleIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </Icon>
);

const SettingsIcon = (props) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </Icon>
);

const SearchIcon = (props) => (
  <Icon {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </Icon>
);

const BellIcon = (props) => (
  <Icon {...props}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Icon>
);

const MenuIcon = (props) => (
  <Icon {...props}>
    <line x1="4" x2="20" y1="12" y2="12" />
    <line x1="4" x2="20" y1="6" y2="6" />
    <line x1="4" x2="20" y1="18" y2="18" />
  </Icon>
);

const LogoutIcon = (props) => (
  <Icon {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </Icon>
);

function BrandMark() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path d="M16 4.5 26.5 10.5 16 16.5 5.5 10.5Z" fill="#fff" />
      <path d="M5.5 10.5 16 16.5v11L5.5 21.5Z" fill="#fff" fillOpacity=".72" />
      <path d="M26.5 10.5 16 16.5v11l10.5-6Z" fill="#fff" fillOpacity=".45" />
    </svg>
  );
}

// Navigation structure
const navGroups = [
  {
    title: "Core Operations",
    items: [
      { label: "Dashboard", path: "/dashboard", icon: <LayoutDashboardIcon /> },
      { label: "Products Catalog", path: "/products", icon: <PackageIcon /> },
    ],
  },
  {
    title: "Stock Movements",
    items: [
      { label: "Receipts (Inflow)", path: "/receipts", icon: <ArrowDownLeftIcon /> },
      { label: "Deliveries (Outflow)", path: "/deliveries", icon: <ArrowUpRightIcon /> },
      { label: "Stock Transfers", path: "/transfers", icon: <RepeatIcon /> },
      { label: "Adjustments", path: "/adjustments", icon: <SlidersIcon /> },
      { label: "Move History", path: "/move-history", icon: <HistoryIcon /> },
    ],
  },
  {
    title: "Infrastructure & Config",
    items: [
      { label: "Warehouses & Hubs", path: "/warehouses", icon: <WarehouseIcon /> },
      { label: "Reorder Rules", path: "/reorder-rules", icon: <AlertCircleIcon /> },
      { label: "System Settings", path: "/settings", icon: <SettingsIcon /> },
    ],
  },
];

// Route breadcrumb metadata
const routeMeta = {
  "/dashboard": { title: "Operations Dashboard", breadcrumb: "StockSense / Overview", icon: "📊" },
  "/products": { title: "Products Catalog", breadcrumb: "StockSense / Master Data", icon: "📦" },
  "/receipts": { title: "Stock Receipts & Intake", breadcrumb: "StockSense / Inbound Shipments", icon: "📥" },
  "/deliveries": { title: "Deliveries & Outgoing Stock", breadcrumb: "StockSense / Order Fulfillment", icon: "🚚" },
  "/transfers": { title: "Internal Stock Transfers", breadcrumb: "StockSense / Inter-Hub Logistics", icon: "🔄" },
  "/adjustments": { title: "Inventory Adjustments", breadcrumb: "StockSense / Physical Stocktake", icon: "⚖️" },
  "/move-history": { title: "Move History & Audit Ledger", breadcrumb: "StockSense / Transaction Audit", icon: "📜" },
  "/warehouses": { title: "Warehouses & Storage Locations", breadcrumb: "StockSense / Facilities", icon: "🏢" },
  "/reorder-rules": { title: "Automated Reorder Rules", breadcrumb: "StockSense / Replenishment", icon: "⚡" },
  "/profile": { title: "User Profile & Security", breadcrumb: "StockSense / Account", icon: "👤" },
  "/settings": { title: "System Settings", breadcrumb: "StockSense / Configuration", icon: "⚙️" },
};

function Navbar({ onSearchChange, searchValue = "" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [mobileOpen, setMobileOpen] = useState(false);
  const [internalSearch, setInternalSearch] = useState("");

  // Close mobile drawer on route transition
  useEffect(() => {
    setMobileOpen(false);
  }, [currentPath]);

  // Current page context
  const currentMeta = routeMeta[currentPath] || {
    title: "StockSense Operations",
    breadcrumb: "StockSense / Operations",
    icon: "📦",
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(internalSearch);
    }
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ============================================================ */}
      {/* LEFT SIDEBAR NAVIGATION                                       */}
      {/* ============================================================ */}
      <aside
        className={`app-sidebar ${mobileOpen ? "app-sidebar--open" : ""}`}
        aria-label="Application Navigation"
      >
        {/* Brand Area */}
        <Link to="/dashboard" className="sidebar-brand">
          <span className="sidebar-brand-mark">
            <BrandMark />
          </span>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">StockSense</span>
            <span className="sidebar-brand-tag">Operations Hub</span>
          </div>
        </Link>

        {/* Navigation Groups */}
        <nav className="sidebar-nav-container">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="sidebar-nav-group">
              <div className="sidebar-nav-heading">{group.title}</div>
              <div className="sidebar-nav-items">
                {group.items.map((item) => {
                  const isActive = currentPath === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`sidebar-nav-link ${isActive ? "active" : ""}`}
                    >
                      <span className="sidebar-nav-icon">{item.icon}</span>
                      <span className="sidebar-nav-label">{item.label}</span>
                      {isActive && <span className="sidebar-active-indicator" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Sidebar Footer User Card */}
        <div className="sidebar-user-footer">
          <Link to="/profile" className="sidebar-user-profile" title="View Profile">
            <div className="sidebar-user-avatar">AD</div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">Admin Staff</span>
              <span className="sidebar-user-role">Inventory Lead</span>
            </div>
          </Link>

          <Link
            to="/login"
            className="sidebar-logout-btn"
            title="Sign out of StockSense"
            aria-label="Sign out"
          >
            <LogoutIcon />
          </Link>
        </div>
      </aside>

      {/* ============================================================ */}
      {/* TOP HEADER BAR                                               */}
      {/* ============================================================ */}
      <header className="app-topbar">
        {/* Left Section: Mobile Toggle & Page Context */}
        <div className="topbar-left">
          <button
            type="button"
            className="topbar-mobile-toggle"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="Toggle Navigation Menu"
          >
            <MenuIcon />
          </button>

          <div className="topbar-page-context">
            <span className="topbar-breadcrumb">{currentMeta.breadcrumb}</span>
            <h1 className="topbar-page-title">{currentMeta.title}</h1>
          </div>
        </div>

        {/* Middle Section: Quick Filter / Search */}
        <form className="topbar-search-form" onSubmit={handleSearchSubmit}>
          <span className="topbar-search-icon">
            <SearchIcon />
          </span>
          <input
            type="text"
            className="topbar-search-input"
            placeholder="Search SKUs, references, or facilities..."
            value={searchValue || internalSearch}
            onChange={(e) => {
              setInternalSearch(e.target.value);
              if (onSearchChange) onSearchChange(e.target.value);
            }}
            aria-label="Search items"
          />
        </form>

        {/* Right Section: Telemetry, Notifications & Quick Profile */}
        <div className="topbar-right">
          <div className="topbar-telemetry-badge" title="Real-time warehouse synchronization active">
            <span className="telemetry-pulsing-dot" />
            <span className="telemetry-text">Live Sync</span>
          </div>

          <Link to="/settings" className="topbar-icon-link" title="System Settings">
            <SettingsIcon />
          </Link>

          <Link to="/profile" className="topbar-user-pill" title="My Profile">
            <div className="topbar-avatar-badge">AD</div>
            <span className="topbar-user-display-name">Admin</span>
          </Link>

          <Link to="/login" className="topbar-logout-btn" title="Sign out">
            Sign out
          </Link>
        </div>
      </header>
    </>
  );
}

export default Navbar;
