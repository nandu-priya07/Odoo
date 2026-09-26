import "../Dashboard/Dashboard.css";

function ProductTable({ products, onEdit, onDelete, onViewDetails }) {
  return (
    <div className="table-container shadow-table">
      <table className="data-table">
        <thead>
          <tr>
            <th>Product Name</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Unit of Measure</th>
            <th>Total Stock</th>
            <th>Status</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length > 0 ? (
            products.map((p) => {
              const stock = Number(p.total_stock !== undefined ? p.total_stock : p.initial_stock || 0);
              const status = stock <= 0 ? "Out of Stock" : stock <= 50 ? "Low Stock" : "Optimal";
              const statusClass = stock <= 0 ? "out-of-stock" : stock <= 50 ? "low-stock" : "optimal";

              return (
                <tr key={p.id}>
                  <td>
                    <strong>{p.name}</strong>
                  </td>
                  <td>
                    <span className="sku-tag">{p.sku}</span>
                  </td>
                  <td>{p.category_name || "General"}</td>
                  <td>{p.unit_of_measure || "pcs"}</td>
                  <td>
                    <strong>{stock}</strong> {p.unit_of_measure || "pcs"}
                  </td>
                  <td>
                    <span className={`alert-status ${statusClass}`}>{status}</span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                      <button
                        className="action-btn"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                        onClick={() => onViewDetails(p)}
                      >
                        View
                      </button>
                      <button
                        className="action-btn"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                        onClick={() => onEdit(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem", color: "#dc2626", borderColor: "#fecaca" }}
                        onClick={() => onDelete(p.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="7" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                No products found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductTable;
