import React from "react";

const WarehouseTable = ({ warehouses, onEdit, onViewLocations, loading }) => {
  if (loading) {
    return <div className="loading-state">Loading warehouses...</div>;
  }

  if (!warehouses || warehouses.length === 0) {
    return <div className="empty-state">No warehouses found.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Code</th>
            <th>Address</th>
            <th>Total Locations</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {warehouses.map((wh) => (
            <tr key={wh.id}>
              <td>
                <strong style={{ color: "#0f172a" }}>{wh.name}</strong>
              </td>
              <td><code>{wh.code}</code></td>
              <td>{wh.address || "-"}</td>
              <td>
                <span className="badge badge-info">
                  {wh.locations_count || wh.locations?.length || 0} locations
                </span>
              </td>
              <td>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    className="btn btn-outline"
                    style={{ padding: "4px 10px", fontSize: "12px" }}
                    onClick={() => onEdit(wh)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ padding: "4px 10px", fontSize: "12px" }}
                    onClick={() => onViewLocations(wh)}
                  >
                    Manage Locations
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default WarehouseTable;
