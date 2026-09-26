import React from "react";

const ProductTable = ({
  products,
  loading,
  pagination,
  onPageChange,
  onLimitChange,
  onView,
  onEdit,
  onDelete,
}) => {
  if (loading) {
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        Loading products...
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center", color: "#64748b" }}>
        No products found.
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "In Stock":
        return <span className="badge badge-success">In Stock</span>;
      case "Low Stock":
        return <span className="badge badge-warning">Low Stock</span>;
      case "Out of Stock":
        return <span className="badge badge-danger">Out of Stock</span>;
      default:
        return <span className="badge badge-info">{status || "In Stock"}</span>;
    }
  };

  return (
    <div className="card" style={{ borderRadius: "8px", overflow: "hidden", border: "1px solid #e2e8f0" }}>
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU / Code</th>
              <th>Category</th>
              <th>Unit</th>
              <th>Stock</th>
              <th>Location</th>
              <th>Status</th>
              <th style={{ textAlign: "right" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>
                  <strong style={{ color: "#0f172a" }}>{p.name}</strong>
                </td>
                <td>
                  <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", color: "#475569" }}>
                    {p.sku}
                  </code>
                </td>
                <td>{p.category_name}</td>
                <td>{p.unit_of_measure}</td>
                <td>
                  <strong
                    style={{
                      color:
                        parseFloat(p.total_stock) <= 0
                          ? "#ef4444"
                          : parseFloat(p.total_stock) <= 10
                          ? "#f59e0b"
                          : "#0f172a",
                    }}
                  >
                    {p.total_stock}
                  </strong>
                </td>
                <td style={{ color: "#64748b" }}>{p.location_name || "Main Warehouse"}</td>
                <td>{getStatusBadge(p.status)}</td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: "6px" }}>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: "4px 8px", fontSize: "12px" }}
                      onClick={() => onView(p)}
                      title="View Details"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: "4px 8px", fontSize: "12px", color: "#3b82f6", borderColor: "#bfdbfe" }}
                      onClick={() => onEdit(p)}
                      title="Edit Product"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline"
                      style={{ padding: "4px 8px", fontSize: "12px", color: "#ef4444", borderColor: "#fca5a5" }}
                      onClick={() => onDelete(p)}
                      title="Delete Product"
                    >
                      Delete
                    </button>
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
            of <strong>{pagination.total}</strong> products
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

export default ProductTable;
