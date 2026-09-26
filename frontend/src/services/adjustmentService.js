const API_BASE_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("stocksense_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getAdjustments = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append("search", params.search);
  if (params.status && params.status !== "All") queryParams.append("status", params.status);
  if (params.warehouse && params.warehouse !== "All") queryParams.append("warehouse", params.warehouse);
  if (params.location && params.location !== "All") queryParams.append("location", params.location);
  if (params.product && params.product !== "All") queryParams.append("product", params.product);
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);

  const res = await fetch(`${API_BASE_URL}/adjustments?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch adjustments");
  }
  return json;
};

export const getAdjustment = async (id) => {
  const res = await fetch(`${API_BASE_URL}/adjustments/${id}`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch adjustment details");
  }
  return json.data;
};

export const createAdjustment = async (data) => {
  const res = await fetch(`${API_BASE_URL}/adjustments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Unable to create adjustment.");
  }
  return json.data;
};

export const updateAdjustmentStatus = async (id, status) => {
  const res = await fetch(`${API_BASE_URL}/adjustments/${id}/status`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ status }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to update adjustment status");
  }
  return json.data;
};

export const validateAdjustment = async (id) => {
  const res = await fetch(`${API_BASE_URL}/adjustments/${id}/validate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Unable to validate adjustment.");
  }
  return json.data;
};

export const cancelAdjustment = async (id) => {
  const res = await fetch(`${API_BASE_URL}/adjustments/${id}/cancel`, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to cancel adjustment");
  }
  return json.data;
};

export const getLocationStock = async (productId, locationId) => {
  const res = await fetch(
    `${API_BASE_URL}/adjustments/stock?productId=${productId}&locationId=${locationId}`,
    {
      headers: getAuthHeaders(),
    }
  );
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch current stock");
  }
  return json.data.systemQuantity;
};

// Aliases for compatibility
export const fetchAdjustments = getAdjustments;
export const fetchAdjustmentById = getAdjustment;

export default {
  getAdjustments,
  getAdjustment,
  createAdjustment,
  updateAdjustmentStatus,
  validateAdjustment,
  cancelAdjustment,
  getLocationStock,
  fetchAdjustments,
  fetchAdjustmentById,
};
