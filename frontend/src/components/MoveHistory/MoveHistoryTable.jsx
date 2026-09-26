import React from "react";

const MoveHistoryTable = ({
  entries,
  loading,
  pagination,
  onPageChange,
  onLimitChange,
  onViewDetails,
  isFiltered = false,
  onClearFilters,
}) => {
  if (loading) {
    return (
      <div
        className="card"
        style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "#64748b",
          background: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "inline-block", width: "24px", height: "24px", border: "3px solid #e2e8f0", borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: "12px" }}></div>
        <p style={{ margin: 0, fontSize: "14px", fontWeight: 500 }}>Loading inventory movements...</p>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div
        className="card"
        style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "#64748b",
          background: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <p style={{ fontSize: "16px", fontWeight: 600, color: "#334155", margin: "0 0 8px 0" }}>
          No inventory movements found.
        </p>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0" }}>
          {isFiltered
            ? "No movements matched the selected filters. Try changing or clearing your filters."
            : "No inventory ledger transactions recorded yet."}
        </p>
        {isFiltered && onClearFilters && (
          <button
            type="button"
            className="btn btn-outline"
            style={{ padding: "6px 16px", fontSize: "13px" }}
            onClick={onClearFilters}
          >
            Clear Filters
          </button>
        )}
      </div>
    );
  }

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

  const formatQuantityChange = (qty, uom = "Units") => {
    const num = parseFloat(qty);
    if (isNaN(num)) return `0 ${uom}`;
    if (num > 0) {
      return (
        <span style={{ color: "#16a34a", fontWeight: 700 }}>
          +{num} {uom}
        </span>
      );
    }
    if (num < 0) {
      return (
        <span style={{ color: "#dc2626", fontWeight: 700 }}>
          {num} {uom}
        </span>
      );
    }
    return (
      <span style={{ color: "#64748b", fontWeight: 600 }}>
        0 {uom}
      </span>
    );
  };

  return (
    <div
      className="card"
      style={{
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        background: "#ffffff",
      }}
    >
      <div className="table-responsive">
        <table className="data-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Date & Time</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Transaction Type</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Reference No.</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Product</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>SKU</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Warehouse / Location</th>
              <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Quantity Change</th>
              <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Quantity After</th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Created By</th>
              <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                onClick={() => onViewDetails(entry)}
                style={{
                  cursor: "pointer",
                  borderBottom: "1px solid #f1f5f9",
                  transition: "background-color 0.15s ease",
                }}
                className="ledger-row-hover"
              >
                <td style={{ padding: "12px 16px", color: "#64748b", fontSize: "13px", whiteSpace: "nowrap" }}>
                  {new Date(entry.createdAt).toLocaleString(undefined, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td style={{ padding: "12px 16px" }}>{getTypeBadge(entry.transactionType)}</td>
                <td style={{ padding: "12px 16px" }}>
                  <code style={{ background: "#f1f5f9", padding: "3px 7px", borderRadius: "4px", color: "#334155", fontSize: "12px", fontWeight: 600 }}>
                    {entry.referenceNumber}
                  </code>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <strong style={{ color: "#0f172a", fontSize: "13px" }}>{entry.product.name}</strong>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <code style={{ color: "#64748b", fontSize: "12px" }}>{entry.product.sku}</code>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div>
                    <span style={{ fontSize: "13px", color: "#0f172a", fontWeight: 500 }}>{entry.warehouse.name}</span>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{entry.location.name}</div>
                  </div>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                  {formatQuantityChange(entry.quantityChange, entry.product.unitOfMeasure)}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, fontSize: "13px", color: "#0f172a", whiteSpace: "nowrap" }}>
                  {entry.quantityAfter} {entry.product.unitOfMeasure}
                </td>
                <td style={{ padding: "12px 16px", fontSize: "13px", color: "#475569" }}>
                  {entry.createdBy || "System"}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: "4px 10px", fontSize: "12px" }}
                    onClick={() => onViewDetails(entry)}
                  >
                    View
                  </button>
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
            Showing <strong>{pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}</strong> to{" "}
            <strong>
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </strong>{" "}
            of <strong>{pagination.total}</strong> movements
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

export default MoveHistoryTable;
