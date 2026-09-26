const API_BASE_URL = "http://localhost:5000/api";

export const fetchReorderRules = async () => {
  const res = await fetch(`${API_BASE_URL}/reorder-rules`);
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch reorder rules");
  }
  return json.data;
};

export const saveReorderRule = async (data) => {
  const res = await fetch(`${API_BASE_URL}/reorder-rules`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to save reorder rule");
  }
  return json.data;
};

export const deleteReorderRule = async (id) => {
  const res = await fetch(`${API_BASE_URL}/reorder-rules/${id}`, {
    method: "DELETE",
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to delete reorder rule");
  }
  return json;
};

export default {
  fetchReorderRules,
  saveReorderRule,
  deleteReorderRule,
};
