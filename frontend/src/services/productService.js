const API_BASE_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token") || localStorage.getItem("stocksense_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const getProducts = async (params = {}) => {
  const queryParams = new URLSearchParams();
  if (params.search) queryParams.append("search", params.search);
  if (params.category && params.category !== "All") queryParams.append("category", params.category);
  if (params.stockStatus && params.stockStatus !== "All") queryParams.append("stockStatus", params.stockStatus);
  if (params.page) queryParams.append("page", params.page);
  if (params.limit) queryParams.append("limit", params.limit);

  const res = await fetch(`${API_BASE_URL}/products?${queryParams.toString()}`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Unable to load products.");
  }
  return json;
};

export const getProduct = async (id) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch product details");
  }
  return json.data;
};

export const createProduct = async (productData) => {
  const res = await fetch(`${API_BASE_URL}/products`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to create product");
  }
  return json.data;
};

export const updateProduct = async (id, productData) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(productData),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to update product");
  }
  return json.data;
};

export const deleteProduct = async (id) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "This product cannot be deleted because it has inventory history.");
  }
  return json;
};

export const getProductStock = async (id) => {
  const res = await fetch(`${API_BASE_URL}/products/${id}/stock`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch stock for product");
  }
  return json.data;
};

export const getCategories = async () => {
  const res = await fetch(`${API_BASE_URL}/categories`, {
    headers: getAuthHeaders(),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Failed to fetch categories");
  }
  return json.data;
};

export const fetchProducts = async (search = "", category = "All") => {
  const result = await getProducts({ search, category, limit: 100 });
  return result.data || [];
};

export default {
  getProducts,
  fetchProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductStock,
  getCategories,
};
