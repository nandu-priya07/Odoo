import { useState, useEffect } from "react";
import { fetchReceiptById, validateReceipt } from "../../services/receiptService";
import "../Dashboard/Dashboard.css";

function ReceiptDetails({ receiptId, onClose, onValidated }) {
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [validating, setValidating] = useState(false);

  const loadDetails = async () => {
    if (!receiptId) return;
    setLoading(true);
    setError("");
    try {
      const data = await fetchReceiptById(receiptId);
      setReceipt(data);
    } catch (err) {
      setError(err.message || "Failed to load receipt details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [receiptId]);

  const handleValidate = async () => {
    setValidating(true);
    try {
      await validateReceipt(receiptId);
      await loadDetails();
      onValidated && onValidated();
    } catch (err) {
      alert(err.message || "Failed to validate receipt.");
    } finally {
      setValidating(false);
    }
  };

  if (!receiptId) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "700px" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header flex-between">
          <div>
            <h2>Receipt Document Details</h2>
            {receipt && <p className="modal-subtitle">{receipt.receipt_number}</p>}
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {loading && <p style={{ color: "#64748b" }}>Loading details...</p>}
          {error && <div className="alert-banner error-banner">⚠️ {error}</div>}

          {receipt && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div className="form-row-2" style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px" }}>
                <div>
                  <small style={{ color: "#64748b" }}>Reference Number</small>
                  <p style={{ margin: 0, fontWeight: "bold" }}>{receipt.receipt_number}</p>
                </div>
                <div>
                  <small style={{ color: "#64748b" }}>Status</small>
                  <p style={{ margin: 0 }}>
                    <span className={`status-badge ${(receipt.status || "DRAFT").toLowerCase()}`}>
                      {receipt.status}
                    </span>
                  </p>
                </div>
              </div>

              <div className="form-row-2">
                <div>
                  <strong>Supplier:</strong>
                  <p>{receipt.supplier_name || "General Supplier"}</p>
                </div>
                <div>
                  <strong>Destination Warehouse:</strong>
                  <p>{receipt.warehouse_name || "Main Warehouse"}</p>
                </div>
              </div>

              <div className="form-row-2">
                <div>
                  <strong>Recipient Address:</strong>
                  <p>{receipt.recipient_address || "Main Cargo Dock"}</p>
                </div>
                <div>
                  <strong>Total Net Quantity:</strong>
                  <p><strong style={{ color: "#2563eb" }}>{receipt.net_qty || 0} units</strong></p>
                </div>
              </div>

              {/* Items List */}
              <div className="items-section">
                <span style={{ fontWeight: "700", fontSize: "0.875rem" }}>Line Items Breakdown</span>
                <div className="table-container shadow-table">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Product Item</th>
                        <th>SKU</th>
                        <th>Location</th>
                        <th>Quantity Received</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipt.items && receipt.items.length > 0 ? (
                        receipt.items.map((it) => (
                          <tr key={it.id}>
                            <td>{it.product_name}</td>
                            <td><span className="sku-tag">{it.sku}</span></td>
                            <td>{it.location_name || "Main Area"}</td>
                            <td><strong>{it.quantity}</strong> {it.unit_of_measure || "pcs"}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ textAlign: "center", color: "#64748b" }}>
                            No line items recorded.
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
                {receipt.status !== "DONE" && (
                  <button className="btn-primary" onClick={handleValidate} disabled={validating}>
                    {validating ? "Validating & Updating Stock..." : "Validate & Increase Stock ✓"}
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

export default ReceiptDetails;
