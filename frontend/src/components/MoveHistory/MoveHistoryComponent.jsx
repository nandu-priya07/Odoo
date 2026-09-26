import { useState, useEffect } from "react";
import MoveHistoryFilters from "./MoveHistoryFilters";
import MoveHistoryTable from "./MoveHistoryTable";
import { fetchStockLedger } from "../../services/stockService";
import "../Dashboard/Dashboard.css";

function MoveHistoryComponent() {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [transactionType, setTransactionType] = useState("All");
  const [date, setDate] = useState("");

  const loadLedger = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchStockLedger({ transactionType, search, date });
      setLedger(data);
    } catch (err) {
      console.error("Load ledger error:", err);
      setError(err.message || "Failed to load stock move history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLedger();
  }, [search, transactionType, date]);

  const handleResetFilters = () => {
    setSearch("");
    setTransactionType("All");
    setDate("");
  };

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>StockSense Move History & Ledger</h1>
          <p>Complete audit log of every stock transaction, receipt, delivery, transfer, and adjustment.</p>
        </div>
      </div>

      {error && (
        <div className="alert-banner error-banner" style={{ marginBottom: "1.5rem" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Filters */}
      <MoveHistoryFilters
        search={search}
        onSearchChange={setSearch}
        transactionType={transactionType}
        onTypeChange={setTransactionType}
        date={date}
        onDateChange={setDate}
        onReset={handleResetFilters}
      />

      {/* Table */}
      {loading ? (
        <p style={{ color: "#64748b", padding: "1rem" }}>Loading stock audit trail...</p>
      ) : (
        <MoveHistoryTable ledger={ledger} />
      )}
    </div>
  );
}

export default MoveHistoryComponent;
