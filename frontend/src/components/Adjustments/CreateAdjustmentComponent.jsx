import { useState } from "react";
import "../Dashboard/Dashboard.css";

function CreateAdjustmentComponent({ isOpen, onClose, onSubmit, locations = [], products = [], stockList = [] }) {
  const [locationId, setLocationId] = useState(locations[0]?.id || "");
  const [reason, setReason] = useState("Physical Stock Verification");
  const [status, setStatus] = useState("DRAFT");
  const [items, setItems] = useState([
    { id: Date.now(), productId: products[0]?.id || "", countedQuantity: 0 }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const getSystemStock = (pId, locId) => {
    if (!pId || !locId) return 0;
    const match = stockList.find(
      (s) => (s.product_id === pId || s.id === pId) && (s.location_id === locId)
    );
    return match ? Number(match.quantity) || 0 : 0;
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), productId: products[0]?.id || "", countedQuantity: 0 }
    ]);
  };

  const handleRemoveItem = (id) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!locationId) {
      setError("Location is required.");
      return;
    }
    if (items.some((it) => !it.productId)) {
      setError("Please select a product for all adjustment rows.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await onSubmit({
        locationId,
        reason: reason.trim(),
        status,
        items: items.map((it) => ({
          productId: it.productId,
          countedQuantity: Number(it.countedQuantity) || 0,
        })),
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create adjustment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "800px", width: "95%" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>⚖️ Create Stock Adjustment</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {error && <div className="alert-banner error-banner">⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className="create-form">
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="adjLoc">Target Location *</label>
                <select
                  id="adjLoc"
                  className="form-select"
                  value={locationId}
                  onChange={(e) => setLocationId(e.target.value)}
                  required
                >
                  <option value="">Select Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="adjStatus">Initial Status</label>
                <select
                  id="adjStatus"
                  className="form-select"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="DRAFT">Draft</option>
                  <option value="WAITING">Waiting</option>
                  <option value="READY">Ready</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="adjReason">Adjustment Reason *</label>
              <input
                type="text"
                id="adjReason"
                className="form-input"
                placeholder="e.g. Physical stock count / Damaged inventory"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>

            {/* Adjustment Rows Table */}
            <div className="items-section">
              <div className="items-header">
                <span>📋 Counted Items vs Recorded Stock</span>
              </div>

              <div className="table-container shadow-table">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: "35%" }}>Product *</th>
                      <th style={{ width: "20%" }}>System Quantity</th>
                      <th style={{ width: "22%" }}>Physical Counted *</th>
                      <th style={{ width: "15%" }}>Calculated Diff</th>
                      <th style={{ width: "8%", textAlign: "center" }}>Remove</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => {
                      const sysQty = getSystemStock(it.productId, locationId);
                      const countedQty = Number(it.countedQuantity) || 0;
                      const diff = countedQty - sysQty;

                      return (
                        <tr key={it.id}>
                          <td>
                            <select
                              className="form-select"
                              value={it.productId}
                              onChange={(e) => handleItemChange(it.id, "productId", e.target.value)}
                              required
                            >
                              <option value="">Select Product</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.sku})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <strong>{sysQty} units</strong>
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-input"
                              min="0"
                              value={it.countedQuantity}
                              onChange={(e) => handleItemChange(it.id, "countedQuantity", e.target.value)}
                              required
                            />
                          </td>
                          <td>
                            <span className={`stock-level-badge ${diff < 0 ? "out" : diff > 0 ? "ok" : "low"}`}>
                              {diff > 0 ? `+${diff}` : diff} units
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              className="remove-item-btn"
                              onClick={() => handleRemoveItem(it.id)}
                              disabled={items.length <= 1}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <button type="button" className="add-item-btn" onClick={handleAddItem}>
                + Add Item Count
              </button>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : "Create Stock Adjustment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateAdjustmentComponent;
