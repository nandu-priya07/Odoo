import "../Dashboard/Dashboard.css";

function ReceiptTable({ receipts, onViewDetails, onValidate }) {
  return (
    <div className="table-container shadow-table">
      <table className="data-table">
        <thead>
          <tr>
            <th>Receipt Number</th>
            <th>Supplier</th>
            <th>Warehouse</th>
            <th>Recipient Address</th>
            <th>Net Quantity</th>
            <th>Status</th>
            <th>Date</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {receipts.length > 0 ? (
            receipts.map((r) => (
              <tr key={r.id}>
                <td><strong>{r.receipt_number}</strong></td>
                <td>{r.supplier_name || "General Supplier"}</td>
                <td>{r.warehouse_name || "Main Warehouse"}</td>
                <td>{r.recipient_address || "Main Cargo Dock"}</td>
                <td><strong>{r.net_qty || 0} units</strong></td>
                <td>
                  <span className={`status-badge ${(r.status || 'DRAFT').toLowerCase()}`}>
                    {r.status}
                  </span>
                </td>
                <td>{r.receipt_date ? new Date(r.receipt_date).toLocaleDateString() : new Date(r.created_at).toLocaleDateString()}</td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                    <button
                      className="action-btn"
                      style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                      onClick={() => onViewDetails(r.id)}
                    >
                      View Details
                    </button>
                    {r.status !== "DONE" && r.status !== "CANCELED" && (
                      <button
                        className="btn-primary"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                        onClick={() => onValidate(r.id)}
                      >
                        Validate ✓
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                No receipts found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ReceiptTable;
