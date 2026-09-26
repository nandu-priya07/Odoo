import "../Dashboard/Dashboard.css";

function TransferTable({ transfers, onViewDetails, onValidate }) {
  return (
    <div className="table-container shadow-table">
      <table className="data-table">
        <thead>
          <tr>
            <th>Transfer Reference</th>
            <th>From Location</th>
            <th>To Location</th>
            <th>Status</th>
            <th>Date</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {transfers.length > 0 ? (
            transfers.map((t) => (
              <tr key={t.id}>
                <td><strong>{t.transfer_number}</strong></td>
                <td>{t.from_location || "Rack A"}</td>
                <td>{t.to_location || "Rack B"}</td>
                <td>
                  <span className={`status-badge ${(t.status || 'DRAFT').toLowerCase()}`}>
                    {t.status}
                  </span>
                </td>
                <td>{new Date(t.created_at).toLocaleDateString()}</td>
                <td style={{ textAlign: "right" }}>
                  <div style={{ display: "flex", gap: "0.4rem", justifyContent: "flex-end" }}>
                    <button
                      className="action-btn"
                      style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                      onClick={() => onViewDetails(t.id)}
                    >
                      View Details
                    </button>
                    {t.status !== "DONE" && t.status !== "CANCELED" && (
                      <button
                        className="btn-primary"
                        style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                        onClick={() => onValidate(t.id)}
                      >
                        Execute Transfer ✓
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                No internal stock transfers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TransferTable;
