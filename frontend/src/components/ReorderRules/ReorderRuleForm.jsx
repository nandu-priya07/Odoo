import React, { useState, useEffect } from "react";
import { fetchProducts } from "../../services/productService";

const ReorderRuleForm = ({ initialData, onSubmit, onCancel, submitting }) => {
  const [products, setProducts] = useState([]);
  const [formData, setFormData] = useState({
    product_id: "",
    minimum_stock: "",
    reorder_quantity: "",
  });

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadProducts();

    if (initialData) {
      setFormData({
        product_id: initialData.product_id || "",
        minimum_stock: initialData.minimum_stock || "",
        reorder_quantity: initialData.reorder_quantity || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      product_id: formData.product_id,
      minimum_stock: parseFloat(formData.minimum_stock) || 0,
      reorder_quantity: parseFloat(formData.reorder_quantity) || 0,
    });
  };

  return (
    <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div className="card-header">
        <h3 className="card-title">
          {initialData ? "Edit Reorder Rule" : "Create Reorder Rule"}
        </h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="form-label" style={{ display: "block", marginBottom: "6px" }}>
              Select Product *
            </label>
            <select
              name="product_id"
              className="form-control"
              value={formData.product_id}
              onChange={handleChange}
              disabled={!!initialData}
              required
            >
              <option value="">-- Choose Product --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="form-label" style={{ display: "block", marginBottom: "6px" }}>
              Minimum Stock Threshold *
            </label>
            <input
              type="number"
              step="any"
              min="0"
              name="minimum_stock"
              className="form-control"
              value={formData.minimum_stock}
              onChange={handleChange}
              placeholder="e.g. 10 (triggers low-stock alert when stock <= threshold)"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label className="form-label" style={{ display: "block", marginBottom: "6px" }}>
              Reorder Quantity *
            </label>
            <input
              type="number"
              step="any"
              min="1"
              name="reorder_quantity"
              className="form-control"
              value={formData.reorder_quantity}
              onChange={handleChange}
              placeholder="e.g. 50 (suggested replenishment quantity)"
              required
            />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-outline" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save Rule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReorderRuleForm;
