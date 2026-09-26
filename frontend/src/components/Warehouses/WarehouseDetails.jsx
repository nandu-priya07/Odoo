import React, { useState, useEffect } from "react";
import {
  getWarehouse,
  getLocation,
  deactivateLocation,
} from "../../services/warehouseService";

const WarehouseDetails = ({
  warehouseId,
  onClose,
  onEditWarehouse,
  onAddLocation,
  onEditLocation,
  onDeactivateWarehouse,
}) => {
  const [warehouse, setWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sub-modal for location inventory details
  const [viewingLocation, setViewingLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState("");

  const loadDetails = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getWarehouse(warehouseId);
      setWarehouse(data);
    } catch (err) {
      console.error("Failed to load warehouse details:", err);
      setError(err.message || "Unable to load warehouse details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (warehouseId) {
      loadDetails();
    }
  }, [warehouseId]);

  // Open location inventory details modal
  const handleInspectLocation = async (loc) => {
    try {
      setLocLoading(true);
      setLocError("");
      const locData = await getLocation(loc.id);
      setViewingLocation(locData);
    } catch (err) {
      console.error("Failed to load location details:", err);
      setLocError(err.message || "Unable to load location inventory.");
    } finally {
      setLocLoading(false);
    }
  };

  // Deactivate a location
  const handleDeactivateLoc = async (loc) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate location "${loc.name}"?`
    );
    if (!confirmed) return;

    try {
      await deactivateLocation(loc.id);
      await loadDetails();
      if (viewingLocation && viewingLocation.id === loc.id) {
        setViewingLocation(null);
      }
    } catch (err) {
      alert(err.message || "Unable to deactivate location.");
    }
  };

  if (!warehouseId) return null;

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
          maxWidth: "850px",
          maxHeight: "90vh",
          background: "#ffffff",
          borderRadius: "10px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          className="card-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            padding: "20px 24px",
            borderBottom: "1px solid #e2e8f0",
            background: "#f8fafc",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ margin: 0, fontSize: "20px", fontWeight: 700, color: "#0f172a" }}>
                {warehouse?.name || "Warehouse Details"}
              </h2>
              {warehouse && (
                <span
                  className={`badge ${
                    warehouse.status === "ACTIVE" ? "badge-success" : "badge-secondary"
                  }`}
                  style={
                    warehouse.status === "ACTIVE"
                      ? { background: "#dcfce7", color: "#166534" }
                      : { background: "#f1f5f9", color: "#64748b" }
                  }
                >
                  {warehouse.status}
                </span>
              )}
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#64748b" }}>
              {warehouse?.address || "No address specified"}
            </p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {warehouse && (
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "6px 12px", fontSize: "12px" }}
                onClick={() => onEditWarehouse?.(warehouse)}
              >
                ✏️ Edit Warehouse
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "22px",
                cursor: "pointer",
                color: "#64748b",
                marginLeft: "8px",
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
              Loading warehouse details...
            </div>
          ) : error ? (
            <div
              style={{
                padding: "16px",
                background: "#fee2e2",
                border: "1px solid #f87171",
                borderRadius: "8px",
                color: "#991b1b",
              }}
            >
              {error}
            </div>
          ) : warehouse ? (
            <>
              {/* Summary KPIs */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div
                  style={{
                    background: "#f8fafc",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <div style={{ fontSize: "12px", textTransform: "uppercase", color: "#64748b", fontWeight: 600 }}>
                    Locations / Racks
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
                    {warehouse.locationCount}
                  </div>
                </div>

                <div
                  style={{
                    background: "#eff6ff",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  <div style={{ fontSize: "12px", textTransform: "uppercase", color: "#1d4ed8", fontWeight: 600 }}>
                    Total Products
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: 700, color: "#1e40af", marginTop: "4px" }}>
                    {warehouse.totalProducts}
                  </div>
                </div>

                <div
                  style={{
                    background: "#f0fdf4",
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <div style={{ fontSize: "12px", textTransform: "uppercase", color: "#15803d", fontWeight: 600 }}>
                    Total Stock Units
                  </div>
                  <div style={{ fontSize: "24px", fontWeight: 700, color: "#166534", marginTop: "4px" }}>
                    {warehouse.totalUnits.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Locations Section Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                    Storage Locations & Racks ({warehouse.locations?.length || 0})
                  </h3>
                  <span style={{ fontSize: "12px", color: "#64748b" }}>
                    Internal aisles, shelves, and storage zones belonging to this facility
                  </span>
                </div>

                {warehouse.status === "ACTIVE" && (
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ padding: "6px 14px", fontSize: "13px" }}
                    onClick={() => onAddLocation?.(warehouse.id)}
                  >
                    + Add Location
                  </button>
                )}
              </div>

              {/* Locations Table */}
              {!warehouse.locations || warehouse.locations.length === 0 ? (
                <div
                  style={{
                    padding: "32px",
                    textAlign: "center",
                    background: "#f8fafc",
                    borderRadius: "8px",
                    border: "1px dashed #cbd5e1",
                    color: "#64748b",
                  }}
                >
                  <p style={{ margin: "0 0 10px 0", fontSize: "14px" }}>
                    No storage locations defined for this warehouse yet.
                  </p>
                  {warehouse.status === "ACTIVE" && (
                    <button
                      type="button"
                      className="btn btn-primary"
                      style={{ padding: "6px 14px", fontSize: "13px" }}
                      onClick={() => onAddLocation?.(warehouse.id)}
                    >
                      + Add Location
                    </button>
                  )}
                </div>
              ) : (
                <div
                  style={{
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                        <th style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                          Location
                        </th>
                        <th style={{ padding: "10px 14px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                          Products
                        </th>
                        <th style={{ padding: "10px 14px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                          Units
                        </th>
                        <th style={{ padding: "10px 14px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                          Status
                        </th>
                        <th style={{ padding: "10px 14px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {warehouse.locations.map((loc) => (
                        <tr
                          key={loc.id}
                          onClick={() => handleInspectLocation(loc)}
                          style={{
                            cursor: "pointer",
                            borderBottom: "1px solid #f1f5f9",
                            transition: "background 0.15s ease",
                          }}
                          className="ledger-row-hover"
                        >
                          <td style={{ padding: "10px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span>📍</span>
                              <strong style={{ color: "#0f172a", fontSize: "13px" }}>
                                {loc.name}
                              </strong>
                            </div>
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "center" }}>
                            <span
                              style={{
                                background: "#eff6ff",
                                color: "#1d4ed8",
                                padding: "2px 8px",
                                borderRadius: "10px",
                                fontSize: "12px",
                                fontWeight: 600,
                              }}
                            >
                              {loc.productCount}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 600, fontSize: "13px" }}>
                            {loc.totalUnits.toLocaleString()}
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "center" }}>
                            <span
                              className={`badge ${
                                loc.status === "ACTIVE" ? "badge-success" : "badge-secondary"
                              }`}
                              style={
                                loc.status === "ACTIVE"
                                  ? { background: "#dcfce7", color: "#166534" }
                                  : { background: "#f1f5f9", color: "#64748b" }
                              }
                            >
                              {loc.status || "ACTIVE"}
                            </span>
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                            <div style={{ display: "inline-flex", gap: "6px" }}>
                              <button
                                type="button"
                                className="btn btn-outline"
                                style={{ padding: "3px 8px", fontSize: "11px" }}
                                onClick={() => handleInspectLocation(loc)}
                                title="View live inventory stored in this location"
                              >
                                View Stock
                              </button>
                              <button
                                type="button"
                                className="btn btn-outline"
                                style={{ padding: "3px 8px", fontSize: "11px" }}
                                onClick={() => onEditLocation?.({ ...loc, warehouseId: warehouse.id, warehouseName: warehouse.name })}
                                title="Edit location name"
                              >
                                Edit
                              </button>
                              {loc.status === "ACTIVE" && (
                                <button
                                  type="button"
                                  className="btn btn-outline"
                                  style={{
                                    padding: "3px 8px",
                                    fontSize: "11px",
                                    color: "#dc2626",
                                    borderColor: "#fecaca",
                                  }}
                                  onClick={() => handleDeactivateLoc(loc)}
                                  title="Deactivate location"
                                >
                                  Deactivate
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#f8fafc",
          }}
        >
          <div>
            {warehouse && warehouse.status === "ACTIVE" && onDeactivateWarehouse && (
              <button
                type="button"
                className="btn btn-outline"
                style={{
                  color: "#dc2626",
                  borderColor: "#fecaca",
                  padding: "6px 14px",
                  fontSize: "13px",
                }}
                onClick={() => onDeactivateWarehouse(warehouse)}
              >
                Deactivate Warehouse
              </button>
            )}
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: "6px 16px", fontSize: "13px" }}
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>

      {/* Submodal: Location Stock Inventory Details */}
      {viewingLocation && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1100,
            padding: "20px",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "680px",
              maxHeight: "85vh",
              background: "#ffffff",
              borderRadius: "10px",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "18px 24px",
                borderBottom: "1px solid #e2e8f0",
                background: "#f8fafc",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "20px" }}>📍</span>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                    Location: {viewingLocation.name}
                  </h3>
                  <span
                    className={`badge ${
                      viewingLocation.status === "ACTIVE" ? "badge-success" : "badge-secondary"
                    }`}
                    style={
                      viewingLocation.status === "ACTIVE"
                        ? { background: "#dcfce7", color: "#166534" }
                        : { background: "#f1f5f9", color: "#64748b" }
                    }
                  >
                    {viewingLocation.status}
                  </span>
                </div>
                <span style={{ fontSize: "13px", color: "#64748b", marginTop: "2px", display: "block" }}>
                  Warehouse: <strong>{viewingLocation.warehouse?.name}</strong>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setViewingLocation(null)}
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

            {/* Inventory Body */}
            <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
              {/* Summary info */}
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  marginBottom: "18px",
                  padding: "12px 16px",
                  background: "#eff6ff",
                  borderRadius: "8px",
                  border: "1px solid #bfdbfe",
                }}
              >
                <div>
                  <span style={{ fontSize: "12px", color: "#1e40af", display: "block" }}>Products</span>
                  <strong style={{ fontSize: "18px", color: "#1e3a8a" }}>
                    {viewingLocation.productCount || 0}
                  </strong>
                </div>
                <div style={{ borderLeft: "1px solid #bfdbfe", paddingLeft: "16px" }}>
                  <span style={{ fontSize: "12px", color: "#1e40af", display: "block" }}>Total Units</span>
                  <strong style={{ fontSize: "18px", color: "#1e3a8a" }}>
                    {(viewingLocation.totalUnits || 0).toLocaleString()}
                  </strong>
                </div>
              </div>

              <h4 style={{ margin: "0 0 10px 0", fontSize: "14px", fontWeight: 700, color: "#334155" }}>
                Stored Inventory
              </h4>

              {!viewingLocation.inventory || viewingLocation.inventory.length === 0 ? (
                <div
                  style={{
                    padding: "36px 20px",
                    textAlign: "center",
                    color: "#64748b",
                    background: "#f8fafc",
                    borderRadius: "6px",
                    border: "1px dashed #e2e8f0",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "14px" }}>
                    No inventory stored at this location.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    borderRadius: "6px",
                    overflow: "hidden",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                        <th style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                          Product
                        </th>
                        <th style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                          SKU
                        </th>
                        <th style={{ padding: "10px 14px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                          Quantity
                        </th>
                        <th style={{ padding: "10px 14px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                          Unit
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewingLocation.inventory.map((item) => (
                        <tr key={item.productId || item.sku} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "10px 14px" }}>
                            <strong style={{ color: "#0f172a", fontSize: "13px" }}>
                              {item.productName}
                            </strong>
                          </td>
                          <td style={{ padding: "10px 14px" }}>
                            <code style={{ fontSize: "12px", color: "#64748b" }}>{item.sku}</code>
                          </td>
                          <td style={{ padding: "10px 14px", textAlign: "right", fontWeight: 700, color: "#0f172a" }}>
                            {item.quantity.toLocaleString()}
                          </td>
                          <td style={{ padding: "10px 14px", color: "#64748b", fontSize: "13px" }}>
                            {item.unit}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Submodal Footer */}
            <div
              style={{
                padding: "14px 24px",
                borderTop: "1px solid #e2e8f0",
                display: "flex",
                justifyContent: "flex-end",
                background: "#f8fafc",
              }}
            >
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "6px 16px", fontSize: "13px" }}
                onClick={() => setViewingLocation(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseDetails;
