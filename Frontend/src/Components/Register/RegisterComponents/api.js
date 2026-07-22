import axios from "axios";

const API_BASE = import.meta.env.VITE_BACKEND_API_HEADER;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// ---- Product search (real endpoint) ----
export const searchProductsByName = (name, warehouseId, signal, limit = 8) =>
  api.get(`/api/product/get`, {
    params: { name, warehouseId, limit },
    signal,
  });

export const searchProductsByBarcode = (
  barcode,
  warehouseId,
  signal,
  limit = 8,
) =>
  api.get(`/api/product/get`, {
    params: { barcodes: barcode, warehouseId, limit },
    signal,
  });

// ---- User / account search (real endpoint) ----
// Used to look up an existing account (customer/employee record) and
// auto-fill the order's customer fields instead of typing them by hand.
export const searchUsers = (search, signal, limit = 8) =>
  api.get(`/api/accounts-and-permissions`, {
    params: { search, limit },
    signal,
  });

// ---- Orders (real endpoint) ----
export const createOrder = (payload) =>
  api.post(`/api/order/create-inside`, payload);

// TODO: UNCONFIRMED — no endpoint for this has been shown yet. Guessing
// PATCH /api/order/complete/:id sending { status: "complete" }. Replace
// with the real route once you've got it.
export const completeOrder = (orderId) =>
  api.patch(`/api/order/complete/${orderId}`, { status: "complete" });

// TODO: no GET-all order schema wired up on the frontend yet — swap this
// fake implementation for a real call once you need to list orders:
//   export const getOrders = (signal) => api.get(`/api/order/get`, { signal });
const FAKE_LATENCY = 300;
const ORDERS_STORAGE_KEY = "fakeOrders";

const readFakeOrders = () => {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

export const getOrders = (signal) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      resolve({ data: { success: true, data: readFakeOrders() } });
    }, FAKE_LATENCY);
    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      const err = new Error("Aborted");
      err.name = "CanceledError";
      reject(err);
    });
  });

export const getWarehouses = (signal) =>
  api.get(`/api/warehouses/get`, { signal });

// ---- Stock movements (Inbound / Outbound / Cycle Count) ----
// Real endpoints, one set per movement type.
const STOCK_MOVEMENT_ENDPOINTS = {
  inbound: { create: "/api/inbound/create", get: "/api/inbound/get" },
  outbound: { create: "/api/outbound/create", get: "/api/outbound/get" },
  count: { create: "/api/cycle-count/create", get: "/api/cycle-count/get" },
};

export const createStockMovement = (type, payload) =>
  api.post(STOCK_MOVEMENT_ENDPOINTS[type].create, payload);

export const getStockMovements = (type, signal) =>
  api.get(STOCK_MOVEMENT_ENDPOINTS[type].get, { signal });

export const getWarehouseById = (id, signal) =>
  api.get(`/api/warehouses/get/${id}`, { signal });

// ---- Returns & Warranty Claims ----
// NO backend schema for these exists yet, so this is a fake/mock
// implementation backed by localStorage, same pattern the stock movements
// used before those got wired to real endpoints. Swap for real calls once
// the endpoints exist, e.g.:
//   POST /api/returns/create   GET /api/returns/get
const RETURNS_STORAGE_KEY = "fakeReturnClaims";
const RETURN_REFERENCE_PREFIX = { return: "RET", warranty: "WAR" };

const readFakeReturns = () => {
  try {
    return JSON.parse(localStorage.getItem(RETURNS_STORAGE_KEY)) || [];
  } catch {
    return [];
  }
};

const writeFakeReturns = (list) => {
  localStorage.setItem(RETURNS_STORAGE_KEY, JSON.stringify(list));
};

export const createReturnClaim = (payload) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const list = readFakeReturns();
        const record = {
          _id: `fake-return-${Date.now()}`,
          reference: `${RETURN_REFERENCE_PREFIX[payload.type] || "RET"}-${new Date().getFullYear()}-${String(
            list.length + 1,
          ).padStart(4, "0")}`,
          createdAt: new Date().toISOString(),
          ...payload,
        };
        list.unshift(record);
        writeFakeReturns(list);
        resolve({ data: { success: true, data: record } });
      } catch (err) {
        reject(err);
      }
    }, FAKE_LATENCY);
  });

export const getReturnClaims = (signal) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      resolve({ data: { success: true, data: readFakeReturns() } });
    }, FAKE_LATENCY);
    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      const err = new Error("Aborted");
      err.name = "CanceledError";
      reject(err);
    });
  });

export default api;