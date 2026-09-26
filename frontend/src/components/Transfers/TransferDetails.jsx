import { useState, useEffect } from "react";
import { fetchTransferById, validateTransfer } from "../../services/transferService";
import "../Dashboard/Dashboard.css";

function TransferDetails({ transferId, onClose, onValidated }) {
  const [transfer, setTransfer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [validating, setValidating] = useState(false);

  const loadDetails = async () => {
    if (!transferId) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchTransferById(transferId);
      setTransfer(data);
    } catch (err) {
      setError(err.message || "Failed to load transfer details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [transferId]);

  const handleValidate = async () => {
    setValidating(true);
    try {
      await validateTransfer(transferId);
      await loadDetails();
      onValidated && onValidated();
    } catch (err) {
      alert(err.message || "Failed to validate transfer.");
    } finally {
      setValidating(false);
    }
  };

  if (!transferId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "700px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex-between">
          <div>
            <h2>Internal Stock Transfer Details</h2>
            {transfer && <p className="modal-subtitle">{transfer.transfer_number}</p>}
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading && <p style={{ color: "#64748b" }}>Loading details...</p>}
          {error && <div className="alert-banner error-banner">⚠️ {error}</div>}

          {transfer && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="form-row-2" style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px" }}>
                <div>
                  <small style={{ color: "#64748b" }}>Transfer Number</small>
                  <p style={{ margin: 0, fontWeight: "bold" }}>{transfer.transfer_number}</p>
                </div>
                <div>
                  <small style={{ color: "#64748b" }}>Status</small>
                  <p style={{ margin: 0 }}>
                    <span className={`status-badge ${(transfer.status || "DRAFT").toLowerCase()}`}>
                      {transfer.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="form-row-2">
                <div>
                  <strong>From Location (Source):</strong>
                  <p>{transfer.from_location || "Rack A"}</p>
                </div>
                <div>
                  <strong>To Location (Destination):</strong>
                  <p>{transfer.to_location || "Rack B"}</p>
                </div>
              </div>

              {/* Items Table */}
              <div className="items-section">
                <span style={{ fontWeight: "700", fontSize: "0.875rem" }}>Transfer Items</span>
                <div className="table-container shadow-table">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product Item</th>
                        <th>SKU</th>
                        <th>Quantity Transferred</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transfer.items && transfer.items.length > 0 ? (
                        transfer.items.map((it) => (
                          <tr key={it.id}>
                            <td>{it.product_name}</td>
                            <td><span className="sku-tag">{it.sku}</span></td>
                            <td><strong>{it.quantity}</strong> {it.unit_of_measure || "pcs"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" style={{ textAlign: "center", color: "#64748b" }}>
                            No transfer items recorded.
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
                {transfer.status !== "DONE" && (
                  <button className="btn-primary" onClick={handleValidate} disabled={validating}>
                    {validating ? "Moving Stock..." : "Execute & Complete Transfer ✓"}
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

export default TransferDetails;
