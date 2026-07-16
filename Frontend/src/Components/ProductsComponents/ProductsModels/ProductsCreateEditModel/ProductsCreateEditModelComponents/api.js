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


export const deleteCategory = (categoryId) =>
  axios.delete(`${API_BASE}/category/${categoryId}`, { withCredentials: true });

export const searchSuppliers = (search, signal) =>
  axios.get(`${API_BASE}/suppliers`, {
    params: { search },
    signal,
    withCredentials: true,
  });

export const createSupplier = (payload) =>
  axios.post(`${API_BASE}/suppliers`, payload, { withCredentials: true });

export const deleteSupplier = (supplierId) =>
  axios.delete(`${API_BASE}/suppliers/${supplierId}`, { withCredentials: true });

export const searchTags = (search, signal) =>
  axios.get(`${API_BASE}/tags`, { params: { search }, signal });

export const getProduct = (productId) =>
  axios.get(`${API_BASE}/product/get/${productId}`, { withCredentials: true });

export const createProduct = (formData) =>
  axios.post(`${API_BASE}/product/create`, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateProduct = (productId, formData) =>
  axios.put(`${API_BASE}/product/update/${productId}`, formData, {
    withCredentials: true,
    headers: { "Content-Type": "multipart/form-data" },
  });
