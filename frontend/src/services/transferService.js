const API_BASE_URL = "http://localhost:5000/api";

export const fetchTransfers = async (status = "All", search = "") => {
  const params = new URLSearchParams();
  if (status && status !== "All") params.append("status", status);
  if (search) params.append("search", search);

  const res = await fetch(`${API_BASE_URL}/transfers?${params.toString()}`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch transfers");
  }
  return json.data;
};

export const fetchTransferById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/transfers/${id}`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch transfer details");
  }
  return json.data;
};

export const createTransfer = async (transferData) => {
  const res = await fetch(`${API_BASE_URL}/transfers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transferData),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to create transfer");
  }
  return json.data;
};

export const validateTransfer = async (id) => {
  const res = await fetch(`${API_BASE_URL}/transfers/${id}/validate`, {
    method: "PUT",
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to validate transfer");
  }
  return json;
};

export default {
  fetchTransfers,
  fetchTransferById,
  createTransfer,
  validateTransfer,
};
