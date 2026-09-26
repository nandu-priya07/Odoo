import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLedgerDetails } from "../../services/stockLedgerService";

const MoveHistoryDetails = ({ entry, onClose }) => {
  const navigate = useNavigate();
  const [details, setDetails] = useState(entry || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (entry && entry.id) {
      const loadDetails = async () => {
        try {
          setLoading(true);
          const data = await getLedgerDetails(entry.id);
          setDetails(data);
        } catch (err) {
          console.error("Failed to load ledger item details:", err);
          // Fallback to initial entry passed via props
          setDetails(entry);
        } finally {
          setLoading(false);
        }
      };
      loadDetails();
    }
  }, [entry]);

  if (!details) return null;

  const getTypeBadge = (type) => {
    switch (type) {
      case "RECEIPT":
        return <span className="badge badge-success">RECEIPT</span>;
      case "DELIVERY":
        return <span className="badge badge-danger">DELIVERY</span>;
      case "TRANSFER_OUT":
        return <span className="badge badge-warning">TRANSFER OUT</span>;
      case "TRANSFER_IN":
        return (
          <span className="badge badge-primary" style={{ background: "#3b82f6", color: "#fff" }}>
            TRANSFER IN
          </span>
        );
      case "ADJUSTMENT":
        return <span className="badge badge-info">ADJUSTMENT</span>;
      default:
        return <span className="badge">{type}</span>;
    }
  };

  const formatQuantity = (qty, uom = "Units") => {
    const num = parseFloat(qty);
    if (isNaN(num)) return `0 ${uom}`;
    if (num > 0) {
      return (
        <span style={{ color: "#16a34a", fontWeight: 700, fontSize: "18px" }}>
          +{num} {uom}
        </span>
      );
    }
    if (num < 0) {
      return (
        <span style={{ color: "#dc2626", fontWeight: 700, fontSize: "18px" }}>
          {num} {uom}
        </span>
      );
    }
    return (
      <span style={{ color: "#64748b", fontWeight: 600, fontSize: "18px" }}>
        0 {uom}
      </span>
    );
  };

  // Determine destination path and label based on transaction type
  const getRelatedOperationConfig = (type) => {
    switch (type) {
      case "RECEIPT":
        return {
          path: "/receipts",
          label: "Open Receipt",
          operationName: "Receipt",
        };
      case "DELIVERY":
        return {
          path: "/deliveries",
          label: "Open Delivery",
          operationName: "Delivery",
        };
      case "TRANSFER_OUT":
      case "TRANSFER_IN":
        return {
          path: "/transfers",
          label: "Open Transfer",
          operationName: "Internal Transfer",
        };
      case "ADJUSTMENT":
        return {
          path: "/adjustments",
          label: "Open Adjustment",
          operationName: "Stock Adjustment",
        };
      default:
        return {
          path: "/dashboard",
          label: "View in Dashboard",
          operationName: "Operation",
        };
    }
  };

  const relatedConfig = getRelatedOperationConfig(details.transactionType);

  const handleOpenRelated = () => {
    onClose();
    navigate(relatedConfig.path, {
      state: { search: details.referenceNumber },
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
          maxWidth: "640px",
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
              Movement Details: {details.referenceNumber || "Ledger Entry"}
            </h3>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              Recorded on{" "}
              {new Date(details.createdAt).toLocaleString(undefined, {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
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

        {/* Body */}
        <div style={{ padding: "24px", maxHeight: "75vh", overflowY: "auto" }}>
          {/* Key metadata grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                background: "#f8fafc",
                padding: "14px 16px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "#64748b", marginBottom: "6px" }}>
                Transaction Type
              </div>
              <div>{getTypeBadge(details.transactionType)}</div>
            </div>

            <div
              style={{
                background: "#f8fafc",
                padding: "14px 16px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "#64748b", marginBottom: "6px" }}>
                Reference Number
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                <code style={{ background: "#e2e8f0", padding: "2px 6px", borderRadius: "4px" }}>
                  {details.referenceNumber || "N/A"}
                </code>
              </div>
            </div>
          </div>

          {/* Product details */}
          <div
            style={{
              background: "#eff6ff",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #bfdbfe",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "#1d4ed8", marginBottom: "4px" }}>
                Product Details
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>
                {details.product?.name || "Product"}
              </div>
              <div style={{ fontSize: "13px", color: "#64748b", marginTop: "2px" }}>
                SKU: <code style={{ color: "#334155" }}>{details.product?.sku || "N/A"}</code>
              </div>
            </div>
          </div>

          {/* Location & Warehouse details */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                background: "#f8fafc",
                padding: "14px 16px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "#64748b", marginBottom: "6px" }}>
                Warehouse
              </div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>
                {details.warehouse?.name || "N/A"}
              </div>
            </div>

            <div
              style={{
                background: "#f8fafc",
                padding: "14px 16px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "#64748b", marginBottom: "6px" }}>
                Storage Location
              </div>
              <div style={{ fontSize: "15px", fontWeight: 600, color: "#0f172a" }}>
                {details.location?.name || "N/A"}
              </div>
            </div>
          </div>

          {/* Quantity Change and Quantity After */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                background: "#f8fafc",
                padding: "14px 16px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "#64748b", marginBottom: "6px" }}>
                Quantity Change
              </div>
              <div>{formatQuantity(details.quantityChange, details.product?.unitOfMeasure)}</div>
            </div>

            <div
              style={{
                background: "#f8fafc",
                padding: "14px 16px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "#64748b", marginBottom: "6px" }}>
                Quantity After Movement
              </div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#0f172a" }}>
                {details.quantityAfter} {details.product?.unitOfMeasure || "Units"}
              </div>
            </div>
          </div>

          {/* User & Technical Audit Info */}
          <div
            style={{
              padding: "14px 16px",
              background: "#f8fafc",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "13px",
              color: "#64748b",
              lineHeight: 1.6,
            }}
          >
            <div>
              <strong style={{ color: "#334155" }}>Created By:</strong> {details.createdBy || "System"}
            </div>
            <div>
              <strong style={{ color: "#334155" }}>Ledger ID:</strong>{" "}
              <code style={{ fontSize: "12px", color: "#64748b" }}>{details.id}</code>
            </div>
            {details.referenceId && (
              <div>
                <strong style={{ color: "#334155" }}>Reference ID:</strong>{" "}
                <code style={{ fontSize: "12px", color: "#64748b" }}>{details.referenceId}</code>
              </div>
            )}
            {details.relatedOperation?.status && (
              <div>
                <strong style={{ color: "#334155" }}>Operation Status:</strong>{" "}
                <span className="badge badge-success" style={{ marginLeft: "4px" }}>
                  {details.relatedOperation.status}
                </span>
              </div>
            )}
          </div>
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
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleOpenRelated}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <span>View Related Operation ({relatedConfig.label})</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveHistoryDetails;
