import { useState, useEffect } from "react";
import "../Dashboard/Dashboard.css";

function ProductForm({ isOpen, onClose, onSubmit, initialData = null, categories = [] }) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [unitOfMeasure, setUnitOfMeasure] = useState("pcs");
  const [initialStock, setInitialStock] = useState(0);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || "");
      setSku(initialData.sku || "");
      setCategoryId(initialData.category_id || "");
      setUnitOfMeasure(initialData.unit_of_measure || "pcs");
      setInitialStock(initialData.initial_stock || 0);
    } else {
      setName("");
      setSku(`SKU-${Math.floor(100000 + Math.random() * 900000)}`);
      setCategoryId(categories.length > 0 ? categories[0].id : "");
      setUnitOfMeasure("pcs");
      setInitialStock(0);
    }
    setError("");
  }, [initialData, categories, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Product name is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await onSubmit({
        name: name.trim(),
        sku: sku.trim(),
        categoryId: categoryId || null,
        unitOfMeasure: unitOfMeasure || "pcs",
        initialStock: Number(initialStock) || 0,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: "600px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{initialData ? "✏️ Edit Product" : "📦 Add New Product"}</h2>
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
                <label htmlFor="prodName">Product Name *</label>
                <input
                  type="text"
                  id="prodName"
                  className="form-input"
                  placeholder="e.g. Ergonomic Keyboard"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="prodSku">SKU / Code *</label>
                <input
                  type="text"
                  id="prodSku"
                  className="form-input"
                  placeholder="e.g. SKU-100234"
                  value={sku}
                  onChange={(e) => setSku(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="prodCategory">Category</label>
                <select
                  id="prodCategory"
                  className="form-select"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                >
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="prodUom">Unit of Measure *</label>
                <select
                  id="prodUom"
                  className="form-select"
                  value={unitOfMeasure}
                  onChange={(e) => setUnitOfMeasure(e.target.value)}
                  required
                >
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="kg">Kilograms (kg)</option>
                  <option value="liters">Liters (liters)</option>
                  <option value="boxes">Boxes (boxes)</option>
                  <option value="meters">Meters (meters)</option>
                </select>
              </div>
            </div>

            {!initialData && (
              <div className="form-group">
                <label htmlFor="prodStock">Initial Stock Quantity</label>
                <input
                  type="number"
                  id="prodStock"
                  className="form-input"
                  min="0"
                  value={initialStock}
                  onChange={(e) => setInitialStock(e.target.value)}
                />
              </div>
            )}

            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : initialData ? "Update Product" : "Create Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;
