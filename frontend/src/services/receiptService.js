const API_BASE_URL = "http://localhost:5000/api";

export const fetchReceipts = async (status = "All", warehouseId = "All", search = "") => {
  const params = new URLSearchParams();
  if (status && status !== "All") params.append("status", status);
  if (warehouseId && warehouseId !== "All") params.append("warehouseId", warehouseId);
  if (search) params.append("search", search);

  const res = await fetch(`${API_BASE_URL}/receipts?${params.toString()}`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch receipts");
  }
  return json.data;
};

export const fetchReceiptById = async (id) => {
  const res = await fetch(`${API_BASE_URL}/receipts/${id}`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch receipt details");
  }
  return json.data;
};

export const createReceipt = async (receiptData) => {
  const res = await fetch(`${API_BASE_URL}/receipts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(receiptData),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to create receipt");
  }
  return json.data;
};

export const validateReceipt = async (id) => {
  const res = await fetch(`${API_BASE_URL}/receipts/${id}/validate`, {
    method: "PUT",
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to validate receipt");
  }
  return json;
};

export default {
  fetchReceipts,
  fetchReceiptById,
  createReceipt,
  validateReceipt,
};
