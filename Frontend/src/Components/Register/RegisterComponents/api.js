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

// TODO: UNCONFIRMED — no endpoint for this has been shown yet. Guessing
// PATCH /api/order/delivered/:id with no body. Replace with the real
// route once you've got it.
export const deliverOrder = (orderId) =>
  api.patch(`/api/order/delivered/${orderId}`, {});

// TODO: UNCONFIRMED — no endpoint for this has been shown yet. Guessing
// PATCH /api/order/confirm/:id sending { status: "confirmed" }. Replace
// with the real route once you've got it.
export const confirmOrder = (orderId) =>
  api.patch(`/api/order/confirm/${orderId}`, { status: "confirmed" });

// TODO: UNCONFIRMED — no payment-collection endpoint has been shown yet.
// Guessing PATCH /api/order/pay/:id sending { paidAmount, status },
// expected to return the updated order (new payment.paidAmount,
// payment.status, dueAmount). Replace with the real route once you have it.
export const payOrder = (orderId, payload) =>
  api.patch(`/api/order/pay/${orderId}`, payload);

// ---- Order lookup (real endpoint) — used by Returns & Warranty to pull
// order + item + purchase-date info by order ID (typed or barcode-scanned).
export const getOrderById = (orderId, signal) =>
  api.get(`/api/order/order-by-id/${orderId}`, { signal });

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

export const createStockMovement = (payload) => {
  return api.post("/api/movement/create", payload);
};

export const getStockMovements = (type, signal) =>
  api.get(`/api/movement/get`, { params: type ? { type } : {}, signal });

export const createCycleCount = (payload) =>
  api.post("/api/cycle-count/create", payload);

export const getCycleCounts = (signal) =>
  api.get("/api/cycle-count/get", { signal });

export const verifyStockTask = (type, id, status, note = "", options = {}) =>
  api.patch(
    type === "count"
      ? `/api/cycle-count/${id}/verify`
      : `/api/movement/${id}/verify`,
    { status, note, ...options },
  );

export const getWarehouseById = (id, signal) =>
  api.get(`/api/warehouses/get/${id}`, { signal });

// ---- Return / Warranty / Guarantee Claims (real endpoints) ----
export const createOrderServiceClaim = (payload) =>
  api.post(`/api/return-warranty-guarantee/create`, payload);

export const getOrderServiceClaim = (
  { page = 1, limit = 15, type, status, search } = {},
  signal,
) =>
  api.get(`/api/return-warranty-guarantee/get`, {
    params: { page, limit, type, status, search },
    signal,
  });

export const updateOrderServiceClaimStatus = (payload) =>
  api.patch(`/api/return-warranty-guarantee/update`, { payload });

export const getDebtCredit = (type, signal, { page = 1, limit = 15 } = {}) =>
  api.get(`/api/debt-credit/get`, { params: { type, page, limit }, signal });

export const payDebtCredit = (id, amount) =>
  api.patch(`/api/debt-credit/pay/${id}`, { amount });

export const searchDebtCredit = (
  orderId,
  signal,
  { page = 1, limit = 15 } = {},
) =>
  api.get(`/api/debt-credit/search`, {
    params: { orderid: orderId, page, limit },
    signal,
  });

export const getTotalDebt = (signal) =>
  api.get(`/api/debt-credit/total-debt`, { signal });

// ---- Suppliers (real endpoint) ----
export const searchSuppliers = (search, signal, limit = 8) =>
  api.get(`/api/suppliers`, {
    params: { search, limit },
    signal,
  });

// TODO: UNCONFIRMED — no update endpoint shown yet for stock movements.
// Guessing PATCH /api/{type}/update/:id. Replace with the real route
// once you've got it.
export const updateStockMovement = (type, id, payload) =>
  api.patch(`/api/movement/${id}`, payload);

export const recordMovementDiscrepancy = (id, payload) =>
  api.patch(`/api/movement/${id}/discrepancy`, payload);

export const recordCycleCountDiscrepancy = (id, payload) =>
  api.patch(`/api/cycle-count/${id}/discrepancy`, payload);

export const getEmergencyTasks = (signal) =>
  api.get("/api/emergency-tasks/get", { signal });

export const createEmergencyTask = (payload) =>
  api.post("/api/emergency-tasks/create", payload);

export const updateEmergencyTask = (id, payload) =>
  api.patch(`/api/emergency-tasks/${id}`, payload);

export default api;
