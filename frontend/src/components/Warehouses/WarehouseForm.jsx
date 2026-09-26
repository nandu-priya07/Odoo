import React, { useState, useEffect } from "react";

const WarehouseForm = ({ initialData, onSubmit, onCancel, submitting }) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    address: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        code: initialData.code || "",
        address: initialData.address || "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="card" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <div className="card-header">
        <h3 className="card-title">
          {initialData ? "Edit Warehouse" : "Create New Warehouse"}
        </h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="form-label" style={{ display: "block", marginBottom: "6px" }}>
              Warehouse Name *
            </label>
            <input
              type="text"
              name="name"
              className="form-control"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Main Distribution Center"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="form-label" style={{ display: "block", marginBottom: "6px" }}>
              Warehouse Code *
            </label>
            <input
              type="text"
              name="code"
              className="form-control"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g. WH-MAIN"
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label className="form-label" style={{ display: "block", marginBottom: "6px" }}>
              Address
            </label>
            <textarea
              name="address"
              className="form-control"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              placeholder="Full address of the warehouse"
            />
          </div>

          <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
            <button type="button" className="btn btn-outline" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : initialData ? "Update Warehouse" : "Create Warehouse"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WarehouseForm;
