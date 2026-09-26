import React, { useState, useEffect, useMemo } from "react";
import NewDeliveryComponent from "../Dashboard/NewDeliveryComponent";

function DeliveriesComponent() {
  const [deliveries, setDeliveries] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modals
  const [isNewDeliveryOpen, setIsNewDeliveryOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("http://localhost:5000/api/dashboard");
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        setDeliveries(json.data.deliveriesList || []);
        setWarehouses(json.data.warehouses || []);
        setProducts(json.data.productsList || json.data.topProducts || []);
        setLocations(json.data.locations || []);
        setStockList(json.data.stockList || []);
      } else {
        setError(json.message || "Failed to load deliveries");
      }
    } catch (err) {
      console.error("Fetch deliveries error:", err);
      setError("Unable to connect to server on port 5000.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      const matchesStatus = statusFilter === "All" || (d.status || "").toUpperCase() === statusFilter.toUpperCase();
      const query = search.toLowerCase().trim();
      if (!query) return matchesStatus;

      const delivNum = (d.delivery_number || "").toLowerCase();
      const customer = (d.customer_name || "").toLowerCase();
      const whName = (d.warehouse_name || "").toLowerCase();

      return matchesStatus && (delivNum.includes(query) || customer.includes(query) || whName.includes(query));
    });
  }, [deliveries, statusFilter, search]);

  const kpis = useMemo(() => {
    const total = deliveries.length;
    const pending = deliveries.filter((d) => ["DRAFT", "WAITING", "READY"].includes((d.status || "").toUpperCase())).length;
    const completed = deliveries.filter((d) => (d.status || "").toUpperCase() === "DONE").length;
    return { total, pending, completed };
  }, [deliveries]);

  const handleDeliveryCreated = () => {
    setToastMsg("Delivery created successfully!");
    setIsNewDeliveryOpen(false);
    loadData();
    setTimeout(() => setToastMsg(""), 3500);
  };

  return (
    <div className="dashboard-container">
      {/* Toast */}
      {toastMsg && (
        <div className="alert-banner success-banner" style={{ marginBottom: "1rem" }}>
          ✓ {toastMsg}
        </div>
      )}

      {error && (
        <div className="alert-banner error-banner" style={{ marginBottom: "1rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Deliveries & Outgoing Stock</h1>
          <p className="dashboard-subtitle">
            Manage customer fulfillment, outbound dispatches, and warehouse pick-pack operations.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setIsNewDeliveryOpen(true)}
          style={{ padding: "0.6rem 1.25rem", fontSize: "0.875rem" }}
        >
          + New Delivery
        </button>
      </div>

      {/* Metric KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.25rem",
        }}
      >
        <div className="card" style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#64748b", letterSpacing: "0.04em" }}>
            Total Deliveries
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#0f172a", marginTop: "0.35rem" }}>
            {kpis.total}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem" }}>
            All outbound manifests
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#d97706", letterSpacing: "0.04em" }}>
            Pending Fulfillment
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#b45309", marginTop: "0.35rem" }}>
            {kpis.pending}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem" }}>
            Draft / Ready for dispatch
          </div>
        </div>

        <div className="card" style={{ padding: "1.25rem 1.5rem" }}>
          <div style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "#059669", letterSpacing: "0.04em" }}>
            Completed Orders
          </div>
          <div style={{ fontSize: "1.85rem", fontWeight: 800, color: "#047857", marginTop: "0.35rem" }}>
            {kpis.completed}
          </div>
          <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem" }}>
            Successfully dispatched
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: "1rem 1.25rem",
          display: "flex",
          flexWrap: "wrap",
          gap: "1rem",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", flex: "1 1 300px" }}>
          <div style={{ flex: "1 1 240px", maxWidth: "340px" }}>
            <input
              type="text"
              className="form-control"
              placeholder="Search by delivery #, customer, or hub..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: "170px" }}>
            <select
              className="form-control"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="WAITING">WAITING</option>
              <option value="READY">READY</option>
              <option value="DONE">DONE</option>
              <option value="CANCELED">CANCELED</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          className="btn btn-outline"
          onClick={() => {
            setSearch("");
            setStatusFilter("All");
          }}
          style={{ padding: "0.45rem 0.95rem", fontSize: "0.825rem" }}
        >
          Reset Filters
        </button>
      </div>

      {/* Deliveries Table */}
      <div className="card shadow-table">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Delivery Number</th>
                <th>Customer / Consignee</th>
                <th>Warehouse Facility</th>
                <th>Status</th>
                <th>Created Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    Loading deliveries telemetry...
                  </td>
                </tr>
              ) : filteredDeliveries.length > 0 ? (
                filteredDeliveries.map((deliv) => {
                  const statusClass = (deliv.status || "DRAFT").toLowerCase();
                  return (
                    <tr key={deliv.id}>
                      <td>
                        <strong style={{ color: "#0f172a" }}>{deliv.delivery_number}</strong>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600 }}>{deliv.customer_name || "General Client"}</span>
                      </td>
                      <td>
                        <span style={{ color: "#475569" }}>{deliv.warehouse_name || "Central Fulfillment"}</span>
                      </td>
                      <td>
                        <span className={`status-badge ${statusClass}`}>{deliv.status || "DRAFT"}</span>
                      </td>
                      <td style={{ color: "#64748b" }}>
                        {deliv.created_at ? new Date(deliv.created_at).toLocaleDateString() : "-"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-sm"
                          onClick={() => setSelectedDelivery(deliv)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>
                    No outgoing deliveries found matching the current criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedDelivery && (
        <div className="modal-overlay" onClick={() => setSelectedDelivery(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "540px" }}>
            <div className="card-header">
              <h3 className="card-title">Delivery Manifest: {selectedDelivery.delivery_number}</h3>
              <button
                type="button"
                onClick={() => setSelectedDelivery(null)}
                style={{ background: "none", border: "none", fontSize: "1.25rem", cursor: "pointer", color: "#64748b" }}
              >
                ✕
              </button>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                    Customer
                  </div>
                  <div style={{ fontWeight: 600, marginTop: "2px" }}>{selectedDelivery.customer_name || "N/A"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                    Origin Warehouse
                  </div>
                  <div style={{ fontWeight: 600, marginTop: "2px" }}>{selectedDelivery.warehouse_name || "Main Hub"}</div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                    Current Status
                  </div>
                  <div style={{ marginTop: "4px" }}>
                    <span className={`status-badge ${(selectedDelivery.status || "DRAFT").toLowerCase()}`}>
                      {selectedDelivery.status || "DRAFT"}
                    </span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                    Created Timestamp
                  </div>
                  <div style={{ fontWeight: 600, marginTop: "2px" }}>
                    {selectedDelivery.created_at ? new Date(selectedDelivery.created_at).toLocaleString() : "-"}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "1rem", display: "flex", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setSelectedDelivery(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Delivery Modal Integration */}
      <NewDeliveryComponent
        isOpen={isNewDeliveryOpen}
        onClose={() => setIsNewDeliveryOpen(false)}
        onSuccess={handleDeliveryCreated}
        warehouses={warehouses}
        products={products}
        locations={locations}
        stockList={stockList}
      />
    </div>
  );
}

export default DeliveriesComponent;
