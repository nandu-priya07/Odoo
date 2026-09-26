import React, { useState, useEffect } from "react";
import { fetchWarehouses, createWarehouse, updateWarehouse } from "../../services/warehouseService";
import WarehouseTable from "./WarehouseTable";
import WarehouseForm from "./WarehouseForm";
import LocationManagement from "./LocationManagement";

const WarehousesComponent = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list"); // 'list', 'create', 'edit', 'locations'
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const data = await fetchWarehouses();
      setWarehouses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  const handleCreateSubmit = async (formData) => {
    try {
      setSubmitting(true);
      await createWarehouse(formData);
      setView("list");
      loadWarehouses();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (formData) => {
    try {
      setSubmitting(true);
      await updateWarehouse(selectedWarehouse.id, formData);
      setView("list");
      setSelectedWarehouse(null);
      loadWarehouses();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (wh) => {
    setSelectedWarehouse(wh);
    setView("edit");
  };

  const handleManageLocations = (wh) => {
    setSelectedWarehouse(wh);
    setView("locations");
  };

  return (
    <div className="dashboard-container">
      {view === "locations" && selectedWarehouse ? (
        <LocationManagement
          warehouse={selectedWarehouse}
          onBack={() => setView("list")}
        />
      ) : view === "create" ? (
        <WarehouseForm
          onSubmit={handleCreateSubmit}
          onCancel={() => setView("list")}
          submitting={submitting}
        />
      ) : view === "edit" && selectedWarehouse ? (
        <WarehouseForm
          initialData={selectedWarehouse}
          onSubmit={handleEditSubmit}
          onCancel={() => {
            setView("list");
            setSelectedWarehouse(null);
          }}
          submitting={submitting}
        />
      ) : (
        <>
          <div className="dashboard-header" style={{ marginBottom: "20px" }}>
            <div>
              <h1 className="dashboard-title">Warehouses & Locations</h1>
              <p className="dashboard-subtitle">Manage fulfillment centers and storage areas</p>
            </div>
            <button className="btn btn-primary" onClick={() => setView("create")}>
              + Create Warehouse
            </button>
          </div>

          <div className="card">
            <WarehouseTable
              warehouses={warehouses}
              loading={loading}
              onEdit={handleEditClick}
              onViewLocations={handleManageLocations}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default WarehousesComponent;
