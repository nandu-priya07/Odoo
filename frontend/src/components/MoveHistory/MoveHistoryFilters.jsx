import "../Dashboard/Dashboard.css";

function MoveHistoryFilters({ search, onSearchChange, transactionType, onTypeChange, date, onDateChange, onReset }) {
  return (
    <section className="filter-section">
      <div className="search-bar-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="🔍 Search by product name, SKU, or location..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="dashboard-filters">
        <div className="filter-group">
          <label htmlFor="txType">Transaction Type</label>
          <select
            id="txType"
            className="form-select"
            value={transactionType}
            onChange={(e) => onTypeChange(e.target.value)}
          >
            <option value="All">All Movements</option>
            <option value="RECEIPT">RECEIPT (+)</option>
            <option value="DELIVERY">DELIVERY (-)</option>
            <option value="TRANSFER_IN">TRANSFER_IN (+)</option>
            <option value="TRANSFER_OUT">TRANSFER_OUT (-)</option>
            <option value="ADJUSTMENT">ADJUSTMENT (±)</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="txDate">Filter Date</label>
          <input
            type="date"
            id="txDate"
            className="form-input"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>

        <button className="reset-btn" onClick={onReset}>
          Reset Filters
        </button>
      </div>
    </section>
  );
}

export default MoveHistoryFilters;
