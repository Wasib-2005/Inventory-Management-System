import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API = import.meta.env.VITE_BACKEND_API_HEADER;

const RecycleBin = () => {
  const [items, setItems] = useState({ roles: [], products: [], users: [] });

  const loadItems = async () => {
    const [roles, products, users] = await Promise.all([
      axios.get(`${API}/api/roles/recycle-bin`, { withCredentials: true }),
      axios.get(`${API}/api/product/recycle-bin`, { withCredentials: true }),
      axios.get(`${API}/api/recycle-bin/users`, { withCredentials: true }),
    ]);
    setItems({
      roles: roles.data.data || [],
      products: products.data.data || [],
      users: users.data.data || [],
    });
  };

  useEffect(() => {
    loadItems().catch((error) =>
      toast.error(error.response?.data?.message || "Failed to load recycle bin"),
    );
  }, []);

  const restore = async (type, id) => {
    const paths = {
      roles: `/api/roles/restore/${id}`,
      products: `/api/product/restore/${id}`,
      users: `/api/restore_account/${id}`,
    };
    try {
      await axios.patch(`${API}${paths[type]}`, {}, { withCredentials: true });
      setItems((current) => ({
        ...current,
        [type]: current[type].filter((item) => item._id !== id),
      }));
      toast.success("Item restored successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to restore item");
    }
  };

  const sections = [
    ["roles", "Roles", (item) => item.roleTitle],
    ["products", "Products", (item) => item.name],
    ["users", "Users", (item) => item.displayName || item.username || item.email],
  ];

  return (
    <div className="min-h-full p-3 sm:p-5 lg:p-6">
      <h1 className="text-2xl font-bold text-emerald-900">Recycle Bin</h1>
      <p className="mt-1 text-base text-emerald-700/70">
        Restore deleted roles, products, and users.
      </p>
      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        {sections.map(([type, label, getName]) => (
          <section key={type} className="rounded-2xl border border-emerald-200 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold capitalize text-emerald-900">{label}</h2>
            <div className="mt-3 space-y-2">
              {items[type].length === 0 ? (
                <p className="text-base text-slate-500">Nothing in the recycle bin.</p>
              ) : (
                items[type].map((item) => (
                  <div key={item._id} className="flex items-center justify-between gap-3 rounded-xl bg-emerald-50 p-3">
                    <span className="min-w-0 truncate text-base font-medium text-slate-800">
                      {getName(item)}
                    </span>
                    <button
                      type="button"
                      onClick={() => restore(type, item._id)}
                      className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-base font-bold text-white hover:bg-emerald-700"
                    >
                      Restore
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default RecycleBin;
