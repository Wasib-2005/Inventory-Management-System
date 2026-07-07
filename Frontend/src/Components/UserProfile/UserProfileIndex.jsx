import { useState, useContext, useEffect, useMemo } from "react";
import { UserContext } from "../../Contexts/UserContexts/UserContext";
import ProfileHeader from "./components/ProfileHeader";
import ProfileInfo from "./components/ProfileInfo";
import ProfileAddress from "./components/ProfileAddress";
import ProfileEmployment from "./components/ProfileEmployment";
import ProfileEmergency from "./components/ProfileEmergency";
import { hybridEncrypt } from "../../Service/auth/auth";
import { MdOutlineEdit } from "react-icons/md";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import axios from "axios";
import DefaultProfileWarehouse from "./components/DefaultProfileWarehouse";
import ProfileWarehouseSelectorModal from "./components/DefaultProfileWarehouse/ProfileWarehouseSelectorModal";

const SELECTED_WAREHOUSE_LS_KEY = "selectedWarehouseId";

const normalizeWarehouse = (w) => ({
  ...w,
  id: w.warehouseId,
  mongoId: w._id,
});

const UserProfileIndex = () => {
  const { user, setUser } = useContext(UserContext);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(
    () => localStorage.getItem(SELECTED_WAREHOUSE_LS_KEY) || null,
  );
  const [isWarehouseSelectorModalOpen, setIsWarehouseSelectorModalOpen] =
    useState(false);
  const [placeQuery, setPlaceQuery] = useState("");
  const [idQuery, setIdQuery] = useState("");

  const selectedWarehouse = useMemo(
    () => warehouses.find((w) => w.id === selectedWarehouseId) || warehouses[0],
    [warehouses, selectedWarehouseId],
  );

  const filteredWarehouses = useMemo(() => {
    return warehouses.filter((w) => {
      const matchesPlace = (w.place ?? "")
        .toLowerCase()
        .includes(placeQuery.trim().toLowerCase());
      const matchesId = (w.id ?? "")
        .toLowerCase()
        .includes(idQuery.trim().toLowerCase());
      return matchesPlace && matchesId;
    });
  }, [warehouses, placeQuery, idQuery]);

  useEffect(() => {
    let cancelled = false;

    const fetchWarehouses = async () => {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_BACKEND_API_HEADER}/api/warehouses`,
          { withCredentials: true },
        );

        const raw = Array.isArray(res.data) ? res.data : res.data?.data;

        if (!cancelled && Array.isArray(raw)) {
          setWarehouses(raw.map(normalizeWarehouse));
        }
      } catch (err) {
        console.error("Failed to fetch warehouses:", err);
      }
    };

    fetchWarehouses();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedWarehouseId) {
      localStorage.setItem(SELECTED_WAREHOUSE_LS_KEY, selectedWarehouseId);
    }
  }, [selectedWarehouseId]);

  useEffect(() => {
    if (!selectedWarehouseId && warehouses.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedWarehouseId(warehouses[0].id);
    }
  }, [selectedWarehouseId, warehouses]);

  const handleSelectWarehouse = (warehouse) => {
    setSelectedWarehouseId(warehouse.id);
    localStorage.setItem(SELECTED_WAREHOUSE_LS_KEY, warehouse.id);
    setIsWarehouseSelectorModalOpen(false);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full text-emerald-700/60 font-semibold">
        Loading...
      </div>
    );
  }

  const handleEdit = () => {
    if (!user.canEditOwnData) {
      return toast.error(
        "You do not have permission to change your data. Please contact HR.",
      );
    }

    setDraft(structuredClone(user));
    setEditing(true);
  };

  const handleCancel = () => {
    setDraft(null);
    setEditing(false);
  };

  const handleChange = (path, value) => {
    setDraft((prev) => {
      const next = { ...prev };
      const keys = path.split(".");
      let ref = next;
      for (let i = 0; i < keys.length - 1; i++) {
        ref[keys[i]] = { ...ref[keys[i]] };
        ref = ref[keys[i]];
      }
      ref[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const handleSave = async () => {
    const result = await Swal.fire({
      title: "Confirm Changes?",
      text: "Please double-check your details. This is a one-time modification link. Once saved, your update permission will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, save changes!",
      cancelButtonText: "Review again",
      background: "#1f2937",
      color: "#fff",
    });

    if (!result.isConfirmed) return;

    setSaving(true);
    try {
      const payload = await hybridEncrypt(draft);

      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_HEADER}/api/update_own_data`,
        payload,
        { withCredentials: true },
      );

      if (res.data && res.data.success) {
        setUser(res.data.data);
        toast.success("Profile updated successfully!");
      } else {
        setUser(draft);
        toast.success("Profile updated.");
      }

      setEditing(false);
      setDraft(null);
    } catch (err) {
      console.error("Save failed:", err);
      const errMsg =
        err.response?.data?.message ||
        "Failed to update profile. Please try again.";
      toast.error(errMsg);
    } finally {
      setSaving(false);
    }
  };

  const data = editing ? draft : user;

  return (
    <div className="h-[90vh] overflow-auto flex flex-col gap-4 px-1 pb-5">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <h1 className="text-emerald-900 font-bold text-base uppercase tracking-widest">
          My Profile
        </h1>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest text-emerald-800/60 hover:text-emerald-900 bg-white/30 hover:bg-white/50 border border-emerald-300/40 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest text-white bg-emerald-600 hover:brightness-110 hover:scale-[1.02] active:scale-[0.94] border border-emerald-500 transition-all duration-200 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </>
          ) : (
            user.canEditOwnData && (
              <button
                onClick={handleEdit}
                className="p-1.5 rounded-lg text-xs font-bold uppercase tracking-widest text-emerald-800/60 hover:text-emerald-900 bg-white/30 hover:bg-white/50 border border-emerald-300/40 transition-all duration-200 hover:scale-95"
              >
                <MdOutlineEdit size={20} />
              </button>
            )
          )}
        </div>
      </div>

      <ProfileHeader
        photoUrl={data.photoUrl}
        roleTitle={data.roleTitle}
        displayName={data.displayName}
        username={data.username}
        employeeId={data.employeeId}
        isActive={data.isActive}
        isVerified={data.isVerified}
        editing={editing}
        onChange={handleChange}
      />

      <DefaultProfileWarehouse
        selectedWarehouse={selectedWarehouse}
        onOpenSwitchModal={() => setIsWarehouseSelectorModalOpen(true)}
      />

      <ProfileWarehouseSelectorModal
        isOpen={isWarehouseSelectorModalOpen}
        onClose={() => setIsWarehouseSelectorModalOpen(false)}
        placeQuery={placeQuery}
        setPlaceQuery={setPlaceQuery}
        idQuery={idQuery}
        setIdQuery={setIdQuery}
        filteredWarehouses={filteredWarehouses}
        selectedWarehouse={selectedWarehouse}
        onSelectWarehouse={handleSelectWarehouse}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ProfileInfo
          firstName={data.firstName}
          lastName={data.lastName}
          email={data.email}
          phone={data.phone}
          gender={data.gender}
          editing={editing}
          onChange={handleChange}
        />
        <ProfileEmployment
          employmentType={data.employmentType}
          employmentStatus={data.employmentStatus}
          timezone={data.timezone}
          language={data.language}
          editing={editing}
          onChange={handleChange}
        />
        <ProfileAddress
          address={data.address}
          editing={editing}
          onChange={handleChange}
        />
        <ProfileEmergency
          emergencyContact={data.emergencyContact}
          editing={editing}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default UserProfileIndex;