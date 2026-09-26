import React from "react";

const MoveHistoryFilters = ({
  search,
  setSearch,
  transactionType,
  setTransactionType,
  warehouseId,
  setWarehouseId,
  locationId,
  setLocationId,
  productId,
  setProductId,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  referenceNumber,
  setReferenceNumber,
  direction,
  setDirection,
  warehouses = [],
  locations = [],
  products = [],
  onReset,
}) => {
  // Filter locations by selected warehouse
  const filteredLocations = warehouseId && warehouseId !== "All"
    ? locations.filter((loc) => loc.warehouse_id === warehouseId)
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
      {/* Row 1: Search, Transaction Type, Warehouse, Location, Product */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "14px",
          marginBottom: "14px",
          alignItems: "end",
        }}
      >
        {/* Search */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>
            Search Move History
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Search product, SKU, reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "7px 10px", fontSize: "13px" }}
          />
        </div>

        {/* Transaction Type */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>
            Transaction Type
          </label>
          <select
            className="form-control"
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            style={{ width: "100%", padding: "7px 10px", fontSize: "13px" }}
          >
            <option value="All">All Types</option>
            <option value="RECEIPT">Receipt</option>
            <option value="DELIVERY">Delivery</option>
            <option value="TRANSFER_OUT">Transfer Out</option>
            <option value="TRANSFER_IN">Transfer In</option>
            <option value="ADJUSTMENT">Adjustment</option>
          </select>
        </div>

        {/* Warehouse */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>
            Warehouse
          </label>
          <select
            className="form-control"
            value={warehouseId}
            onChange={(e) => {
              setWarehouseId(e.target.value);
              setLocationId("All");
            }}
            style={{ width: "100%", padding: "7px 10px", fontSize: "13px" }}
          >
            <option value="All">All Warehouses</option>
            {warehouses.map((wh) => (
              <option key={wh.id} value={wh.id}>
                {wh.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>
            Location
          </label>
          <select
            className="form-control"
            value={locationId}
            onChange={(e) => setLocationId(e.target.value)}
            style={{ width: "100%", padding: "7px 10px", fontSize: "13px" }}
          >
            <option value="All">All Locations</option>
            {filteredLocations.map((loc) => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Product */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>
            Product
          </label>
          <select
            className="form-control"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            style={{ width: "100%", padding: "7px 10px", fontSize: "13px" }}
          >
            <option value="All">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Direction, From Date, To Date, Reference Number, Reset */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "14px",
          alignItems: "end",
        }}
      >
        {/* Quantity Direction */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>
            Quantity Direction
          </label>
          <select
            className="form-control"
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            style={{ width: "100%", padding: "7px 10px", fontSize: "13px" }}
          >
            <option value="All">All Movements</option>
            <option value="in">Stock In (+)</option>
            <option value="out">Stock Out (-)</option>
          </select>
        </div>

        {/* From Date */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>
            From Date
          </label>
          <input
            type="date"
            className="form-control"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            style={{ width: "100%", padding: "6px 10px", fontSize: "13px" }}
          />
        </div>

        {/* To Date */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>
            To Date
          </label>
          <input
            type="date"
            className="form-control"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            style={{ width: "100%", padding: "6px 10px", fontSize: "13px" }}
          />
        </div>

        {/* Reference Number */}
        <div>
          <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#64748b", marginBottom: "6px" }}>
            Reference Number
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="e.g. REC-00001, TRF-..."
            value={referenceNumber}
            onChange={(e) => setReferenceNumber(e.target.value)}
            style={{ width: "100%", padding: "7px 10px", fontSize: "13px" }}
          />
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

export default MoveHistoryFilters;
