import { useEffect, useState } from "react";
import UserList from "./components/UserList";
import UserDetailPanel from "./components/UserDetailPanel";
import UserDetailEmpty from "./components/UserDetailEmpty";
import CreateUserModal from "./components/CreateUserModal";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import axios from "axios";
import { toast } from "react-toastify";
import { hybridEncrypt } from "../../Service/auth/auth";
import useGetRole from "../../Hooks/useGetRoles"; // Assuming this path is correct

const FilterCreateIndex = () => {
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);

  // Use the custom hook correctly at the top level
  const { roles, loading: rolesLoading } = useGetRole();

  // Provide a fallback default if roles haven't loaded yet or are empty
  const roleOptions = roles.length > 0 ? roles : ["user"];

  const selectedUser = users.find((u) => u._id === selectedId) ?? null;

  const handleSelect = (_id) => setSelectedId(_id);

  const fetchUsers = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: 1, limit: 50, ...filters });
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_API_HEADER}/api/accounts-and-permissions?${params}`,
        { withCredentials: true },
      );
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (updated) => {
    console.log(updated);
    try {
      const payload = await hybridEncrypt(updated);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_HEADER}/api/update_account`,
        payload,
        { withCredentials: true },
      );
      console.log(response);
    } catch (error) {
      console.log(error);
      toast.error(error.message || "An error occurred");
    }
  };

  const handleDelete = (_id) => {
    setUsers((prev) => prev.filter((u) => u._id !== _id));
    setSelectedId(null);
  };

  const handleCreate = (formData) => {
    const newUser = {
      ...formData,
      _id: Date.now(),
      displayName: `${formData.firstName} ${formData.lastName[0]}.`,
      empStatus: "Active",
      isActive: true,
      isVerified: false,
      emailVerified: false,
      hireDate: new Date().toISOString().substring(0, 10),
      manager: "—",
      dob: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      emName: "",
      emRel: "",
      emPhone: "",
    };
    setUsers((prev) => [newUser, ...prev]);
    setSelectedId(newUser._id);
  };

  return (
    <div className="relative w-full h-[calc(100vh-30px)] md:h-[calc(100vh-90px)] rounded-xl overflow-hidden grid md:grid-cols-[2fr_3fr] gap-3">
      {/* LEFT — detail */}
      <div className={`flex flex-col overflow-hidden ${commonComponentBG} ${selectedUser ? " fixed md:relative left-5 md:left-auto top-5 md:top-auto z-50 md:z-auto w-[90%] md:w-auto h-[95%] md:h-full " : " hidden md:inline "} `}>
        {selectedUser ? (
          <UserDetailPanel
            user={selectedUser}
            setSelectedId={setSelectedId}
            onSave={handleSave}
            onDelete={handleDelete}
          />
        ) : (
          <UserDetailEmpty />
        )}
      </div>

      {/* RIGHT — list */}
      <div className={`flex flex-col overflow-hidden ${commonComponentBG}`}>
        <UserList
          users={users}
          selectedId={selectedId}
          onSelect={handleSelect}
          onCreateClick={() => setShowCreate(true)}
        />
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateUserModal
          roleOptions={roleOptions}
          onClose={() => setShowCreate(false)}
          onSubmit={handleCreate}
        />
      )}
    </div>
  );
};

export default FilterCreateIndex;