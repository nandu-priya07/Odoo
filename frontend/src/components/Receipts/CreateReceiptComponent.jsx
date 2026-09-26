import { useState, useMemo } from "react";
import "../Dashboard/Dashboard.css";

function CreateReceiptComponent({ isOpen, onClose, onSubmit, suppliers = [], warehouses = [], products = [], locations = [] }) {
  const [supplierId, setSupplierId] = useState("");
  const [warehouseId, setWarehouseId] = useState(warehouses[0]?.id || "");
  const [receiptDate, setReceiptDate] = useState(new Date().toISOString().split("T")[0]);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [items, setItems] = useState([
    { id: Date.now(), productId: products[0]?.id || "", locationId: locations[0]?.id || "", quantity: 1 }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const computedNetQty = useMemo(() => {
    return items.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
  }, [items]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), productId: products[0]?.id || "", locationId: locations[0]?.id || "", quantity: 1 }
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
    if (!warehouseId) {
      setError("Destination Warehouse is required.");
      return;
    }
    if (items.some((it) => !it.productId || Number(it.quantity) <= 0)) {
      setError("Please ensure every product line item has a selected product and quantity > 0.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await onSubmit({
        supplierId: supplierId || null,
        warehouseId,
        recipientAddress,
        receiptDate,
        status,
        items: items.map((it) => ({
          productId: it.productId,
          locationId: it.locationId || null,
          quantity: Number(it.quantity),
        })),
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to create receipt.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: "750px", width: "95%" }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>📥 Create New Receipt Document</h2>
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
                <label htmlFor="recSupplier">Supplier</label>
                <select
                  id="recSupplier"
                  className="form-select"
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                >
                  <option value="">Select Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="recWarehouse">Destination Warehouse *</label>
                <select
                  id="recWarehouse"
                  className="form-select"
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  required
                >
                  <option value="">Select Warehouse</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="recDate">Receipt Date *</label>
                <input
                  type="date"
                  id="recDate"
                  className="form-input"
                  value={receiptDate}
                  onChange={(e) => setReceiptDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="recStatus">Initial Status</label>
                <select
                  id="recStatus"
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
              <label htmlFor="recAddress">Recipient Address</label>
              <input
                type="text"
                id="recAddress"
                className="form-input"
                placeholder="e.g. Building A, Dock 2, 100 Logistics Blvd"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
            </div>

            {/* Line Items */}
            <div className="items-section">
              <div className="items-header">
                <span>📦 Product Line Items</span>
                <span className="net-qty-badge">Net Qty: {computedNetQty} units</span>
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
                + Add Product Line Item
              </button>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : "Create Receipt"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateReceiptComponent;
