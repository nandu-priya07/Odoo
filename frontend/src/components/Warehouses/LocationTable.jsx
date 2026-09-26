import React from "react";

const LocationTable = ({
  locations,
  loading,
  pagination,
  onPageChange,
  onLimitChange,
  onView,
  onEdit,
  onDeactivate,
  onCreateNew,
  isFiltered,
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
        <div
          style={{
            display: "inline-block",
            width: "24px",
            height: "24px",
            border: "3px solid #e2e8f0",
            borderTopColor: "#3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "12px",
          }}
        />
        <p style={{ margin: 0, fontSize: "14px", fontWeight: 500 }}>
          Loading locations...
        </p>
      </div>
    );
  }

  if (!locations || locations.length === 0) {
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
          No locations found.
        </p>
        <p style={{ fontSize: "13px", color: "#64748b", margin: "0 0 16px 0" }}>
          {isFiltered
            ? "No locations match the selected filters."
            : "Define storage bins, racks, or aisles inside your warehouses."}
        </p>
        {onCreateNew && (
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: "8px 18px", fontSize: "13px" }}
            onClick={onCreateNew}
          >
            + Add Location
          </button>
        )}
      </div>
    );
  }

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
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                Location Name
              </th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                Warehouse
              </th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                Products
              </th>
              <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                Total Units
              </th>
              <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                Status
              </th>
              <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                Created Date
              </th>
              <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "12px", fontWeight: 600, color: "#64748b" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr
                key={loc.id}
                onClick={() => onView(loc)}
                style={{
                  cursor: "pointer",
                  borderBottom: "1px solid #f1f5f9",
                  transition: "background-color 0.15s ease",
                }}
                className="ledger-row-hover"
              >
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "18px" }}>📍</span>
                    <strong style={{ color: "#0f172a", fontSize: "14px" }}>
                      {loc.name}
                    </strong>
                  </div>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ color: "#334155", fontSize: "13px", fontWeight: 500 }}>
                    {loc.warehouse?.name || loc.warehouseName || "N/A"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
                  <span
                    style={{
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      padding: "2px 8px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    {loc.productCount} {loc.productCount === 1 ? "product" : "products"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right", fontWeight: 600, fontSize: "13px", color: "#0f172a" }}>
                  {loc.totalUnits.toLocaleString()} units
                </td>
                <td style={{ padding: "12px 16px", textAlign: "center" }}>
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
                <td style={{ padding: "12px 16px", color: "#64748b", fontSize: "13px", whiteSpace: "nowrap" }}>
                  {new Date(loc.createdAt).toLocaleDateString(undefined, {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                  <div style={{ display: "inline-flex", gap: "6px", alignItems: "center" }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                      onClick={() => onView(loc)}
                      title="View location inventory"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: "4px 10px", fontSize: "12px" }}
                      onClick={() => onEdit(loc)}
                      title="Edit location details"
                    >
                      Edit
                    </button>
                    {loc.status === "ACTIVE" && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{
                          padding: "4px 10px",
                          fontSize: "12px",
                          color: "#dc2626",
                          borderColor: "#fecaca",
                        }}
                        onClick={() => onDeactivate(loc)}
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

      {/* Pagination */}
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
            of <strong>{pagination.total}</strong> locations
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

export default LocationTable;
