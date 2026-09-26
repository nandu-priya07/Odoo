const API_BASE_URL = "http://localhost:5000/api";

export const loginUser = async (email, password) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Login failed");
  }
  if (json.token) {
    localStorage.setItem("stocksense_token", json.token);
    localStorage.setItem("stocksense_user", JSON.stringify(json.user));
  }
  return json;
};

export const signupUser = async (name, email, password) => {
  const res = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const json = await res.json();
  if (!res.ok || !json.success) {
    throw new Error(json.message || "Signup failed");
  }
  return json;
};

export const logoutUser = () => {
  localStorage.removeItem("stocksense_token");
  localStorage.removeItem("stocksense_user");
};

export const getCurrentUser = () => {
  const userStr = localStorage.getItem("stocksense_user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

export const getToken = () => {
  return localStorage.getItem("stocksense_token");
};

export default {
  loginUser,
  signupUser,
  logoutUser,
  getCurrentUser,
  getToken,
};
