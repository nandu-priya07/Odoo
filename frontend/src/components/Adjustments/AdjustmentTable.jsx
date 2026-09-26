import React from "react";

const AdjustmentTable = ({
  adjustments,
  loading,
  pagination,
  onPageChange,
  onLimitChange,
  onView,
  onStatusChange,
  onValidate,
  onCancel,
}) => {
  if (loading) {
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        Loading stock adjustments...
      </div>
    );
  }

  if (!adjustments || adjustments.length === 0) {
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        No stock adjustments found.
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "DRAFT":
        return <span className="badge badge-info">DRAFT</span>;
      case "WAITING":
        return <span className="badge badge-warning">WAITING</span>;
      case "READY":
        return <span className="badge badge-primary" style={{ background: "#3b82f6", color: "#fff" }}>READY</span>;
      case "DONE":
        return <span className="badge badge-success">DONE</span>;
      case "CANCELED":
        return <span className="badge badge-danger">CANCELED</span>;
      default:
        return <span className="badge">{status}</span>;
    }
  };

  const formatDifference = (diff, uom) => {
    const num = parseFloat(diff);
    if (isNaN(num)) return `0 ${uom}`;
    if (num > 0) {
      return <span style={{ color: "#16a34a", fontWeight: 700 }}>+{num} {uom}</span>;
    }
    if (num < 0) {
      return <span style={{ color: "#dc2626", fontWeight: 700 }}>{num} {uom}</span>;
    }
    return <span style={{ color: "#64748b", fontWeight: 600 }}>0 {uom}</span>;
  };

  return (
    <div className="card" style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Adjustment No.</th>
              <th>Product</th>
              <th>Warehouse</th>
              <th>Location</th>
              <th>System Qty</th>
              <th>Counted Qty</th>
              <th>Difference</th>
              <th>Status</th>
              <th>Created Date</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {adjustments.map((adj) => (
              <tr key={adj.id}>
                <td>
                  <strong style={{ color: "#0f172a" }}>{adj.adjustment_number}</strong>
                </td>
                <td>
                  <div>
                    <strong>{adj.product_name}</strong>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{adj.sku}</div>
                  </div>
                </td>
                <td>{adj.warehouse_name}</td>
                <td>{adj.location_name}</td>
                <td>
                  <span>{adj.system_quantity}</span> {adj.unit_of_measure}
                </td>
                <td>
                  <strong>{adj.counted_quantity}</strong> {adj.unit_of_measure}
                </td>
                <td>
                  {formatDifference(adj.difference, adj.unit_of_measure)}
                </td>
                <td>{getStatusBadge(adj.status)}</td>
                <td style={{ color: "#64748b", fontSize: "13px" }}>
                  {new Date(adj.created_at).toLocaleDateString()}
                </td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {/* View Action - always available */}
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: "4px 8px", fontSize: "12px" }}
                      onClick={() => onView(adj)}
                    >
                      View
                    </button>

                    {/* DRAFT -> WAITING */}
                    {adj.status === "DRAFT" && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: "4px 8px", fontSize: "12px", color: "#f59e0b", borderColor: "#fde68a" }}
                        onClick={() => onStatusChange(adj, "WAITING")}
                      >
                        Mark Waiting
                      </button>
                    )}

                    {/* WAITING -> READY */}
                    {adj.status === "WAITING" && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: "4px 8px", fontSize: "12px", color: "#3b82f6", borderColor: "#bfdbfe" }}
                        onClick={() => onStatusChange(adj, "READY")}
                      >
                        Mark Ready
                      </button>
                    )}

                    {/* READY -> VALIDATE (DONE) */}
                    {adj.status === "READY" && (
                      <button
                        type="button"
                        className="btn btn-primary"
                        style={{ padding: "4px 10px", fontSize: "12px" }}
                        onClick={() => onValidate(adj)}
                      >
                        Validate
                      </button>
                    )}

                    {/* CANCEL - only allowed for DRAFT, WAITING, READY */}
                    {["DRAFT", "WAITING", "READY"].includes(adj.status) && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: "4px 8px", fontSize: "12px", color: "#ef4444", borderColor: "#fca5a5" }}
                        onClick={() => onCancel(adj)}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      {pagination && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            borderTop: "1px solid #e2e8f0",
            background: "#f8fafc",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ fontSize: "13px", color: "#64748b" }}>
            Showing <strong>{(pagination.page - 1) * pagination.limit + 1}</strong> to{" "}
            <strong>
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </strong>{" "}
            of <strong>{pagination.total}</strong> adjustments
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#64748b" }}>
              <span>Show:</span>
              <select
                className="form-control"
                style={{ width: "auto", padding: "4px 8px", fontSize: "13px" }}
                value={pagination.limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
              <span>per page</span>
            </div>

            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "4px 10px", fontSize: "13px" }}
                disabled={pagination.page <= 1}
                onClick={() => onPageChange(pagination.page - 1)}
              >
                ← Prev
              </button>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "0 8px",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#334155",
                }}
              >
                Page {pagination.page} of {pagination.totalPages || 1}
              </span>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: "4px 10px", fontSize: "13px" }}
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => onPageChange(pagination.page + 1)}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdjustmentTable;
