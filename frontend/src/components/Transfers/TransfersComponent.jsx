import React, { useState, useEffect, useCallback } from "react";
import TransferFilters from "./TransferFilters";
import TransferTable from "./TransferTable";
import CreateTransferComponent from "./CreateTransferComponent";
import TransferDetails from "./TransferDetails";
import {
  getTransfers,
  getTransfer,
  createTransfer,
  updateTransferStatus,
  validateTransfer,
  cancelTransfer,
} from "../../services/transferService";
import { fetchWarehouses, fetchLocations } from "../../services/warehouseService";
import { getProducts } from "../../services/productService";

const TransfersComponent = () => {
  const [transfers, setTransfers] = useState([]);
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

  // Pagination states
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingTransfer, setViewingTransfer] = useState(null);
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

  // Load transfers list
  const loadTransfers = useCallback(
    async (pageToLoad = pagination.page, limitToLoad = pagination.limit) => {
      try {
        setLoading(true);
        setError("");
        const res = await getTransfers({
          search,
          status,
          warehouse,
          page: pageToLoad,
          limit: limitToLoad,
        });

        setTransfers(res.data || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } catch (err) {
        setError(err.message || "Failed to load transfers.");
      } finally {
        setLoading(false);
      }
    },
    [search, status, warehouse, pagination.page, pagination.limit]
  );

  useEffect(() => {
    loadTransfers(1, pagination.limit);
  }, [search, status, warehouse, pagination.limit]);

  const handleResetFilters = () => {
    setSearch("");
    setStatus("All");
    setWarehouse("All");
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
    loadTransfers(newPage, pagination.limit);
  };

  const handleLimitChange = (newLimit) => {
    setPagination((prev) => ({ ...prev, limit: newLimit, page: 1 }));
    loadTransfers(1, newLimit);
  };

  // View details
  const handleView = async (trf) => {
    try {
      const details = await getTransfer(trf.id);
      setViewingTransfer(details);
    } catch (err) {
      showToast(err.message || "Unable to load transfer details.", "error");
    }
  };

  // Create new transfer
  const handleCreateSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const created = await createTransfer(formData);
      showToast(`Transfer created successfully with status DRAFT.`);
      setShowCreateModal(false);
      loadTransfers(1, pagination.limit);
    } catch (err) {
      showToast(err.message || "Unable to create transfer.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Status transition: DRAFT -> WAITING or WAITING -> READY
  const handleStatusChange = async (trf, targetStatus) => {
    try {
      await updateTransferStatus(trf.id, targetStatus);
      showToast(`Transfer ${trf.transfer_number} moved to ${targetStatus}.`);
      loadTransfers(pagination.page, pagination.limit);
    } catch (err) {
      showToast(err.message || "Failed to update status", "error");
    }
  };

  // Validate transfer (READY -> DONE, decreases source, increases destination)
  const handleValidate = async (trf) => {
    const confirmed = window.confirm(
      `Are you sure you want to validate transfer "${trf.transfer_number}"?\n\nThis will decrease stock by ${trf.quantity} at ${trf.from_location_name} and increase stock at ${trf.to_location_name}. Total company stock remains unchanged.`
    );
    if (!confirmed) return;

    try {
      await validateTransfer(trf.id);
      showToast(`Transfer ${trf.transfer_number} validated successfully! Stock moved.`);
      loadTransfers(pagination.page, pagination.limit);
    } catch (err) {
      showToast(err.message || "Unable to validate transfer.", "error");
    }
  };

  // Cancel transfer
  const handleCancel = async (trf) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel transfer "${trf.transfer_number}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    try {
      await cancelTransfer(trf.id);
      showToast(`Transfer ${trf.transfer_number} has been canceled.`);
      loadTransfers(pagination.page, pagination.limit);
    } catch (err) {
      showToast(err.message || "Failed to cancel transfer", "error");
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
            Internal Transfers
          </h1>
          <p className="dashboard-subtitle" style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}>
            Move stock between warehouses and locations.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowCreateModal(true)}
          style={{ padding: "9px 18px", fontSize: "14px", fontWeight: 600 }}
        >
          + New Transfer
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
      <TransferFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        warehouse={warehouse}
        setWarehouse={setWarehouse}
        warehouses={warehouses}
        onReset={handleResetFilters}
      />

      {/* Transfers Table */}
      <TransferTable
        transfers={transfers}
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
        <CreateTransferComponent
          warehouses={warehouses}
          locations={locations}
          products={products}
          onSubmit={handleCreateSubmit}
          onCancel={() => setShowCreateModal(false)}
          submitting={submitting}
        />
      )}

      {/* View Details Modal */}
      {viewingTransfer && (
        <TransferDetails
          transfer={viewingTransfer}
          onClose={() => setViewingTransfer(null)}
        />
      )}
    </div>
  );
};

export default TransfersComponent;
