import React, { useState, useEffect, useCallback } from "react";
import MoveHistoryFilters from "./MoveHistoryFilters";
import MoveHistoryTable from "./MoveHistoryTable";
import MoveHistoryDetails from "./MoveHistoryDetails";
import {
  getLedger,
  getWarehouses,
  getLocations,
  getProducts,
} from "../../services/stockLedgerService";
import "../Dashboard/Dashboard.css";

const MoveHistoryComponent = () => {
  // Ledger data state
  const [ledgerEntries, setLedgerEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Metadata dropdowns
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);

  // Filter states
  const [search, setSearch] = useState("");
  const [transactionType, setTransactionType] = useState("All");
  const [warehouseId, setWarehouseId] = useState("All");
  const [locationId, setLocationId] = useState("All");
  const [productId, setProductId] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [direction, setDirection] = useState("All");

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Summary counts
  const [summary, setSummary] = useState({
    totalMovements: 0,
    stockInCount: 0,
    stockOutCount: 0,
    adjustmentsCount: 0,
  });

  // Details modal state
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Check if any filter is active
  const isFiltered = Boolean(
    search.trim() ||
      transactionType !== "All" ||
      warehouseId !== "All" ||
      locationId !== "All" ||
      productId !== "All" ||
      fromDate ||
      toDate ||
      referenceNumber.trim() ||
      direction !== "All"
  );

  // Load metadata on mount
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [whs, locs, prods] = await Promise.all([
          getWarehouses().catch(() => []),
          getLocations().catch(() => []),
          getProducts().catch(() => []),
        ]);
        setWarehouses(whs || []);
        setLocations(locs || []);
        setProducts(prods || []);
      } catch (err) {
        console.error("Failed to load metadata dropdowns:", err);
      }
    };
    loadMetadata();
  }, []);

  // Fetch ledger data with current filters and pagination
  const fetchLedgerData = useCallback(
    async (pageToLoad = pagination.page, limitToLoad = pagination.limit) => {
      try {
        setLoading(true);
        setError("");
        const res = await getLedger({
          page: pageToLoad,
          limit: limitToLoad,
          search: search.trim() || undefined,
          transactionType,
          warehouseId,
          locationId,
          productId,
          fromDate: fromDate || undefined,
          toDate: toDate || undefined,
          referenceNumber: referenceNumber.trim() || undefined,
          direction,
        });

        setLedgerEntries(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
        if (res.summary) {
          setSummary(res.summary);
        }
      } catch (err) {
        console.error("Ledger fetch error:", err);
        setError(err.message || "Unable to load inventory movements.");
      } finally {
        setLoading(false);
      }
    },
    [
      search,
      transactionType,
      warehouseId,
      locationId,
      productId,
      fromDate,
      toDate,
      referenceNumber,
      direction,
      pagination.page,
      pagination.limit,
    ]
  );

  // Trigger data reload on filter change (reset to page 1)
  useEffect(() => {
    fetchLedgerData(1, pagination.limit);
  }, [
    search,
    transactionType,
    warehouseId,
    locationId,
    productId,
    fromDate,
    toDate,
    referenceNumber,
    direction,
    pagination.limit,
  ]);

  // Handle pagination changes
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    fetchLedgerData(newPage, pagination.limit);
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
    fetchLedgerData(1, newLimit);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearch("");
    setTransactionType("All");
    setWarehouseId("All");
    setLocationId("All");
    setProductId("All");
    setFromDate("");
    setToDate("");
    setReferenceNumber("");
    setDirection("All");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Open details modal
  const handleViewDetails = (entry) => {
    setSelectedEntry(entry);
    setDetailsOpen(true);
  };

  // Close details modal
  const handleCloseDetails = () => {
    setSelectedEntry(null);
    setDetailsOpen(false);
  };

  return (
    <div className="dashboard-container" style={{ padding: "24px 32px" }}>
      {/* Header */}
      <div
        className="dashboard-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 className="dashboard-title" style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>
            Move History
          </h1>
          <p
            className="dashboard-subtitle"
            style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}
          >
            Track every inventory movement across warehouses and locations.
          </p>
        </div>

        {/* Read-only audit badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#1d4ed8",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          <span>🔒 Immutable Audit Ledger</span>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* Total Movements */}
        <div
          className="card"
          style={{
            background: "#ffffff",
            padding: "16px 20px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            📊
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#64748b", fontWeight: 600, textTransform: "uppercase" }}>
              Total Movements
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#0f172a" }}>
              {summary.totalMovements.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Stock In */}
        <div
          className="card"
          style={{
            background: "#ffffff",
            padding: "16px 20px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#dcfce7",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            📥
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#166534", fontWeight: 600, textTransform: "uppercase" }}>
              Stock In
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#15803d" }}>
              {summary.stockInCount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Stock Out */}
        <div
          className="card"
          style={{
            background: "#ffffff",
            padding: "16px 20px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#fee2e2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            📤
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#991b1b", fontWeight: 600, textTransform: "uppercase" }}>
              Stock Out
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#b91c1c" }}>
              {summary.stockOutCount.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Adjustments */}
        <div
          className="card"
          style={{
            background: "#ffffff",
            padding: "16px 20px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "10px",
              background: "#f1f5f9",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
            }}
          >
            ⚖️
          </div>
          <div>
            <div style={{ fontSize: "12px", color: "#475569", fontWeight: 600, textTransform: "uppercase" }}>
              Adjustments
            </div>
            <div style={{ fontSize: "22px", fontWeight: 700, color: "#334155" }}>
              {summary.adjustmentsCount.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Error State with Retry Button */}
      {error && (
        <div
          style={{
            padding: "16px 20px",
            background: "#fee2e2",
            border: "1px solid #f87171",
            color: "#991b1b",
            borderRadius: "8px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "18px" }}>⚠️</span>
            <span style={{ fontWeight: 500 }}>Unable to load inventory movements.</span>
          </div>
          <button
            type="button"
            className="btn btn-outline"
            style={{
              backgroundColor: "#ffffff",
              borderColor: "#f87171",
              color: "#991b1b",
              padding: "4px 14px",
              fontSize: "13px",
            }}
            onClick={() => fetchLedgerData(pagination.page, pagination.limit)}
          >
            Retry
          </button>
        </div>
      )}

      {/* Search and Filters Section */}
      <MoveHistoryFilters
        search={search}
        setSearch={setSearch}
        transactionType={transactionType}
        setTransactionType={setTransactionType}
        warehouseId={warehouseId}
        setWarehouseId={setWarehouseId}
        locationId={locationId}
        setLocationId={setLocationId}
        productId={productId}
        setProductId={setProductId}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        referenceNumber={referenceNumber}
        setReferenceNumber={setReferenceNumber}
        direction={direction}
        setDirection={setDirection}
        warehouses={warehouses}
        locations={locations}
        products={products}
        onReset={handleResetFilters}
      />

      {/* Move History Table */}
      <MoveHistoryTable
        entries={ledgerEntries}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onViewDetails={handleViewDetails}
        isFiltered={isFiltered}
        onClearFilters={handleResetFilters}
      />

      {/* Move History Details Modal */}
      {detailsOpen && selectedEntry && (
        <MoveHistoryDetails
          entry={selectedEntry}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

export default MoveHistoryComponent;
