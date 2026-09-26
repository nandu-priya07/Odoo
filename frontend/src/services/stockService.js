const API_BASE_URL = "http://localhost:5000/api";

export const fetchStockLedger = async ({ transactionType = "All", search = "", date = "" } = {}) => {
  const params = new URLSearchParams();
  if (transactionType && transactionType !== "All") params.append("transactionType", transactionType);
  if (search) params.append("search", search);
  if (date) params.append("date", date);

  const res = await fetch(`${API_BASE_URL}/stock/ledger?${params.toString()}`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch stock move history");
  }
  return json.data;
};

export const fetchStockOverview = async () => {
  const res = await fetch(`${API_BASE_URL}/stock/overview`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch stock inventory");
  }
  return json.data;
};

export default {
  fetchStockLedger,
  fetchStockOverview,
};
