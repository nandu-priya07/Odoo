const API_BASE_URL = "http://localhost:5000/api";

export const fetchWarehouses = async () => {
  const res = await fetch(`${API_BASE_URL}/warehouses`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch warehouses");
  }
  return json.data;
};

export const fetchWarehouseById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/warehouses/${id}`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch warehouse");
  }
  return json.data;
};

export const createWarehouse = async (data) => {
  const res = await fetch(`${API_BASE_URL}/warehouses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to create warehouse");
  }
  return json.data;
};

export const updateWarehouse = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to update warehouse");
  }
  return json.data;
};

export const fetchLocations = async (warehouseId = null) => {
  const url = warehouseId ? `${API_BASE_URL}/warehouses/locations?warehouse_id=${warehouseId}` : `${API_BASE_URL}/warehouses/locations`;
  const res = await fetch(url);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch locations");
  }
  return json.data;
};

export const createLocation = async (data) => {
  const res = await fetch(`${API_BASE_URL}/warehouses/locations`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to create location");
  }
  return json.data;
};

export const fetchStockByLocation = async (locationId) => {
  const res = await fetch(`${API_BASE_URL}/warehouses/locations/${locationId}/stock`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch stock for location");
  }
  return json.data;
};

export default {
  fetchWarehouses,
  fetchWarehouseById,
  createWarehouse,
  updateWarehouse,
  fetchLocations,
  createLocation,
  fetchStockByLocation,
};
