import { useState } from "react";
import "../Dashboard/Dashboard.css";

function CreateTransferComponent({ isOpen, onClose, onSubmit, locations = [], products = [] }) {
  const [fromLocationId, setFromLocationId] = useState(locations[0]?.id || "");
  const [toLocationId, setToLocationId] = useState(locations[1]?.id || locations[0]?.id || "");
  const [status, setStatus] = useState("DRAFT");
  const [items, setItems] = useState([
    { id: Date.now(), productId: products[0]?.id || "", quantity: 1 }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), productId: products[0]?.id || "", quantity: 1 }
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
    if (!fromLocationId || !toLocationId) {
      setError("Both Source and Destination locations are required.");
      return;
    }
    if (fromLocationId === toLocationId) {
      setError("Source and Destination locations cannot be identical.");
      return;
    }
    if (items.some((it) => !it.productId || Number(it.quantity) <= 0)) {
      setError("Please ensure every transfer item has a selected product and quantity > 0.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await onSubmit({
        fromLocationId,
        toLocationId,
        status,
        items: items.map((it) => ({
          productId: it.productId,
          quantity: Number(it.quantity),
        })),
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create transfer.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "700px", width: "95%" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔄 Create Internal Stock Transfer</h2>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {error && (
            <div className="alert-banner error-banner">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="create-form">
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="fromLoc">Source Location *</label>
                <select
                  id="fromLoc"
                  className="form-select"
                  value={fromLocationId}
                  onChange={(e) => setFromLocationId(e.target.value)}
                  required
                >
                  <option value="">Select Source Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="toLoc">Target Location *</label>
                <select
                  id="toLoc"
                  className="form-select"
                  value={toLocationId}
                  onChange={(e) => setToLocationId(e.target.value)}
                  required
                >
                  <option value="">Select Destination Location</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="trfStatus">Initial Status</label>
              <select
                id="trfStatus"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="DRAFT">Draft</option>
                <option value="WAITING">Waiting</option>
                <option value="READY">Ready</option>
              </select>
            </div>

            {/* Line Items */}
            <div className="items-section">
              <div className="items-header">
                <span>📦 Transfer Items</span>
              </div>

              {items.map((it) => (
                <div key={it.id} className="item-row">
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

                  <input
                    type="number"
                    className="form-input"
                    min="1"
                    placeholder="Qty"
                    value={it.quantity}
                    onChange={(e) => handleItemChange(it.id, "quantity", e.target.value)}
                    required
                  />

                  <button
                    type="button"
                    className="remove-item-btn"
                    onClick={() => handleRemoveItem(it.id)}
                    disabled={items.length <= 1}
                  >
                    ✕
                  </button>
                </div>
              ))}

              <button type="button" className="add-item-btn" onClick={handleAddItem}>
                + Add Transfer Item
              </button>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : "Create Transfer"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateTransferComponent;
