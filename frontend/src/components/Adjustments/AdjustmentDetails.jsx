import { useState, useEffect } from "react";
import { fetchAdjustmentById, validateAdjustment } from "../../services/adjustmentService";
import "../Dashboard/Dashboard.css";

function AdjustmentDetails({ adjustmentId, onClose, onValidated }) {
  const [adjustment, setAdjustment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [validating, setValidating] = useState(false);

  const loadDetails = async () => {
    if (!adjustmentId) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchAdjustmentById(adjustmentId);
      setAdjustment(data);
    } catch (err) {
      setError(err.message || "Failed to load adjustment details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [adjustmentId]);

  const handleValidate = async () => {
    setValidating(true);
    try {
      await validateAdjustment(adjustmentId);
      await loadDetails();
      onValidated && onValidated();
    } catch (err) {
      alert(err.message || "Failed to validate adjustment.");
    } finally {
      setValidating(false);
    }
  };

  if (!adjustmentId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "750px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex-between">
          <div>
            <h2>Stock Adjustment Details</h2>
            {adjustment && <p className="modal-subtitle">{adjustment.adjustment_number}</p>}
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading && <p style={{ color: "#64748b" }}>Loading details...</p>}
          {error && <div className="alert-banner error-banner">⚠️ {error}</div>}

          {adjustment && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="form-row-2" style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px" }}>
                <div>
                  <small style={{ color: "#64748b" }}>Adjustment Reference</small>
                  <p style={{ margin: 0, fontWeight: "bold" }}>{adjustment.adjustment_number}</p>
                </div>
                <div>
                  <small style={{ color: "#64748b" }}>Status</small>
                  <p style={{ margin: 0 }}>
                    <span className={`status-badge ${(adjustment.status || "DRAFT").toLowerCase()}`}>
                      {adjustment.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="form-row-2">
                <div>
                  <strong>Target Location:</strong>
                  <p>{adjustment.location_name || "Main Warehouse Location"}</p>
                </div>
                <div>
                  <strong>Reason:</strong>
                  <p>{adjustment.reason || "Physical count adjustment"}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="items-section">
                <span style={{ fontWeight: "700", fontSize: "0.875rem" }}>System Stock vs Physical Count Breakdown</span>
                <div className="table-container shadow-table">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product Item</th>
                        <th>SKU</th>
                        <th>System Qty</th>
                        <th>Physical Counted</th>
                        <th>Calculated Difference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {adjustment.items && adjustment.items.length > 0 ? (
                        adjustment.items.map((it) => {
                          const diff = Number(it.difference) || 0;
                          return (
                            <tr key={it.id}>
                              <td>{it.product_name}</td>
                              <td><span className="sku-tag">{it.sku}</span></td>
                              <td>{it.system_quantity} {it.unit_of_measure || "pcs"}</td>
                              <td><strong>{it.counted_quantity}</strong> {it.unit_of_measure || "pcs"}</td>
                              <td>
                                <span className={`alert-status ${diff < 0 ? "out-of-stock" : diff > 0 ? "optimal" : "low-stock"}`}>
                                  {diff > 0 ? `+${diff}` : diff} {it.unit_of_measure || "pcs"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ textAlign: "center", color: "#64748b" }}>
                            No adjustment line items recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="form-actions">
                <button className="btn-secondary" onClick={onClose}>
                  Close
                </button>
                {adjustment.status !== "DONE" && (
                  <button className="btn-primary" onClick={handleValidate} disabled={validating}>
                    {validating ? "Applying Stock Adjustment..." : "Validate & Apply Physical Count ✓"}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdjustmentDetails;
