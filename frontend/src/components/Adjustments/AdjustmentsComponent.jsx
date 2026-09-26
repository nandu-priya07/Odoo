import React, { useState, useEffect, useCallback } from "react";
import AdjustmentFilters from "./AdjustmentFilters";
import AdjustmentTable from "./AdjustmentTable";
import CreateAdjustmentComponent from "./CreateAdjustmentComponent";
import AdjustmentDetails from "./AdjustmentDetails";
import {
  getAdjustments,
  getAdjustment,
  createAdjustment,
  updateAdjustmentStatus,
  validateAdjustment,
  cancelAdjustment,
} from "../../services/adjustmentService";
import { fetchWarehouses, fetchLocations } from "../../services/warehouseService";
import { getProducts } from "../../services/productService";

const AdjustmentsComponent = () => {
  const [adjustments, setAdjustments] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [warehouse, setWarehouse] = useState("All");
  const [location, setLocation] = useState("All");
  const [product, setProduct] = useState("All");

  // Pagination states
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingAdjustment, setViewingAdjustment] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const showToast = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Load auxiliary data for creation & filters
  useEffect(() => {
    const loadMetadata = async () => {
      try {
        const [whs, locs, prodsRes] = await Promise.all([
          fetchWarehouses().catch(() => []),
          fetchLocations().catch(() => []),
          getProducts({ limit: 100 }).catch(() => ({ data: [] })),
        ]);
        setWarehouses(whs || []);
        setLocations(locs || []);
        setProducts(prodsRes.data || []);
      } catch (err) {
        console.error("Failed to load metadata:", err);
      }
    };
    loadMetadata();
  }, []);

  // Load adjustments list
  const loadAdjustments = useCallback(
    async (pageToLoad = pagination.page, limitToLoad = pagination.limit) => {
      try {
        setLoading(true);
        setError("");
        const res = await getAdjustments({
          search,
          status,
          warehouse,
          location,
          product,
          page: pageToLoad,
          limit: limitToLoad,
        });

        setAdjustments(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } catch (err) {
        setError(err.message || "Failed to load stock adjustments.");
      } finally {
        setLoading(false);
      }
    },
    [search, status, warehouse, location, product, pagination.page, pagination.limit]
  );

  useEffect(() => {
    loadAdjustments(1, pagination.limit);
  }, [search, status, warehouse, location, product, pagination.limit]);

  const handleResetFilters = () => {
    setSearch("");
    setStatus("All");
    setWarehouse("All");
    setLocation("All");
    setProduct("All");
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    loadAdjustments(newPage, pagination.limit);
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
    loadAdjustments(1, newLimit);
  };

  // View details
  const handleView = async (adj) => {
    try {
      const details = await getAdjustment(adj.id);
      setViewingAdjustment(details);
    } catch (err) {
      showToast(err.message || "Unable to load adjustment details.", "error");
    }
  };

  // Create adjustment
  const handleCreateSubmit = async (formData) => {
    try {
      setSubmitting(true);
      await createAdjustment(formData);
      showToast("Stock adjustment created successfully in DRAFT status.");
      setShowCreateModal(false);
      loadAdjustments(1, pagination.limit);
    } catch (err) {
      showToast(err.message || "Unable to create adjustment.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Status transition: DRAFT -> WAITING or WAITING -> READY
  const handleStatusChange = async (adj, targetStatus) => {
    try {
      await updateAdjustmentStatus(adj.id, targetStatus);
      showToast(`Adjustment ${adj.adjustment_number} moved to ${targetStatus}.`);
      loadAdjustments(pagination.page, pagination.limit);
    } catch (err) {
      showToast(err.message || "Failed to update status", "error");
    }
  };

  // Validate adjustment (READY -> DONE, sets stock.quantity = physicalCount, records ledger entry)
  const handleValidate = async (adj) => {
    const diff = parseFloat(adj.difference);
    const diffStr = diff > 0 ? `+${diff}` : `${diff}`;
    const confirmed = window.confirm(
      `Are you sure you want to validate adjustment "${adj.adjustment_number}"?\n\nThis will reconcile recorded stock to the counted physical quantity of ${adj.counted_quantity} ${adj.unit_of_measure} (difference: ${diffStr} ${adj.unit_of_measure}).\n\nA Stock Ledger entry will be created.`
    );
    if (!confirmed) return;

    try {
      const res = await validateAdjustment(adj.id);
      showToast(`Adjustment ${adj.adjustment_number} validated successfully! Stock reconciled.`);
      loadAdjustments(pagination.page, pagination.limit);
    } catch (err) {
      showToast(err.message || "Unable to validate adjustment.", "error");
    }
  };

  // Cancel adjustment
  const handleCancel = async (adj) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel adjustment "${adj.adjustment_number}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await cancelAdjustment(adj.id);
      showToast(`Adjustment ${adj.adjustment_number} has been canceled.`);
      loadAdjustments(pagination.page, pagination.limit);
    } catch (err) {
      showToast(err.message || "Failed to cancel adjustment", "error");
    }
  };

  return (
    <div className="dashboard-container">
      {/* Toast Notification */}
      {notification && (
        <div
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 500,
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            backgroundColor: notification.type === "error" ? "#fee2e2" : "#dcfce7",
            color: notification.type === "error" ? "#991b1b" : "#166534",
            border: `1px solid ${notification.type === "error" ? "#f87171" : "#86efac"}`,
          }}
        >
          {notification.type === "error" ? "✕ " : "✓ "} {notification.message}
        </div>
      )}

      {/* Header */}
      <div
        className="dashboard-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 className="dashboard-title" style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>
            Stock Adjustments
          </h1>
          <p className="dashboard-subtitle" style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
            Reconcile recorded stock with physical inventory counts.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ padding: "9px 18px", fontSize: "14px", fontWeight: 600 }}
        >
          + New Adjustment
        </button>
      </div>

      {/* Inline Error */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: "6px",
            marginBottom: "16px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* Filters */}
      <AdjustmentFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        warehouse={warehouse}
        setWarehouse={setWarehouse}
        location={location}
        setLocation={setLocation}
        product={product}
        setProduct={setProduct}
        warehouses={warehouses}
        locations={locations}
        products={products}
        onReset={handleResetFilters}
      />

      {/* Table */}
      <AdjustmentTable
        adjustments={adjustments}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        onView={handleView}
        onStatusChange={handleStatusChange}
        onValidate={handleValidate}
        onCancel={handleCancel}
      />

      {/* Create Modal */}
      {showCreateModal && (
        <CreateAdjustmentComponent
          warehouses={warehouses}
          locations={locations}
          products={products}
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateModal(false)}
          submitting={submitting}
        />
      )}

      {/* View Details Modal */}
      {viewingAdjustment && (
        <AdjustmentDetails
          adjustment={viewingAdjustment}
          onClose={() => setViewingAdjustment(null)}
        />
      )}
    </div>
  );
};

export default AdjustmentsComponent;
