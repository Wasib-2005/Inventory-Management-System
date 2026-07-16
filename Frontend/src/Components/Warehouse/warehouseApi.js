// ---------------------------------------------------------------------------
// Thin fetch wrapper around the warehouse/rack/shelf REST endpoints.
//
// Warehouse endpoints are live per the router shown:
//   GET    /api/warehouses/get
//   GET    /api/warehouses/get/:id
//   POST   /api/warehouses/create
//   PUT    /api/warehouses/update/:id
//   DELETE /api/warehouses/delete/:id
//   PATCH  /api/warehouses/restore/:id
//
// Rack/Shelf endpoints are NOT built yet on the backend. The calls below
// assume the same REST convention the warehouse router already uses
// (create/update/:id/delete/:id/restore/:id) so the frontend is ready to
// go the moment those routes exist. Update BASE paths here if the real
// routes differ once they land.
// ---------------------------------------------------------------------------

const BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  "https://localhost:5000/api";

const request = async (path, options = {}) => {
  const res = await fetch(`${BASE_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // no body / not JSON
  }

  if (!res.ok || data?.success === false) {
    const message = data?.message || data?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data;
};

// ---- Warehouses -----------------------------------------------------------

export const fetchWarehouses = () => request("/warehouses/get");

export const fetchWarehouseById = (id) => request(`/warehouses/get/${id}`);

export const createWarehouse = (body) =>
  request("/warehouses/create", { method: "POST", body: JSON.stringify(body) });

export const updateWarehouse = (id, body) =>
  request(`/warehouses/update/${id}`, { method: "PUT", body: JSON.stringify(body) });

export const deleteWarehouse = (id) =>
  request(`/warehouses/delete/${id}`, { method: "DELETE" });

export const restoreWarehouse = (id) =>
  request(`/warehouses/restore/${id}`, { method: "PATCH" });

// ---- Racks (endpoints assumed - not yet implemented on the backend) -------

export const createRack = (body) =>
  request("/racks/create", { method: "POST", body: JSON.stringify(body) });

export const updateRack = (id, body) =>
  request(`/racks/update/${id}`, { method: "PUT", body: JSON.stringify(body) });

export const deleteRack = (id) =>
  request(`/racks/delete/${id}`, { method: "DELETE" });

export const restoreRack = (id) =>
  request(`/racks/restore/${id}`, { method: "PATCH" });

// ---- Shelves (endpoints assumed - not yet implemented on the backend) -----

export const createShelf = (body) =>
  request("/shelves/create", { method: "POST", body: JSON.stringify(body) });

export const updateShelf = (id, body) =>
  request(`/shelves/update/${id}`, { method: "PUT", body: JSON.stringify(body) });

export const deleteShelf = (id) =>
  request(`/shelves/delete/${id}`, { method: "DELETE" });

export const restoreShelf = (id) =>
  request(`/shelves/restore/${id}`, { method: "PATCH" });
