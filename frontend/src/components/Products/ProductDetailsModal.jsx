import React from "react";

const ProductDetailsModal = ({ product, onClose }) => {
  if (!product) return null;

  const totalLocationStock = (product.stock_by_location || []).reduce(
    (acc, loc) => acc + parseFloat(loc.quantity || 0),
    0
  );

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
          maxWidth: "720px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
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
              {product.name}
            </h3>
            <span style={{ fontSize: "13px", color: "#64748b" }}>
              SKU: <code>{product.sku}</code>
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

        {/* Content Body */}
        <div style={{ padding: "24px", overflowY: "auto", flex: 1 }}>
          {/* Key Attributes */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "16px",
              marginBottom: "24px",
              background: "#f8fafc",
              padding: "16px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
            }}
          >
            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 600, color: "#64748b" }}>
                Category
              </div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a", marginTop: "2px" }}>
                {product.category_name || "Uncategorized"}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 600, color: "#64748b" }}>
                Unit of Measure
              </div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#0f172a", marginTop: "2px" }}>
                {product.unit_of_measure}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 600, color: "#64748b" }}>
                Total Stock
              </div>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#2563eb", marginTop: "2px" }}>
                {product.total_stock} {product.unit_of_measure}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", fontWeight: 600, color: "#64748b" }}>
                Reorder Rule
              </div>
              <div style={{ fontSize: "13px", fontWeight: 500, color: "#0f172a", marginTop: "2px" }}>
                Min: {product.reorder_minimum !== null ? product.reorder_minimum : "None"} | Qty:{" "}
                {product.reorder_quantity !== null ? product.reorder_quantity : "None"}
              </div>
            </div>
          </div>

          {/* Stock by Location */}
          <div style={{ marginBottom: "24px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "10px" }}>
              Stock by Location
            </h4>
            {!product.stock_by_location || product.stock_by_location.length === 0 ? (
              <div style={{ fontSize: "13px", color: "#64748b", fontStyle: "italic", padding: "8px 0" }}>
                No active stock recorded in specific locations.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table" style={{ fontSize: "13px" }}>
                  <thead>
                    <tr>
                      <th>Warehouse</th>
                      <th>Location / Rack</th>
                      <th style={{ textAlign: "right" }}>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.stock_by_location.map((loc, idx) => (
                      <tr key={idx}>
                        <td><strong>{loc.warehouse_name}</strong></td>
                        <td>{loc.location_name} {loc.location_code ? `(${loc.location_code})` : ""}</td>
                        <td style={{ textAlign: "right" }}>
                          <strong>{loc.quantity}</strong> {product.unit_of_measure}
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: "#f8fafc", fontWeight: 700 }}>
                      <td colSpan="2">Total Location Stock</td>
                      <td style={{ textAlign: "right", color: "#2563eb" }}>
                        {totalLocationStock} {product.unit_of_measure}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Stock Movements */}
          <div>
            <h4 style={{ fontSize: "15px", fontWeight: 700, color: "#0f172a", marginBottom: "10px" }}>
              Recent Stock Movements
            </h4>
            {!product.recent_movements || product.recent_movements.length === 0 ? (
              <div style={{ fontSize: "13px", color: "#64748b", fontStyle: "italic", padding: "8px 0" }}>
                No recent movements recorded for this product.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table" style={{ fontSize: "13px" }}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Location</th>
                      <th style={{ textAlign: "right" }}>Change</th>
                      <th style={{ textAlign: "right" }}>Stock After</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.recent_movements.map((move) => (
                      <tr key={move.id}>
                        <td>{new Date(move.created_at).toLocaleDateString()}</td>
                        <td>
                          <span className="badge badge-info">{move.transaction_type}</span>
                        </td>
                        <td>{move.location_name || move.warehouse_name || "-"}</td>
                        <td
                          style={{
                            textAlign: "right",
                            fontWeight: 600,
                            color: parseFloat(move.quantity_change) >= 0 ? "#16a34a" : "#dc2626",
                          }}
                        >
                          {parseFloat(move.quantity_change) >= 0 ? `+${move.quantity_change}` : move.quantity_change}{" "}
                          {product.unit_of_measure}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {move.quantity_after} {product.unit_of_measure}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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

export default ProductDetailsModal;
