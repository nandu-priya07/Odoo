const API_BASE_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("stocksense_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getLedger = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);
  if (params.search) queryParams.append("search", params.search);
  if (params.transactionType && params.transactionType !== "All") {
    queryParams.append("transactionType", params.transactionType);
  }
  if (params.warehouseId && params.warehouseId !== "All") {
    queryParams.append("warehouseId", params.warehouseId);
  }
  if (params.locationId && params.locationId !== "All") {
    queryParams.append("locationId", params.locationId);
  }
  if (params.productId && params.productId !== "All") {
    queryParams.append("productId", params.productId);
  }
  if (params.fromDate) queryParams.append("fromDate", params.fromDate);
  if (params.toDate) queryParams.append("toDate", params.toDate);
  if (params.referenceNumber) queryParams.append("referenceNumber", params.referenceNumber);
  if (params.direction && params.direction !== "All") {
    queryParams.append("direction", params.direction);
  }

  const res = await fetch(`${API_BASE_URL}/stock-ledger?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Unable to load inventory movements.");
  }
  return json;
};

export const getLedgerDetails = async (id) => {
  const res = await fetch(`${API_BASE_URL}/stock-ledger/${id}`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Unable to load ledger details.");
  }
  return json.data;
};

export const getWarehouses = async () => {
  const res = await fetch(`${API_BASE_URL}/warehouses`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to load warehouses");
  }
  return json.data;
};

export const getLocations = async (warehouseId = null) => {
  const url = warehouseId && warehouseId !== "All"
    ? `${API_BASE_URL}/warehouses/locations?warehouse_id=${warehouseId}`
    : `${API_BASE_URL}/warehouses/locations`;
  const res = await fetch(url, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to load locations");
  }
  return json.data;
};

export const getProducts = async () => {
  const res = await fetch(`${API_BASE_URL}/products?limit=100`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to load products");
  }
  return json.data;
};

export default {
  getLedger,
  getLedgerDetails,
  getWarehouses,
  getLocations,
  getProducts,
};
