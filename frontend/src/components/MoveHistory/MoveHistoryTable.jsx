import "../Dashboard/Dashboard.css";

function MoveHistoryTable({ ledger }) {
  return (
    <div className="table-container shadow-table">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>Product Name</th>
            <th>SKU</th>
            <th>Transaction Type</th>
            <th>Location</th>
            <th>Qty Change</th>
            <th>Qty After</th>
            <th>Performed By</th>
          </tr>
        </thead>
        <tbody>
          {ledger.length > 0 ? (
            ledger.map((entry) => {
              const change = Number(entry.quantity_change);
              const changeBadgeClass = change > 0 ? "optimal" : change < 0 ? "out-of-stock" : "low-stock";
              const formattedChange = change > 0 ? `+${change}` : `${change}`;

              return (
                <tr key={entry.id}>
                  <td>{new Date(entry.created_at).toLocaleString()}</td>
                  <td><strong>{entry.product_name}</strong></td>
                  <td><span className="sku-tag">{entry.sku}</span></td>
                  <td>
                    <span className={`type-badge ${(entry.transaction_type || 'receipt').toLowerCase().replace('_in', '').replace('_out', '')}`}>
                      {entry.transaction_type}
                    </span>
                  </td>
                  <td>{entry.location_name || entry.warehouse_name || "Main Area"}</td>
                  <td>
                    <span className={`alert-status ${changeBadgeClass}`}>
                      {formattedChange} {entry.unit_of_measure || "pcs"}
                    </span>
                  </td>
                  <td><strong>{entry.quantity_after} {entry.unit_of_measure || "pcs"}</strong></td>
                  <td>{entry.user_name || "System Admin"}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                No stock ledger movement history found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default MoveHistoryTable;
