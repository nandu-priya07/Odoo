import React from "react";

const AdjustmentFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  warehouse,
  setWarehouse,
  location,
  setLocation,
  product,
  setProduct,
  warehouses = [],
  locations = [],
  products = [],
  onReset,
}) => {
  // Filter locations by selected warehouse if any
  const availableLocations = warehouse && warehouse !== "All"
    ? locations.filter((l) => {
        const whObj = warehouses.find((w) => w.name === warehouse || w.id === warehouse);
        return whObj ? l.warehouse_id === whObj.id : true;
      })
    : locations;

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
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "flex-end",
        }}
      >
        {/* Search */}
        <div style={{ flex: "1 1 200px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#64748b",
              marginBottom: "6px",
            }}
          >
            Search Adjustments
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Search by number, product, SKU, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", fontSize: "14px" }}
          />
        </div>

        {/* Status Filter */}
        <div style={{ flex: "1 1 140px" }}>
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
            style={{ width: "100%", padding: "8px 12px", fontSize: "14px" }}
          >
            <option value="All">All Statuses</option>
            <option value="DRAFT">DRAFT</option>
            <option value="WAITING">WAITING</option>
            <option value="READY">READY</option>
            <option value="DONE">DONE</option>
            <option value="CANCELED">CANCELED</option>
          </select>
        </div>

        {/* Warehouse Filter */}
        <div style={{ flex: "1 1 150px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#64748b",
              marginBottom: "6px",
            }}
          >
            Warehouse
          </label>
          <select
            className="form-control"
            value={warehouse}
            onChange={(e) => {
              setWarehouse(e.target.value);
              setLocation("All");
            }}
            style={{ width: "100%", padding: "8px 12px", fontSize: "14px" }}
          >
            <option value="All">All Warehouses</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.name}>
                {wh.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location Filter */}
        <div style={{ flex: "1 1 150px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#64748b",
              marginBottom: "6px",
            }}
          >
            Location
          </label>
          <select
            className="form-control"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", fontSize: "14px" }}
          >
            <option value="All">All Locations</option>
            {availableLocations.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product Filter */}
        <div style={{ flex: "1 1 160px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#64748b",
              marginBottom: "6px",
            }}
          >
            Product
          </label>
          <select
            className="form-control"
            value={product}
            onChange={(e) => setProduct(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", fontSize: "14px" }}
          >
            <option value="All">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Reset button */}
        <div>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onReset}
            style={{
              padding: "8px 16px",
              fontSize: "14px",
              color: "#64748b",
              borderColor: "#cbd5e1",
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdjustmentFilters;
