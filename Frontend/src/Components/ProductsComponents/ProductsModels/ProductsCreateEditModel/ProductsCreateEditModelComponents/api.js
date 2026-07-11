import axios from "axios";

const API_BASE = `${import.meta.env.VITE_BACKEND_API_HEADER}/api`;

export const searchCategories = (search, signal) =>
  axios.get(`${API_BASE}/category`, {
    params: { search },
    signal,
    withCredentials: true,
  });

export const createCategory = (payload) =>
  axios.post(`${API_BASE}/category`, payload, { withCredentials: true });

export const searchSuppliers = (search, signal) =>
  axios.get(`${API_BASE}/suppliers`, {
    params: { search },
    signal,
    withCredentials: true,
  });

// payload: { suppliersName, code, place }
export const createSupplier = (payload) =>
  axios.post(`${API_BASE}/suppliers`, payload, { withCredentials: true });

export const searchTags = (search, signal) =>
  axios.get(`${API_BASE}/tags`, { params: { search }, signal });
