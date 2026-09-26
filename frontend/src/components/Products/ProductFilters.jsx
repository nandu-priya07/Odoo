import React from "react";

const ProductFilters = ({
  search,
  setSearch,
  category,
  setCategory,
  stockStatus,
  setStockStatus,
  categories,
  onReset,
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
          display: "flex",
          flexWrap: "wrap",
          gap: "16px",
          alignItems: "flex-end",
        }}
      >
        {/* Search bar */}
        <div style={{ flex: "1 1 240px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#64748b",
              marginBottom: "6px",
            }}
          >
            Search Products
          </label>
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", fontSize: "14px" }}
          />
        </div>

        {/* Category filter */}
        <div style={{ flex: "1 1 180px" }}>
          <label
            style={{
              display: "block",
              fontSize: "12px",
              fontWeight: 600,
              color: "#64748b",
              marginBottom: "6px",
            }}
          >
            Category
          </label>
          <select
            className="form-control"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", fontSize: "14px" }}
          >
            <option value="All">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Status filter */}
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
            Stock Status
          </label>
          <select
            className="form-control"
            value={stockStatus}
            onChange={(e) => setStockStatus(e.target.value)}
            style={{ width: "100%", padding: "8px 12px", fontSize: "14px" }}
          >
            <option value="All">All Statuses</option>
            <option value="In Stock">In Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>

        {/* Reset Filters button */}
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

export default ProductFilters;
