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
// NO backend schema for these exists yet, so this is a fake/mock
// implementation backed by localStorage. Swap for real calls once the
// endpoints exist, e.g.:
//   POST /api/inbound/create      GET /api/inbound/get
//   POST /api/outbound/create     GET /api/outbound/get
//   POST /api/cycle-count/create  GET /api/cycle-count/get

const STORAGE_KEYS = {
  inbound: "fakeInboundReceipts",
  outbound: "fakeOutboundDispatches",
  count: "fakeCycleCounts",
};
const REFERENCE_PREFIX = { inbound: "GRN", outbound: "DSP", count: "CYC" };

const readFake = (type) => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS[type])) || [];
  } catch {
    return [];
  }
};

const writeFake = (type, list) => {
  localStorage.setItem(STORAGE_KEYS[type], JSON.stringify(list));
};

export const createStockMovement = (type, payload) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      try {
        const list = readFake(type);
        const record = {
          _id: `fake-${type}-${Date.now()}`,
          reference: `${REFERENCE_PREFIX[type]}-${new Date().getFullYear()}-${String(
            list.length + 1,
          ).padStart(4, "0")}`,
          createdAt: new Date().toISOString(),
          ...payload,
        };
        list.unshift(record);
        writeFake(type, list);
        resolve({ data: { success: true, data: record } });
      } catch (err) {
        reject(err);
      }
    }, FAKE_LATENCY);
  });

export const getStockMovements = (type, signal) =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      resolve({ data: { success: true, data: readFake(type) } });
    }, FAKE_LATENCY);
    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      const err = new Error("Aborted");
      err.name = "CanceledError";
      reject(err);
    });
  });

export const getWarehouseById = (id, signal) =>
  api.get(`/api/warehouses/get/${id}`, { signal });

export const createReturnClaim = async (params) => {
  
}
export const getReturnClaims = async (params) => {
  
}

export default api;
