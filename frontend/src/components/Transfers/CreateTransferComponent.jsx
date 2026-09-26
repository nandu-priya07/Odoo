import React, { useState, useEffect } from "react";
import { getLocationStock } from "../../services/transferService";

const CreateTransferComponent = ({
  warehouses = [],
  locations = [],
  products = [],
  onSubmit,
  onCancel,
  submitting = false,
}) => {
  const [fromWarehouseId, setFromWarehouseId] = useState("");
  const [fromLocationId, setFromLocationId] = useState("");
  const [toWarehouseId, setToWarehouseId] = useState("");
  const [toLocationId, setToLocationId] = useState("");
  const [productId, setProductId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [availableStock, setAvailableStock] = useState(null);
  const [loadingStock, setLoadingStock] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize defaults
  useEffect(() => {
    if (warehouses.length > 0 && !fromWarehouseId) {
      setFromWarehouseId(warehouses[0].id);
      setToWarehouseId(warehouses.length > 1 ? warehouses[1].id : warehouses[0].id);
    }
  }, [warehouses]);

  // Filter locations by selected warehouse
  const fromLocations = locations.filter((l) => l.warehouse_id === fromWarehouseId);
  const toLocations = locations.filter((l) => l.warehouse_id === toWarehouseId);

  // Auto-select first location when warehouse changes
  useEffect(() => {
    if (fromLocations.length > 0 && !fromLocations.some((l) => l.id === fromLocationId)) {
      setFromLocationId(fromLocations[0].id);
    } else if (fromLocations.length === 0) {
      setFromLocationId("");
    }
  }, [fromWarehouseId, fromLocations]);

  useEffect(() => {
    if (toLocations.length > 0 && !toLocations.some((l) => l.id === toLocationId)) {
      // Pick a location different from fromLocationId if possible
      const alt = toLocations.find((l) => l.id !== fromLocationId) || toLocations[0];
      setToLocationId(alt.id);
    } else if (toLocations.length === 0) {
      setToLocationId("");
    }
  }, [toWarehouseId, toLocations, fromLocationId]);

  // Selected product
  const selectedProduct = products.find((p) => p.id === productId);

  // Fetch current available stock when Product and From Location are both selected
  useEffect(() => {
    const fetchStock = async () => {
      if (!productId || !fromLocationId) {
        setAvailableStock(null);
        return;
      }
      try {
        setLoadingStock(true);
        const stock = await getLocationStock(productId, fromLocationId);
        setAvailableStock(stock);
      } catch (err) {
        console.error("Failed to load available stock:", err);
        setAvailableStock(0);
      } finally {
        setLoadingStock(false);
      }
    };

    fetchStock();
  }, [productId, fromLocationId]);

  const validate = () => {
    const errs = {};
    if (!fromWarehouseId) errs.fromWarehouse = "Source warehouse is required.";
    if (!fromLocationId) errs.fromLocation = "Source location is required.";
    if (!toWarehouseId) errs.toWarehouse = "Destination warehouse is required.";
    if (!toLocationId) errs.toLocation = "Destination location is required.";
    if (!productId) errs.product = "Product is required.";

    if (fromLocationId && toLocationId && fromLocationId === toLocationId) {
      errs.toLocation = "Source and destination locations must be different.";
    }

    const qty = parseFloat(quantity);
    if (!quantity || isNaN(qty) || qty <= 0) {
      errs.quantity = "Quantity must be greater than zero.";
    } else if (availableStock !== null && qty > availableStock) {
      errs.quantity = `Only ${availableStock} ${selectedProduct?.unit_of_measure || "units"} available at the source location.`;
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      fromLocationId,
      toLocationId,
      productId,
      quantity: parseFloat(quantity),
    });
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
          maxWidth: "600px",
          background: "#ffffff",
          borderRadius: "10px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
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
          <div>
            <h3 className="card-title" style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
              New Internal Stock Transfer
            </h3>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Move stock internally without changing total company inventory
            </span>
          </div>
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
          {/* Status Display Only */}
          <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>Initial Status:</span>
            <span className="badge badge-info">DRAFT</span>
          </div>

          {/* 1. From Warehouse & Location */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div className="form-group">
              <label className="form-label" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
                From Warehouse <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                className="form-control"
                value={fromWarehouseId}
                onChange={(e) => setFromWarehouseId(e.target.value)}
              >
                <option value="">-- Select Source Warehouse --</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              {errors.fromWarehouse && (
                <span style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "4px" }}>
                  {errors.fromWarehouse}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
                From Location <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                className="form-control"
                value={fromLocationId}
                onChange={(e) => setFromLocationId(e.target.value)}
              >
                <option value="">-- Select Source Location --</option>
                {fromLocations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              {errors.fromLocation && (
                <span style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "4px" }}>
                  {errors.fromLocation}
                </span>
              )}
            </div>
          </div>

          {/* 2. To Warehouse & Location */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div className="form-group">
              <label className="form-label" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
                To Warehouse <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                className="form-control"
                value={toWarehouseId}
                onChange={(e) => setToWarehouseId(e.target.value)}
              >
                <option value="">-- Select Destination Warehouse --</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              {errors.toWarehouse && (
                <span style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "4px" }}>
                  {errors.toWarehouse}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
                To Location <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                className="form-control"
                value={toLocationId}
                onChange={(e) => setToLocationId(e.target.value)}
              >
                <option value="">-- Select Destination Location --</option>
                {toLocations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              {errors.toLocation && (
                <span style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "4px" }}>
                  {errors.toLocation}
                </span>
              )}
            </div>
          </div>

          {/* 3. Product Selection */}
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="form-label" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
              Product <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              className="form-control"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">-- Select Product to Transfer --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
            {errors.product && (
              <span style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "4px" }}>
                {errors.product}
              </span>
            )}
          </div>

          {/* 4. Available Stock (Read-only) & Quantity Input */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            <div className="form-group">
              <label className="form-label" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
                Available Stock at Source
              </label>
              <div
                style={{
                  padding: "8px 12px",
                  background: "#f1f5f9",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: availableStock !== null && availableStock > 0 ? "#16a34a" : "#dc2626",
                  border: "1px solid #cbd5e1",
                  minHeight: "38px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {loadingStock
                  ? "Checking stock..."
                  : availableStock !== null
                  ? `${availableStock} ${selectedProduct?.unit_of_measure || "units"}`
                  : "Select product & location"}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
                Transfer Quantity <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                className="form-control"
                placeholder="e.g. 20"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={{ borderColor: errors.quantity ? "#ef4444" : "#cbd5e1" }}
              />
              {errors.quantity && (
                <span style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "4px" }}>
                  {errors.quantity}
                </span>
              )}
            </div>
          </div>

          {/* Footer buttons */}
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
              disabled={submitting || (availableStock !== null && availableStock <= 0)}
            >
              {submitting ? "Creating..." : "Create Transfer (DRAFT)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTransferComponent;
