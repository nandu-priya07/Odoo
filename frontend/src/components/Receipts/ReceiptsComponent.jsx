import { useState, useEffect } from "react";
import ReceiptTable from "./ReceiptTable";
import CreateReceiptComponent from "./CreateReceiptComponent";
import ReceiptDetails from "./ReceiptDetails";
import { fetchReceipts, createReceipt, validateReceipt } from "../../services/receiptService";
import "../Dashboard/Dashboard.css";

function ReceiptsComponent() {
  const [receipts, setReceipts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");
  const [warehouseFilter, setWarehouseFilter] = useState("All");
  const [search, setSearch] = useState("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchReceipts(statusFilter, warehouseFilter, search);
      setReceipts(data);

      const res = await fetch("http://localhost:5000/api/dashboard");
      const json = await res.json();
      if (json.success && json.data) {
        setSuppliers(json.data.suppliers || []);
        setWarehouses(json.data.warehouses || []);
        setProducts(json.data.productsList || json.data.topProducts || []);
        setLocations(json.data.locations || []);
      }
    } catch (err) {
      console.error("Load receipts error:", err);
      setError(err.message || "Failed to load receipts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, warehouseFilter, search]);

  const handleCreateSubmit = async (formData) => {
    const newReceipt = await createReceipt(formData);
    setSuccessMsg(`Receipt '${newReceipt.receipt_number}' created successfully!`);
    loadData();
    setTimeout(() => setSuccessMsg(""), 3500);
  };

  const handleValidate = async (id) => {
    try {
      const result = await validateReceipt(id);
      setSuccessMsg(result.message || "Receipt validated successfully! Stock increased.");
      loadData();
      setTimeout(() => setSuccessMsg(""), 3500);
    } catch (err) {
      alert(err.message || "Failed to validate receipt.");
    }
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>StockSense Receipts / Incoming Stock</h1>
          <p>Manage incoming vendor shipments, purchase receipts, and stock intake validation.</p>
        </div>

        <div className="header-actions">
          <button className="action-btn" onClick={() => setIsCreateOpen(true)}>
            + Create New Receipt
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
            placeholder="🔍 Search receipt number, supplier, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="dashboard-filters">
          <div className="filter-group">
            <label htmlFor="recStatusFilter">Status</label>
            <select
              id="recStatusFilter"
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

          <div className="filter-group">
            <label htmlFor="recWarehouseFilter">Warehouse</label>
            <select
              id="recWarehouseFilter"
              className="form-select"
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
            >
              <option value="All">All Warehouses</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>

          <button className="reset-btn" onClick={() => { setSearch(""); setStatusFilter("All"); setWarehouseFilter("All"); }}>
            Reset Filters
          </button>
        </div>
      </section>

      {/* Table */}
      {loading ? (
        <p style={{ color: "#64748b", padding: "1rem" }}>Loading receipts feed...</p>
      ) : (
        <ReceiptTable
          receipts={receipts}
          onViewDetails={(id) => setSelectedReceiptId(id)}
          onValidate={handleValidate}
        />
      )}

      {/* Create Receipt Modal */}
      <CreateReceiptComponent
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        suppliers={suppliers}
        warehouses={warehouses}
        products={products}
        locations={locations}
      />

      {/* Receipt Details Modal */}
      {selectedReceiptId && (
        <ReceiptDetails
          receiptId={selectedReceiptId}
          onClose={() => setSelectedReceiptId(null)}
          onValidated={loadData}
        />
      )}
    </div>
  );
}

export default ReceiptsComponent;
