const API_BASE_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("stocksense_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

/* ==========================================================================
   WAREHOUSES API
   ========================================================================== */

/**
 * Fetch paginated list of warehouses with search and status filters
 * @param {Object} params - { page, limit, search, status }
 */
export const getWarehouses = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search && params.search.trim()) queryParams.append("search", params.search.trim());
  if (params.status && params.status !== "All" && params.status !== "ALL") {
    queryParams.append("status", params.status);
  }

  const res = await fetch(`${API_BASE_URL}/warehouses?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Unable to load warehouses.");
  }
  return json;
};

/**
 * Fetch full warehouse details including its locations and stock metrics
 * @param {string} id - Warehouse UUID
 */
export const getWarehouse = async (id) => {
  const res = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Unable to load warehouse details.");
  }
  return json.data;
};

/**
 * Create a new warehouse
 * @param {Object} data - { name, address, status }
 */
export const createWarehouse = async (data) => {
  const res = await fetch(`${API_BASE_URL}/warehouses`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to create warehouse.");
  }
  return json;
};

/**
 * Update an existing warehouse (name, address, status)
 * @param {string} id - Warehouse UUID
 * @param {Object} data - { name, address, status }
 */
export const updateWarehouse = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/warehouses/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to update warehouse.");
  }
  return json;
};

/**
 * Deactivate a warehouse (blocked if inventory exists)
 * @param {string} id - Warehouse UUID
 */
export const deactivateWarehouse = async (id) => {
  const res = await fetch(`${API_BASE_URL}/warehouses/${id}/deactivate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to deactivate warehouse.");
  }
  return json;
};

/* ==========================================================================
   LOCATIONS API
   ========================================================================== */

/**
 * Fetch paginated list of locations across warehouses
 * @param {Object} params - { page, limit, search, warehouseId, status }
 */
export const getLocations = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search && params.search.trim()) queryParams.append("search", params.search.trim());
  if (params.warehouseId && params.warehouseId !== "All") {
    queryParams.append("warehouseId", params.warehouseId);
  }
  if (params.status && params.status !== "All" && params.status !== "ALL") {
    queryParams.append("status", params.status);
  }

  const res = await fetch(`${API_BASE_URL}/locations?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Unable to load locations.");
  }
  return json;
};

/**
 * Fetch detailed location information including live product inventory
 * @param {string} id - Location UUID
 */
export const getLocation = async (id) => {
  const res = await fetch(`${API_BASE_URL}/locations/${id}`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Unable to load location details.");
  }
  return json.data;
};

/**
 * Fetch all locations for a specific warehouse
 * @param {string} warehouseId - Warehouse UUID
 * @param {string} [status] - Optional status filter (ACTIVE / INACTIVE)
 */
export const getWarehouseLocations = async (warehouseId, status = null) => {
  const query = status ? `?status=${status}` : "";
  const res = await fetch(`${API_BASE_URL}/warehouses/${warehouseId}/locations${query}`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to load warehouse locations.");
  }
  return json.data;
};

/**
 * Create a new location in a warehouse
 * @param {Object} data - { warehouseId, name, status }
 */
export const createLocation = async (data) => {
  const res = await fetch(`${API_BASE_URL}/locations`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to create location.");
  }
  return json;
};

/**
 * Update an existing location (name, status)
 * @param {string} id - Location UUID
 * @param {Object} data - { name, status }
 */
export const updateLocation = async (id, data) => {
  const res = await fetch(`${API_BASE_URL}/locations/${id}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to update location.");
  }
  return json;
};

/**
 * Deactivate a location (blocked if inventory exists)
 * @param {string} id - Location UUID
 */
export const deactivateLocation = async (id) => {
  const res = await fetch(`${API_BASE_URL}/locations/${id}/deactivate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to deactivate location.");
  }
  return json;
};

/**
 * Fetch product stock stored at a location
 * @param {string} locationId - Location UUID
 */
export const getLocationStock = async (locationId) => {
  const data = await getLocation(locationId);
  return data.inventory || [];
};

/* ==========================================================================
   BACKWARDS COMPATIBILITY ALIASES
   ========================================================================== */
export const fetchWarehouses = async () => {
  const res = await getWarehouses({ limit: 100, status: "ACTIVE" });
  return res.data || [];
};

export const fetchWarehouseById = getWarehouse;

export const fetchLocations = async (warehouseId = null) => {
  if (warehouseId && warehouseId !== "All") {
    return await getWarehouseLocations(warehouseId, "ACTIVE");
  }
  const res = await getLocations({ limit: 100, status: "ACTIVE" });
  return res.data || [];
};

export const fetchStockByLocation = getLocationStock;

export default {
  getWarehouses,
  getWarehouse,
  createWarehouse,
  updateWarehouse,
  deactivateWarehouse,
  getLocations,
  getLocation,
  getWarehouseLocations,
  createLocation,
  updateLocation,
  deactivateLocation,
  getLocationStock,
  fetchWarehouses,
  fetchWarehouseById,
  fetchLocations,
  fetchStockByLocation,
};
