import React, { useState, useEffect } from "react";
import { updateLocation } from "../../services/warehouseService";

const EditLocationComponent = ({ isOpen, location, onClose, onSuccess }) => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location) {
      setName(location.name || "");
      setStatus(location.status || "ACTIVE");
      setError("");
    }
  }, [location, isOpen]);

  if (!isOpen || !location) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !name.trim()) {
      setError("Location name is required.");
      return;
    }

    try {
      setLoading(true);
      await updateLocation(location.id, {
        name: name.trim(),
        status,
      });

      onSuccess?.("Location updated successfully.");
      onClose();
    } catch (err) {
      console.error("Update location failed:", err);
      setError(err.message || "Failed to update location.");
    } finally {
      setLoading(false);
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
          maxWidth: "480px",
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
            padding: "18px 24px",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
              Edit Location
            </h3>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              Update location name or operational status
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit}>
          <div style={{ padding: "24px" }}>
            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "#fee2e2",
                  border: "1px solid #f87171",
                  borderRadius: "6px",
                  color: "#991b1b",
                  fontSize: "13px",
                  marginBottom: "18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Warehouse context (immutable) */}
            <div style={{ marginBottom: "14px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#64748b",
                  marginBottom: "4px",
                }}
              >
                Warehouse (Permanent Association)
              </label>
              <div
                style={{
                  padding: "8px 12px",
                  background: "#f1f5f9",
                  borderRadius: "4px",
                  fontSize: "13px",
                  color: "#334155",
                  fontWeight: 500,
                }}
              >
                🏢 {location.warehouse?.name || location.warehouseName || "Parent Warehouse"}
              </div>
            </div>

            {/* Location Name */}
            <div style={{ marginBottom: "18px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "6px",
                }}
              >
                Location / Rack Name <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{ width: "100%", padding: "9px 12px", fontSize: "14px" }}
              />
            </div>

            {/* Status */}
            <div style={{ marginBottom: "8px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#334155",
                  marginBottom: "6px",
                }}
              >
                Status
              </label>
              <select
                className="form-control"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", fontSize: "14px" }}
              >
                <option value="ACTIVE">ACTIVE (Receives stock)</option>
                <option value="INACTIVE">INACTIVE (Deactivated)</option>
              </select>
              <span style={{ fontSize: "12px", color: "#64748b", marginTop: "4px", display: "block" }}>
                Locations containing stock cannot be deactivated until stock is moved or adjusted.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              background: "#f8fafc",
            }}
          >
            <button
              type="button"
              className="btn btn-outline"
              onClick={onClose}
              disabled={loading}
              style={{ padding: "8px 16px", fontSize: "13px" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ padding: "8px 18px", fontSize: "13px" }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLocationComponent;
