import React, { useState, useEffect } from "react";
import { getLocationStock } from "../../services/adjustmentService";

const CreateAdjustmentComponent = ({
  warehouses = [],
  locations = [],
  products = [],
  onSubmit,
  onCancel,
  submitting = false,
}) => {
  const [warehouseId, setWarehouseId] = useState("");
  const [locationId, setLocationId] = useState("");
  const [productId, setProductId] = useState("");
  const [systemQuantity, setSystemQuantity] = useState(null);
  const [physicalCount, setPhysicalCount] = useState("");
  const [reason, setReason] = useState("");
  const [loadingStock, setLoadingStock] = useState(false);
  const [errors, setErrors] = useState({});

  // Auto-select first warehouse if available
  useEffect(() => {
    if (warehouses.length > 0 && !warehouseId) {
      setWarehouseId(warehouses[0].id);
    }
  }, [warehouses]);

  // Filter locations by warehouse
  const filteredLocations = locations.filter((l) => l.warehouse_id === warehouseId);

  useEffect(() => {
    if (filteredLocations.length > 0 && !filteredLocations.some((l) => l.id === locationId)) {
      setLocationId(filteredLocations[0].id);
    } else if (filteredLocations.length === 0) {
      setLocationId("");
    }
  }, [warehouseId, filteredLocations]);

  // Fetch current stock from PostgreSQL when product and location are selected
  useEffect(() => {
    const fetchStock = async () => {
      if (!productId || !locationId) {
        setSystemQuantity(null);
        return;
      }
      try {
        setLoadingStock(true);
        const qty = await getLocationStock(productId, locationId);
        setSystemQuantity(qty);
      } catch (err) {
        console.error("Failed to load current stock:", err);
        setSystemQuantity(0);
      } finally {
        setLoadingStock(false);
      }
    };

    fetchStock();
  }, [productId, locationId]);

  const selectedProduct = products.find((p) => p.id === productId);

  // Compute difference = physicalCount - systemQuantity
  const parsedPhysical = parseFloat(physicalCount);
  const isCountValid = !isNaN(parsedPhysical) && parsedPhysical >= 0;
  const difference = isCountValid && systemQuantity !== null
    ? parsedPhysical - systemQuantity
    : null;

  const validate = () => {
    const errs = {};
    if (!warehouseId) errs.warehouse = "Warehouse is required.";
    if (!locationId) errs.location = "Location is required.";
    if (!productId) errs.product = "Product is required.";

    if (physicalCount === "" || physicalCount === null || physicalCount === undefined) {
      errs.physicalCount = "Physical count is required.";
    } else if (isNaN(parsedPhysical) || parsedPhysical < 0) {
      errs.physicalCount = "Physical count cannot be negative.";
    }

    if (!reason || !reason.trim()) {
      errs.reason = "Reason is required.";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      locationId,
      productId,
      physicalCount: parsedPhysical,
      reason: reason.trim(),
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
          maxWidth: "580px",
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
              New Stock Adjustment
            </h3>
            <span style={{ fontSize: "12px", color: "#64748b" }}>
              Reconcile recorded stock with physical count
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
          {/* Initial Status Indicator */}
          <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#64748b" }}>Initial Status:</span>
            <span className="badge badge-info">DRAFT</span>
          </div>

          {/* 1. Warehouse & Location */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
            <div className="form-group">
              <label className="form-label" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
                Warehouse <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                className="form-control"
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
              >
                <option value="">-- Select Warehouse --</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
              {errors.warehouse && (
                <span style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "4px" }}>
                  {errors.warehouse}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
                Location <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <select
                className="form-control"
                value={locationId}
                onChange={(e) => setLocationId(e.target.value)}
              >
                <option value="">-- Select Location --</option>
                {filteredLocations.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              {errors.location && (
                <span style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "4px" }}>
                  {errors.location}
                </span>
              )}
            </div>
          </div>

          {/* 2. Product Selection */}
          <div className="form-group" style={{ marginBottom: "16px" }}>
            <label className="form-label" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
              Product <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <select
              className="form-control"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
            >
              <option value="">-- Select Product --</option>
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

          {/* 3. System Quantity, Physical Count, Difference */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            {/* System Quantity (Read-only) */}
            <div className="form-group">
              <label className="form-label" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "12px" }}>
                System Quantity
              </label>
              <div
                style={{
                  padding: "8px 12px",
                  background: "#f1f5f9",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#0f172a",
                  border: "1px solid #cbd5e1",
                  minHeight: "38px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {loadingStock
                  ? "Loading..."
                  : systemQuantity !== null
                  ? `${systemQuantity} ${selectedProduct?.unit_of_measure || "units"}`
                  : "-"}
              </div>
            </div>

            {/* Physical Count (Input) */}
            <div className="form-group">
              <label className="form-label" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "12px" }}>
                Physical Count <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0"
                className="form-control"
                placeholder="Counted qty"
                value={physicalCount}
                onChange={(e) => setPhysicalCount(e.target.value)}
                style={{ borderColor: errors.physicalCount ? "#ef4444" : "#cbd5e1" }}
              />
              {errors.physicalCount && (
                <span style={{ color: "#ef4444", fontSize: "11px", display: "block", marginTop: "4px" }}>
                  {errors.physicalCount}
                </span>
              )}
            </div>

            {/* Difference (Read-only) */}
            <div className="form-group">
              <label className="form-label" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "12px" }}>
                Difference
              </label>
              <div
                style={{
                  padding: "8px 12px",
                  background: "#f8fafc",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: 700,
                  border: "1px solid #cbd5e1",
                  minHeight: "38px",
                  display: "flex",
                  alignItems: "center",
                  color:
                    difference === null
                      ? "#64748b"
                      : difference > 0
                      ? "#16a34a"
                      : difference < 0
                      ? "#dc2626"
                      : "#334155",
                }}
              >
                {difference !== null
                  ? `${difference > 0 ? `+${difference}` : difference} ${selectedProduct?.unit_of_measure || "units"}`
                  : "-"}
              </div>
            </div>
          </div>

          {/* 4. Reason */}
          <div className="form-group" style={{ marginBottom: "20px" }}>
            <label className="form-label" style={{ display: "block", marginBottom: "6px", fontWeight: 600, fontSize: "13px" }}>
              Reason <span style={{ color: "#ef4444" }}>*</span>
            </label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="e.g. 3 units damaged during transport, annual inventory cycle count, etc."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ borderColor: errors.reason ? "#ef4444" : "#cbd5e1" }}
            />
            {errors.reason && (
              <span style={{ color: "#ef4444", fontSize: "12px", display: "block", marginTop: "4px" }}>
                {errors.reason}
              </span>
            )}
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
              disabled={submitting || systemQuantity === null}
            >
              {submitting ? "Creating..." : "Create Adjustment (DRAFT)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAdjustmentComponent;
