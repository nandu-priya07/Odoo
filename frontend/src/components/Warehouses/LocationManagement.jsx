import React, { useState, useEffect } from "react";
import { fetchLocations, createLocation, fetchStockByLocation } from "../../services/warehouseService";

const LocationManagement = ({ warehouse, onBack }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationCode, setNewLocationCode] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Selected location for stock view
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationStock, setLocationStock] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const data = await fetchLocations(warehouse.id);
      setLocations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (warehouse) {
      loadLocations();
    }
  }, [warehouse]);

  const handleCreateLocation = async (e) => {
    e.preventDefault();
    if (!newLocationName.trim()) return;
    try {
      setSubmitting(true);
      await createLocation({
        warehouse_id: warehouse.id,
        name: newLocationName,
        code: newLocationCode || undefined,
      });
      setNewLocationName("");
      setNewLocationCode("");
      setShowAddModal(false);
      loadLocations();
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewStock = async (loc) => {
    try {
      setSelectedLocation(loc);
      setStockLoading(true);
      const stockData = await fetchStockByLocation(loc.id);
      setLocationStock(stockData);
    } catch (err) {
      console.error(err);
    } finally {
      setStockLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <div>
          <button className="btn btn-outline" onClick={onBack} style={{ marginBottom: "8px" }}>
            ← Back to Warehouses
          </button>
          <h2 style={{ fontSize: "20px", fontWeight: "700", margin: 0, color: "#0f172a" }}>
            Locations in {warehouse.name} ({warehouse.code})
          </h2>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          + Add Location
        </button>
      </div>

      {showAddModal && (
        <div className="card" style={{ marginBottom: "24px", background: "#f8fafc" }}>
          <h4 style={{ marginTop: 0, marginBottom: "16px" }}>Add New Location</h4>
          <form onSubmit={handleCreateLocation} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "12px", alignItems: "end" }}>
            <div>
              <label className="form-label">Location Name *</label>
              <input
                type="text"
                className="form-control"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                placeholder="e.g. Shelf A1"
                required
              />
            </div>
            <div>
              <label className="form-label">Location Code</label>
              <input
                type="text"
                className="form-control"
                value={newLocationCode}
                onChange={(e) => setNewLocationCode(e.target.value)}
                placeholder="e.g. LOC-A1"
              />
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? "Saving..." : "Save"}
              </button>
              <button type="button" className="btn btn-outline" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: selectedLocation ? "1fr 1fr" : "1fr", gap: "20px" }}>
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Locations List</h3>
          </div>
          <div className="card-body">
            {loading ? (
              <div>Loading locations...</div>
            ) : locations.length === 0 ? (
              <div className="empty-state">No locations created in this warehouse yet.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Stock Action</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((loc) => (
                    <tr
                      key={loc.id}
                      style={{
                        background: selectedLocation?.id === loc.id ? "#eff6ff" : "transparent",
                      }}
                    >
                      <td><strong>{loc.name}</strong></td>
                      <td><code>{loc.code}</code></td>
                      <td>
                        <button
                          className="btn btn-outline"
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          onClick={() => handleViewStock(loc)}
                        >
                          View Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {selectedLocation && (
          <div className="card">
            <div className="card-header" style={{ display: "flex", justifyContent: "space-between" }}>
              <h3 className="card-title">Stock at {selectedLocation.name}</h3>
              <button className="btn btn-outline" style={{ padding: "2px 8px", fontSize: "12px" }} onClick={() => setSelectedLocation(null)}>
                Close
              </button>
            </div>
            <div className="card-body">
              {stockLoading ? (
                <div>Loading stock levels...</div>
              ) : locationStock.length === 0 ? (
                <div className="empty-state">No stock available at this location.</div>
              ) : (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {locationStock.map((item, index) => (
                      <tr key={index}>
                        <td>{item.product_name}</td>
                        <td><code>{item.sku}</code></td>
                        <td><strong>{item.quantity}</strong> {item.uom || "units"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationManagement;
