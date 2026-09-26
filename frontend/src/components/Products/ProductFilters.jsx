import "../Dashboard/Dashboard.css";

function ProductFilters({ search, onSearchChange, category, onCategoryChange, categories = [], onReset }) {
  return (
    <section className="filter-section">
      <div className="search-bar-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search products by name or SKU..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="dashboard-filters">
        <div className="filter-group">
          <label htmlFor="prodCategoryFilter">Category</label>
          <select
            id="prodCategoryFilter"
            className="form-select"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id || c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button className="reset-btn" onClick={onReset}>
          Reset Filters
        </button>
      </div>
    </section>
  );
}

export default ProductFilters;
