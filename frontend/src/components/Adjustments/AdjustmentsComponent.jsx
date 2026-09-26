import { useState, useEffect } from "react";
import CreateAdjustmentComponent from "./CreateAdjustmentComponent";
import AdjustmentDetails from "./AdjustmentDetails";
import { fetchAdjustments, createAdjustment, validateAdjustment } from "../../services/adjustmentService";
import "../Dashboard/Dashboard.css";

function AdjustmentsComponent() {
  const [adjustments, setAdjustments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [stockList, setStockList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAdjId, setSelectedAdjId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdjustments(statusFilter, search);
      setAdjustments(data);

      const res = await fetch("http://localhost:5000/api/dashboard");
      const json = await res.json();
      if (json.success && json.data) {
        setLocations(json.data.locations || []);
        setProducts(json.data.productsList || json.data.topProducts || []);
        setStockList(json.data.stockList || []);
      }
    } catch (err) {
      console.error("Load adjustments error:", err);
      setError(err.message || "Failed to load stock adjustments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, search]);

  const handleCreateSubmit = async (formData) => {
    const newAdj = await createAdjustment(formData);
    setSuccessMsg(`Stock adjustment '${newAdj.adjustment_number}' created successfully!`);
    loadData();
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleValidate = async (id) => {
    try {
      const result = await validateAdjustment(id);
      setSuccessMsg(result.message || "Stock adjustment validated successfully!");
      loadData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      alert(err.message || "Failed to validate adjustment.");
    }
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>StockSense Inventory Adjustments</h1>
          <p>Reconcile system recorded stock against physical counted inventory levels.</p>
        </div>

        <div className="header-actions">
          <button className="action-btn" onClick={() => setIsCreateOpen(true)}>
            + Create Stock Adjustment
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="alert-banner success-banner" style={{ marginBottom: "1.5rem" }}>
          ✅ {successMsg}
        </div>
      )}

      {error && (
        <div className="alert-banner error-banner" style={{ marginBottom: "1.5rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Filters */}
      <section className="filter-section">
        <div className="search-bar-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search adjustment reference, location, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="dashboard-filters">
          <div className="filter-group">
            <label htmlFor="adjStatusFilter">Status</label>
            <select
              id="adjStatusFilter"
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="WAITING">Waiting</option>
              <option value="READY">Ready</option>
              <option value="DONE">Done (Validated)</option>
            </select>
          </div>

          <button className="reset-btn" onClick={() => { setSearch(""); setStatusFilter("All"); }}>
            Reset Filters
          </button>
        </div>
      </section>

      {/* Table */}
      {loading ? (
        <p style={{ color: "#64748b", padding: "1rem" }}>Loading stock adjustments...</p>
      ) : (
        <div className="table-container shadow-table">
          <table className="data-table">
            <thead>
              <tr>
                <th>Adjustment Reference</th>
                <th>Location</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Date</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.length > 0 ? (
                adjustments.map((a) => (
                  <tr key={a.id}>
                    <td><strong>{a.adjustment_number}</strong></td>
                    <td>{a.location_name || "Main Area"}</td>
                    <td>{a.reason || "Physical count verification"}</td>
                    <td>
                      <span className={`status-badge ${(a.status || 'DRAFT').toLowerCase()}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>{new Date(a.created_at).toLocaleDateString()}</td>
                    <td style={{ textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                        <button
                          className="action-btn"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          onClick={() => setSelectedAdjId(a.id)}
                        >
                          View Details
                        </button>
                        {a.status !== "DONE" && (
                          <button
                            className="btn-primary"
                            style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                            onClick={() => handleValidate(a.id)}
                          >
                            Apply Count ✓
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                    No stock adjustments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Adjustment Modal */}
      <CreateAdjustmentComponent
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        locations={locations}
        products={products}
        stockList={stockList}
      />

      {/* Adjustment Details Modal */}
      {selectedAdjId && (
        <AdjustmentDetails
          adjustmentId={selectedAdjId}
          onClose={() => setSelectedAdjId(null)}
          onValidated={loadData}
        />
      )}
    </div>
  );
}

export default AdjustmentsComponent;
