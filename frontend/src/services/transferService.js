const API_BASE_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("stocksense_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getTransfers = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append("search", params.search);
  if (params.status && params.status !== "All") queryParams.append("status", params.status);
  if (params.warehouse && params.warehouse !== "All") queryParams.append("warehouse", params.warehouse);
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);

  const res = await fetch(`${API_BASE_URL}/transfers?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch transfers");
  }
  return json;
};

export const getTransfer = async (id) => {
  const res = await fetch(`${API_BASE_URL}/transfers/${id}`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch transfer details");
  }
  return json.data;
};

export const createTransfer = async (data) => {
  const res = await fetch(`${API_BASE_URL}/transfers`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Unable to create transfer.");
  }
  return json.data;
};

export const updateTransferStatus = async (id, status) => {
  const res = await fetch(`${API_BASE_URL}/transfers/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to update transfer status");
  }
  return json.data;
};

export const validateTransfer = async (id) => {
  const res = await fetch(`${API_BASE_URL}/transfers/${id}/validate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Unable to validate transfer.");
  }
  return json.data;
};

export const cancelTransfer = async (id) => {
  const res = await fetch(`${API_BASE_URL}/transfers/${id}/cancel`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to cancel transfer");
  }
  return json.data;
};

export const getLocationStock = async (productId, locationId) => {
  const res = await fetch(
    `${API_BASE_URL}/transfers/stock?productId=${productId}&locationId=${locationId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch location stock");
  }
  return json.data.availableStock;
};

// Aliases for compatibility
export const fetchTransfers = getTransfers;
export const fetchTransferById = getTransfer;

export default {
  getTransfers,
  getTransfer,
  createTransfer,
  updateTransferStatus,
  validateTransfer,
  cancelTransfer,
  getLocationStock,
  fetchTransfers,
  fetchTransferById,
};
