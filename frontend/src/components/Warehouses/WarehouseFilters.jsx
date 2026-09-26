import React from "react";

const WarehouseFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  onReset,
  warehouseId,
  setWarehouseId,
  warehouses = [],
  showWarehouseFilter = false,
}) => {
  return (
    <div
      className="card"
      style={{
        padding: "16px 20px",
        marginBottom: "20px",
        background: "#ffffff",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: showWarehouseFilter
            ? "repeat(auto-fit, minmax(200px, 1fr))"
            : "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          alignItems: "end",
        }}
      >
        {/* Search */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#64748b",
              marginBottom: "6px",
            }}
          >
            {showWarehouseFilter ? "Search Location" : "Search Warehouse"}
          </label>
          <input
            type="text"
            className="form-control"
            placeholder={
              showWarehouseFilter
                ? "Search location name..."
                : "Search warehouse name, address..."
            }
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "7px 10px", fontSize: "13px" }}
          />
        </div>

        {/* Warehouse Filter (when on Locations tab) */}
        {showWarehouseFilter && (
          <div>
            <label
              style={{
                display: "block",
                fontSize: "12px",
                fontWeight: 600,
                color: "#64748b",
                marginBottom: "6px",
              }}
            >
              Filter by Warehouse
            </label>
            <select
              className="form-control"
              value={warehouseId}
              onChange={(e) => setWarehouseId(e.target.value)}
              style={{ width: "100%", padding: "7px 10px", fontSize: "13px" }}
            >
              <option value="All">All Warehouses</option>
              {warehouses.map((wh) => (
                <option key={wh.id} value={wh.id}>
                  {wh.name} {wh.status === "INACTIVE" ? "(Inactive)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status Filter */}
        <div>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#64748b",
              marginBottom: "6px",
            }}
          >
            Status
          </label>
          <select
            className="form-control"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ width: "100%", padding: "7px 10px", fontSize: "13px" }}
          >
            <option value="All">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>

        {/* Reset button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onReset}
            style={{
              padding: "7px 16px",
              fontSize: "13px",
              color: "#64748b",
              borderColor: "#cbd5e1",
              width: "100%",
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default WarehouseFilters;
