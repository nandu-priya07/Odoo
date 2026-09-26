const API_BASE_URL = "http://localhost:5000/api";

export const fetchAdjustments = async (status = "All", search = "") => {
  const params = new URLSearchParams();
  if (status && status !== "All") params.append("status", status);
  if (search) params.append("search", search);

  const res = await fetch(`${API_BASE_URL}/adjustments?${params.toString()}`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch stock adjustments");
  }
  return json.data;
};

export const fetchAdjustmentById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/adjustments/${id}`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch adjustment details");
  }
  return json.data;
};

export const createAdjustment = async (adjustmentData) => {
  const res = await fetch(`${API_BASE_URL}/adjustments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(adjustmentData),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to create adjustment");
  }
  return json.data;
};

export const validateAdjustment = async (id) => {
  const res = await fetch(`${API_BASE_URL}/adjustments/${id}/validate`, {
    method: "PUT",
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to validate adjustment");
  }
  return json;
};

export default {
  fetchAdjustments,
  fetchAdjustmentById,
  createAdjustment,
  validateAdjustment,
};
