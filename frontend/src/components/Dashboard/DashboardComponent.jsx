import { useState, useEffect } from "react";
import "./Dashboard.css";

function DashboardComponent() {

  const [filters, setFilters] = useState({
    documentType: "All",
    status: "All",
    warehouse: "All",
    category: "All",
  });

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/dashboard");
      const json = await response.json();

      if (response.ok && json.success) {
        setDashboardData(json.data);
      } else {
        setError(json.message || "Failed to load dashboard data");
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to connect to backend API server (ensure backend server is running on port 5000)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const apiStats = dashboardData?.stats;

  const stats = [
    {
      title: "Total Products",
      value: apiStats ? apiStats.totalProducts.toLocaleString() : "0",
      description: "Products in stock",
    },
    {
      title: "Low / Out of Stock",
      value: apiStats ? (apiStats.lowStock + apiStats.outOfStock).toLocaleString() : "0",
      description: "Needs attention",
    },
    {
      title: "Pending Receipts",
      value: apiStats ? apiStats.pendingReceipts.toLocaleString() : "0",
      description: "Incoming stock",
    },
    {
      title: "Pending Deliveries",
      value: apiStats ? apiStats.pendingDeliveries.toLocaleString() : "0",
      description: "Outgoing stock",
    },
    {
      title: "Internal Transfers",
      value: apiStats ? apiStats.internalTransfers.toLocaleString() : "0",
      description: "Scheduled transfers",
    },
  ];

  const alerts = dashboardData?.stockAlerts?.length
    ? dashboardData.stockAlerts
    : [
        {
          product: "No Stock Alerts",
          status: "Optimal",
          quantity: "All inventory levels normal",
        },
      ];

  const recentActivity = dashboardData?.recentActivity?.length
    ? dashboardData.recentActivity
    : [
        {
          item: "No Recent Activity",
          type: "Info",
          quantity: "0",
          location: "System",
          date: "-",
        },
      ];

  const warehouseOptions = dashboardData?.warehouses || [];
  const categoryOptions = dashboardData?.categories || [];

  return (
    <div className="dashboard-page">

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>
            Here's an overview of your inventory operations.
          </p>
        </div>
      </div>

      {loading && (
        <div style={{ padding: "1rem", color: "#666" }}>
          <p>Loading real-time inventory statistics...</p>
        </div>
      )}

      {error && (
        <div style={{ padding: "1rem", backgroundColor: "#ffebee", borderRadius: "8px", marginBottom: "1rem", color: "#c62828" }}>
          <p>⚠️ {error}</p>
          <button 
            onClick={fetchDashboard}
            style={{ marginTop: "0.5rem", padding: "0.4rem 0.8rem", cursor: "pointer" }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="dashboard-stats">
        {stats.map((stat) => (
          <div className="stat-card" key={stat.title}>
            <div className="stat-card-content">
              <p className="stat-title">{stat.title}</p>
              <h2>{stat.value}</h2>
              <span>{stat.description}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <section className="dashboard-section">
        <div className="section-header">
          <div>
            <h2>Inventory Overview</h2>
            <p>Filter inventory operations.</p>
          </div>
        </div>

        <div className="dashboard-filters">

          <div className="filter-group">
            <label htmlFor="documentType">
              Document Type
            </label>

            <select
              id="documentType"
              name="documentType"
              value={filters.documentType}
              onChange={handleFilterChange}
            >
              <option value="All">All</option>
              <option value="Receipts">Receipts</option>
              <option value="Delivery">Delivery</option>
              <option value="Internal">Internal</option>
              <option value="Adjustments">Adjustments</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="status">
              Status
            </label>

            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="All">All</option>
              <option value="Draft">Draft</option>
              <option value="Waiting">Waiting</option>
              <option value="Ready">Ready</option>
              <option value="Done">Done</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="warehouse">
              Warehouse / Location
            </label>

            <select
              id="warehouse"
              name="warehouse"
              value={filters.warehouse}
              onChange={handleFilterChange}
            >
              <option value="All">All</option>
              {warehouseOptions.map((wh) => (
                <option key={wh.id} value={wh.name}>
                  {wh.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="category">
              Product Category
            </label>

            <select
              id="category"
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="All">All</option>
              {categoryOptions.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

        </div>
      </section>

      {/* Bottom Grid */}
      <div className="dashboard-grid">

        {/* Stock Alerts */}
        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Stock Alerts</h2>
              <p>Items that need attention.</p>
            </div>
          </div>

          <div className="alert-list">
            {alerts.map((alert, idx) => (
              <div
                className="alert-item"
                key={alert.product || idx}
              >
                <div>
                  <h3>{alert.product}</h3>
                  <p>{alert.quantity}</p>
                </div>

                <span
                  className={`alert-status ${
                    alert.status === "Out of Stock"
                      ? "out-of-stock"
                      : alert.status === "Low Stock"
                      ? "low-stock"
                      : "optimal"
                  }`}
                >
                  {alert.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity */}
        <section className="dashboard-section">
          <div className="section-header">
            <div>
              <h2>Recent Activity</h2>
              <p>Latest stock movements.</p>
            </div>
          </div>

          <div className="activity-list">
            {recentActivity.map((activity, index) => (
              <div
                className="activity-item"
                key={`${activity.item}-${index}`}
              >
                <div className="activity-info">
                  <h3>{activity.item}</h3>
                  <p>
                    {activity.type} · {activity.location || "Default Location"}
                  </p>
                </div>

                <div className="activity-meta">
                  <strong>{activity.quantity}</strong>
                  <span>
                    {activity.date && activity.date !== "-"
                      ? new Date(activity.date).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

    </div>
  );
}

export default DashboardComponent;