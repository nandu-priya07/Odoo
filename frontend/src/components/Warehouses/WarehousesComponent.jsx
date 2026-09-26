import React, { useState, useEffect, useCallback } from "react";
import WarehouseFilters from "./WarehouseFilters";
import WarehouseTable from "./WarehouseTable";
import LocationTable from "./LocationTable";
import CreateWarehouseComponent from "./CreateWarehouseComponent";
import EditWarehouseComponent from "./EditWarehouseComponent";
import WarehouseDetails from "./WarehouseDetails";
import CreateLocationComponent from "./CreateLocationComponent";
import EditLocationComponent from "./EditLocationComponent";
import {
  getWarehouses,
  getLocations,
  deactivateWarehouse,
  deactivateLocation,
} from "../../services/warehouseService";
import "../Dashboard/Dashboard.css";

const WarehousesComponent = () => {
  // Navigation tab: 'warehouses' | 'locations'
  const [activeTab, setActiveTab] = useState("warehouses");

  // Data states
  const [warehouses, setWarehouses] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null); // { type: 'success' | 'error', message: '' }

  // Filter states
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [warehouseFilter, setWarehouseFilter] = useState("All");

  // Pagination states
  const [whPagination, setWhPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const [locPagination, setLocPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // Modal states
  const [createWarehouseOpen, setCreateWarehouseOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);

  const [createLocationOpen, setCreateLocationOpen] = useState(false);
  const [targetWarehouseIdForLocation, setTargetWarehouseIdForLocation] = useState(null);
  const [editingLocation, setEditingLocation] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Load warehouses list
  const loadWarehouses = useCallback(
    async (pageToLoad = whPagination.page, limitToLoad = whPagination.limit) => {
      try {
        setLoading(true);
        setError("");
        const res = await getWarehouses({
          page: pageToLoad,
          limit: limitToLoad,
          search: search.trim() || undefined,
          status,
        });

        setWarehouses(res.data || []);
        if (res.pagination) {
          setWhPagination(res.pagination);
        }
      } catch (err) {
        console.error("Load warehouses error:", err);
        setError(err.message || "Unable to load warehouses.");
      } finally {
        setLoading(false);
      }
    },
    [search, status, whPagination.page, whPagination.limit]
  );

  // Load locations list
  const loadLocations = useCallback(
    async (pageToLoad = locPagination.page, limitToLoad = locPagination.limit) => {
      try {
        setLoading(true);
        setError("");
        const res = await getLocations({
          page: pageToLoad,
          limit: limitToLoad,
          search: search.trim() || undefined,
          warehouseId: warehouseFilter !== "All" ? warehouseFilter : undefined,
          status,
        });

        setLocations(res.data || []);
        if (res.pagination) {
          setLocPagination(res.pagination);
        }
      } catch (err) {
        console.error("Load locations error:", err);
        setError(err.message || "Unable to load locations.");
      } finally {
        setLoading(false);
      }
    },
    [search, warehouseFilter, status, locPagination.page, locPagination.limit]
  );

  // Trigger data load when filters or active tab change
  useEffect(() => {
    if (activeTab === "warehouses") {
      loadWarehouses(1, whPagination.limit);
    } else {
      loadLocations(1, locPagination.limit);
    }
  }, [activeTab, search, status, warehouseFilter, whPagination.limit, locPagination.limit]);

  // Handle Tab Switch
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearch("");
    setStatus("All");
    setWarehouseFilter("All");
  };

  // Handle Reset Filters
  const handleResetFilters = () => {
    setSearch("");
    setStatus("All");
    setWarehouseFilter("All");
  };

  // Warehouse Actions
  const handleDeactivateWarehouse = async (wh) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate warehouse "${wh.name}"?\n\nIf it currently holds stock, deactivation will be prevented.`
    );
    if (!confirmed) return;

    try {
      await deactivateWarehouse(wh.id);
      showToast(`Warehouse "${wh.name}" has been deactivated.`);
      if (selectedWarehouseId === wh.id) {
        setSelectedWarehouseId(null);
      }
      loadWarehouses(whPagination.page, whPagination.limit);
    } catch (err) {
      showToast(err.message || "Unable to deactivate warehouse.", "error");
    }
  };

  // Location Actions
  const handleDeactivateLocation = async (loc) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate location "${loc.name}"?\n\nLocations with inventory cannot be deactivated.`
    );
    if (!confirmed) return;

    try {
      await deactivateLocation(loc.id);
      showToast(`Location "${loc.name}" has been deactivated.`);
      loadLocations(locPagination.page, locPagination.limit);
    } catch (err) {
      showToast(err.message || "Unable to deactivate location.", "error");
    }
  };

  // Is any filter active
  const isFiltered = Boolean(search.trim() || status !== "All" || warehouseFilter !== "All");

  return (
    <div className="dashboard-container" style={{ padding: "24px 32px" }}>
      {/* Toast Alert */}
      {toast && (
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
            backgroundColor: toast.type === "error" ? "#fee2e2" : "#dcfce7",
            color: toast.type === "error" ? "#991b1b" : "#166534",
            border: `1px solid ${toast.type === "error" ? "#f87171" : "#86efac"}`,
          }}
        >
          {toast.type === "error" ? "✕ " : "✓ "} {toast.message}
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
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 className="dashboard-title" style={{ margin: 0, fontSize: "24px", fontWeight: 700 }}>
            Warehouses & Locations
          </h1>
          <p
            className="dashboard-subtitle"
            style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "14px" }}
          >
            Manage warehouses, storage locations, and inventory locations.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          {activeTab === "locations" && (
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setTargetWarehouseIdForLocation(null);
                setCreateLocationOpen(true);
              }}
              style={{ padding: "9px 16px", fontSize: "14px", fontWeight: 600 }}
            >
              + Add Location
            </button>
          )}

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setCreateWarehouseOpen(true)}
            style={{ padding: "9px 18px", fontSize: "14px", fontWeight: 600 }}
          >
            + New Warehouse
          </button>
        </div>
      </div>

      {/* View Tabs */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #e2e8f0",
          marginBottom: "20px",
          gap: "8px",
        }}
      >
        <button
          type="button"
          onClick={() => handleTabSwitch("warehouses")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "warehouses" ? "2px solid #2563eb" : "2px solid transparent",
            color: activeTab === "warehouses" ? "#2563eb" : "#64748b",
            fontWeight: activeTab === "warehouses" ? 700 : 500,
            padding: "10px 18px",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          🏢 Warehouses ({whPagination.total})
        </button>

        <button
          type="button"
          onClick={() => handleTabSwitch("locations")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "locations" ? "2px solid #2563eb" : "2px solid transparent",
            color: activeTab === "locations" ? "#2563eb" : "#64748b",
            fontWeight: activeTab === "locations" ? 700 : 500,
            padding: "10px 18px",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          📍 All Locations ({locPagination.total})
        </button>
      </div>

      {/* Inline Error State */}
      {error && (
        <div
          style={{
            padding: "14px 18px",
            background: "#fee2e2",
            border: "1px solid #f87171",
            borderRadius: "8px",
            color: "#991b1b",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>⚠️ {error}</span>
          <button
            type="button"
            className="btn btn-outline"
            style={{
              backgroundColor: "#ffffff",
              borderColor: "#f87171",
              color: "#991b1b",
              padding: "4px 12px",
              fontSize: "12px",
            }}
            onClick={() =>
              activeTab === "warehouses"
                ? loadWarehouses(whPagination.page, whPagination.limit)
                : loadLocations(locPagination.page, locPagination.limit)
            }
          >
            Retry
          </button>
        </div>
      )}

      {/* Filters */}
      <WarehouseFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        warehouseId={warehouseFilter}
        setWarehouseId={setWarehouseFilter}
        warehouses={warehouses}
        showWarehouseFilter={activeTab === "locations"}
        onReset={handleResetFilters}
      />

      {/* Tables based on tab */}
      {activeTab === "warehouses" ? (
        <WarehouseTable
          warehouses={warehouses}
          loading={loading}
          pagination={whPagination}
          onPageChange={(page) => loadWarehouses(page, whPagination.limit)}
          onLimitChange={(limit) => loadWarehouses(1, limit)}
          onView={(wh) => setSelectedWarehouseId(wh.id)}
          onEdit={(wh) => setEditingWarehouse(wh)}
          onDeactivate={handleDeactivateWarehouse}
          onCreateNew={() => setCreateWarehouseOpen(true)}
          isFiltered={isFiltered}
        />
      ) : (
        <LocationTable
          locations={locations}
          loading={loading}
          pagination={locPagination}
          onPageChange={(page) => loadLocations(page, locPagination.limit)}
          onLimitChange={(limit) => loadLocations(1, limit)}
          onView={(loc) => {
            // Open parent warehouse details or inspect location
            setSelectedWarehouseId(loc.warehouse?.id || loc.warehouseId);
          }}
          onEdit={(loc) => setEditingLocation(loc)}
          onDeactivate={handleDeactivateLocation}
          onCreateNew={() => {
            setTargetWarehouseIdForLocation(null);
            setCreateLocationOpen(true);
          }}
          isFiltered={isFiltered}
        />
      )}

      {/* Create Warehouse Modal */}
      {createWarehouseOpen && (
        <CreateWarehouseComponent
          isOpen={createWarehouseOpen}
          onClose={() => setCreateWarehouseOpen(false)}
          onSuccess={(msg) => {
            showToast(msg);
            loadWarehouses(1, whPagination.limit);
          }}
        />
      )}

      {/* Edit Warehouse Modal */}
      {editingWarehouse && (
        <EditWarehouseComponent
          isOpen={Boolean(editingWarehouse)}
          warehouse={editingWarehouse}
          onClose={() => setEditingWarehouse(null)}
          onSuccess={(msg) => {
            showToast(msg);
            loadWarehouses(whPagination.page, whPagination.limit);
          }}
        />
      )}

      {/* Warehouse Details Modal / Drawer */}
      {selectedWarehouseId && (
        <WarehouseDetails
          warehouseId={selectedWarehouseId}
          onClose={() => setSelectedWarehouseId(null)}
          onEditWarehouse={(wh) => {
            setEditingWarehouse(wh);
          }}
          onAddLocation={(whId) => {
            setTargetWarehouseIdForLocation(whId);
            setCreateLocationOpen(true);
          }}
          onEditLocation={(loc) => {
            setEditingLocation(loc);
          }}
          onDeactivateWarehouse={handleDeactivateWarehouse}
        />
      )}

      {/* Create Location Modal */}
      {createLocationOpen && (
        <CreateLocationComponent
          isOpen={createLocationOpen}
          defaultWarehouseId={targetWarehouseIdForLocation}
          warehouses={warehouses}
          onClose={() => {
            setCreateLocationOpen(false);
            setTargetWarehouseIdForLocation(null);
          }}
          onSuccess={(msg) => {
            showToast(msg);
            if (activeTab === "locations") {
              loadLocations(1, locPagination.limit);
            } else {
              loadWarehouses(whPagination.page, whPagination.limit);
            }
          }}
        />
      )}

      {/* Edit Location Modal */}
      {editingLocation && (
        <EditLocationComponent
          isOpen={Boolean(editingLocation)}
          location={editingLocation}
          onClose={() => setEditingLocation(null)}
          onSuccess={(msg) => {
            showToast(msg);
            if (activeTab === "locations") {
              loadLocations(locPagination.page, locPagination.limit);
            } else {
              loadWarehouses(whPagination.page, whPagination.limit);
            }
          }}
        />
      )}
    </div>
  );
};

export default WarehousesComponent;
