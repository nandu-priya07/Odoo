import React, { useState, useEffect } from "react";

const ProductForm = ({
  initialData = null,
  categories = [],
  onSubmit,
  onCancel,
  submitting = false,
}) => {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    categoryId: "",
    unitOfMeasure: "pcs",
    initialStock: 0,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        sku: initialData.sku || "",
        categoryId: initialData.category_id || "",
        unitOfMeasure: initialData.unit_of_measure || "pcs",
        initialStock: initialData.initial_stock || 0,
      });
    } else {
      setFormData({
        name: "",
        sku: "",
        categoryId: categories.length > 0 ? categories[0].id : "",
        unitOfMeasure: "pcs",
        initialStock: 0,
      });
    }
    setErrors({});
  }, [initialData, categories]);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = "Product name is required.";
    }

    if (!isEdit && !formData.sku.trim()) {
      errs.sku = "SKU / Code is required.";
    }

    if (!formData.categoryId) {
      errs.categoryId = "Category is required.";
    }

    if (!formData.unitOfMeasure) {
      errs.unitOfMeasure = "Unit of Measure is required.";
    }

    if (!isEdit) {
      const stock = parseFloat(formData.initialStock);
      if (isNaN(stock) || stock < 0) {
        errs.initialStock = "Initial stock cannot be negative (must be >= 0).";
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (isEdit) {
      onSubmit({
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        unitOfMeasure: formData.unitOfMeasure,
      });
    } else {
      onSubmit({
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        categoryId: formData.categoryId,
        unitOfMeasure: formData.unitOfMeasure,
        initialStock: parseFloat(formData.initialStock) || 0,
      });
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "20px",
      }}
    >
      <div
        className="card"
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#ffffff",
          borderRadius: "10px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
        }}
      >
        <div
          className="card-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 24px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <h3 className="card-title" style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
            {isEdit ? "Edit Product" : "New Product"}
          </h3>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: "none",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 24px" }}>
          {/* 1. Product Name */}
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="form-label" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
              Product Name <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="e.g. Steel Rods"
              value={formData.name}
              onChange={handleChange}
              style={{
                borderColor: errors.name ? "#ef4444" : "#cbd5e1",
              }}
            />
            {errors.name && (
              <span style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "4px" }}>
                {errors.name}
              </span>
            )}
          </div>

          {/* 2. SKU / Code */}
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="form-label" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
              SKU / Code <span style={{ color: "#ef4444" }}>*</span>
              {isEdit && <span style={{ fontSize: "11px", color: "#64748b", marginLeft: "6px" }}>(Cannot be modified)</span>}
            </label>
            <input
              type="text"
              name="sku"
              className="form-control"
              placeholder="e.g. SKU-00051"
              value={formData.sku}
              onChange={handleChange}
              disabled={isEdit}
              style={{
                backgroundColor: isEdit ? "#f1f5f9" : "#ffffff",
                cursor: isEdit ? "not-allowed" : "text",
                borderColor: errors.sku ? "#ef4444" : "#cbd5e1",
              }}
            />
            {errors.sku && (
              <span style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "4px" }}>
                {errors.sku}
              </span>
            )}
          </div>

          {/* 3. Category */}
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="form-label" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
              Category <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              name="categoryId"
              className="form-control"
              value={formData.categoryId}
              onChange={handleChange}
              style={{
                borderColor: errors.categoryId ? "#ef4444" : "#cbd5e1",
              }}
            >
              <option value="">-- Select Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <span style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "4px" }}>
                {errors.categoryId}
              </span>
            )}
          </div>

          {/* 4. Unit of Measure */}
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="form-label" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
              Unit of Measure <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              name="unitOfMeasure"
              className="form-control"
              value={formData.unitOfMeasure}
              onChange={handleChange}
              style={{
                borderColor: errors.unitOfMeasure ? "#ef4444" : "#cbd5e1",
              }}
            >
              <option value="pcs">pcs</option>
              <option value="kg">kg</option>
              <option value="g">g</option>
              <option value="litre">litre</option>
              <option value="box">box</option>
              <option value="meter">meter</option>
            </select>
            {errors.unitOfMeasure && (
              <span style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "4px" }}>
                {errors.unitOfMeasure}
              </span>
            )}
          </div>

          {/* 5. Initial Stock (only on creation) */}
          {!isEdit && (
            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label className="form-label" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
                Initial Stock
              </label>
              <input
                type="number"
                name="initialStock"
                className="form-control"
                min="0"
                step="any"
                placeholder="0"
                value={formData.initialStock}
                onChange={handleChange}
                style={{
                  borderColor: errors.initialStock ? "#ef4444" : "#cbd5e1",
                }}
              />
              {errors.initialStock && (
                <span style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "4px" }}>
                  {errors.initialStock}
                </span>
              )}
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              marginTop: "24px",
              paddingTop: "16px",
              borderTop: "1px solid #e2e8f0",
            }}
          >
            <button
              type="button"
              className="btn btn-outline"
              onClick={onCancel}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "Saving..." : isEdit ? "Update Product" : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
