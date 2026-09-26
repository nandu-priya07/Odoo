import React from "react";

const TransferDetails = ({ transfer, onClose }) => {
  if (!transfer) return null;

  const steps = [
    { label: "Created (DRAFT)", key: "DRAFT" },
    { label: "Waiting", key: "WAITING" },
    { label: "Ready", key: "READY" },
    { label: "Done", key: "DONE" },
  ];

  const getStepIndex = (status) => {
    switch (status) {
      case "DRAFT":
        return 0;
      case "WAITING":
        return 1;
      case "READY":
        return 2;
      case "DONE":
        return 3;
      case "CANCELED":
        return -1;
      default:
        return 0;
    }
  };

  const currentStep = getStepIndex(transfer.status);

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
          maxWidth: "680px",
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
              Transfer Details: {transfer.transfer_number}
            </h3>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              Created on {new Date(transfer.created_at).toLocaleDateString()} by {transfer.created_by_name || "Admin"}
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

        <div style={{ padding: "24px" }}>
          {/* Timeline */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "12px", textTransform: "uppercase", fontWeight: 700, color: "#64748b", marginBottom: "12px" }}>
              Transfer Timeline Workflow
            </div>
            {transfer.status === "CANCELED" ? (
              <div
                style={{
                  padding: "10px 16px",
                  background: "#fee2e2",
                  color: "#991b1b",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: 600,
                }}
              >
                ✕ This transfer was CANCELED
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                {steps.map((step, idx) => {
                  const isDone = idx <= currentStep;
                  const isCurrent = idx === currentStep;
                  return (
                    <React.Fragment key={step.key}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "80px" }}>
                        <div
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            backgroundColor: isDone ? "#2563eb" : "#e2e8f0",
                            color: isDone ? "#ffffff" : "#64748b",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                            fontSize: "13px",
                            boxShadow: isCurrent ? "0 0 0 4px rgba(37, 99, 235, 0.2)" : "none",
                          }}
                        >
                          {isDone ? "✓" : idx + 1}
                        </div>
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: isCurrent ? 700 : 500,
                            color: isCurrent ? "#0f172a" : "#64748b",
                            marginTop: "6px",
                            textAlign: "center",
                          }}
                        >
                          {step.label}
                        </span>
                      </div>
                      {idx < steps.length - 1 && (
                        <div
                          style={{
                            flex: 1,
                            height: "3px",
                            backgroundColor: idx < currentStep ? "#2563eb" : "#e2e8f0",
                            margin: "0 8px",
                            marginBottom: "18px",
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {/* Movement Details Cards (Source -> Destination) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
            {/* Source */}
            <div
              style={{
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "#64748b", marginBottom: "8px" }}>
                Source (FROM)
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                {transfer.from_warehouse_name}
              </div>
              <div style={{ fontSize: "13px", color: "#334155", marginTop: "4px" }}>
                Location: <strong>{transfer.from_location_name}</strong>
              </div>
            </div>

            {/* Destination */}
            <div
              style={{
                background: "#f8fafc",
                padding: "16px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
              }}
            >
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "#64748b", marginBottom: "8px" }}>
                Destination (TO)
              </div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a" }}>
                {transfer.to_warehouse_name}
              </div>
              <div style={{ fontSize: "13px", color: "#334155", marginTop: "4px" }}>
                Location: <strong>{transfer.to_location_name}</strong>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div
            style={{
              padding: "16px",
              background: "#eff6ff",
              borderRadius: "8px",
              border: "1px solid #bfdbfe",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 700, color: "#1d4ed8" }}>
                Product Being Transferred
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a", marginTop: "4px" }}>
                {transfer.product_name}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                SKU: <code>{transfer.sku}</code>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "12px", color: "#64748b" }}>Transfer Quantity</div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "#2563eb" }}>
                {transfer.quantity} {transfer.unit_of_measure}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid #e2e8f0",
            display: "flex",
            justifyContent: "flex-end",
            background: "#f8fafc",
          }}
        >
          <button type="button" className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferDetails;
