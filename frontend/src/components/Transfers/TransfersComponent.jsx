import { useState, useEffect } from "react";
import TransferTable from "./TransferTable";
import CreateTransferComponent from "./CreateTransferComponent";
import TransferDetails from "./TransferDetails";
import { fetchTransfers, createTransfer, validateTransfer } from "../../services/transferService";
import "../Dashboard/Dashboard.css";

function TransfersComponent() {
  const [transfers, setTransfers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTransferId, setSelectedTransferId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchTransfers(statusFilter, search);
      setTransfers(data);

      const res = await fetch("http://localhost:5000/api/dashboard");
      const json = await res.json();
      if (json.success && json.data) {
        setLocations(json.data.locations || []);
        setProducts(json.data.productsList || json.data.topProducts || []);
      }
    } catch (err) {
      console.error("Load transfers error:", err);
      setError(err.message || "Failed to load stock transfers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, search]);

  const handleCreateSubmit = async (formData) => {
    const newTrf = await createTransfer(formData);
    setSuccessMsg(`Transfer '${newTrf.transfer_number}' created successfully!`);
    loadData();
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleValidate = async (id) => {
    try {
      const result = await validateTransfer(id);
      setSuccessMsg(result.message || "Stock transfer executed successfully!");
      loadData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      alert(err.message || "Failed to execute transfer.");
    }
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>StockSense Internal Transfers</h1>
          <p>Move stock seamlessly between warehouses, racks, and internal locations.</p>
        </div>

        <div className="header-actions">
          <button className="action-btn" onClick={() => setIsCreateOpen(true)}>
            + Create Stock Transfer
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
            placeholder="🔍 Search reference number or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="dashboard-filters">
          <div className="filter-group">
            <label htmlFor="trfStatusFilter">Status</label>
            <select
              id="trfStatusFilter"
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="DRAFT">Draft</option>
              <option value="WAITING">Waiting</option>
              <option value="READY">Ready</option>
              <option value="DONE">Done (Completed)</option>
            </select>
          </div>

          <button className="reset-btn" onClick={() => { setSearch(""); setStatusFilter("All"); }}>
            Reset Filters
          </button>
        </div>
      </section>

      {/* Table */}
      {loading ? (
        <p style={{ color: "#64748b", padding: "1rem" }}>Loading stock transfers...</p>
      ) : (
        <TransferTable
          transfers={transfers}
          onViewDetails={(id) => setSelectedTransferId(id)}
          onValidate={handleValidate}
        />
      )}

      {/* Create Transfer Modal */}
      <CreateTransferComponent
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        locations={locations}
        products={products}
      />

      {/* Transfer Details Modal */}
      {selectedTransferId && (
        <TransferDetails
          transferId={selectedTransferId}
          onClose={() => setSelectedTransferId(null)}
          onValidated={loadData}
        />
      )}
    </div>
  );
}

export default TransfersComponent;
