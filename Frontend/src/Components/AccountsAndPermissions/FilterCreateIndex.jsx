import { useEffect, useState } from "react";
import UserList from "./components/UserList";
import UserDetailPanel from "./components/UserDetailPanel";
import UserDetailEmpty from "./components/UserDetailEmpty";
import CreateUserModal from "./components/CreateUserModal/CreateUserModal";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import axios from "axios";
import { toast } from "react-toastify";
import { hybridEncrypt } from "../../Service/auth/auth";
import useGetRole from "../../Hooks/useGetRoles";
import useDebounce from "../../Hooks/useDebounce";

const FilterCreateIndex = () => {
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const { roles } = useGetRole();
  const roleOptions = roles.length > 0 ? roles : ["user"];

  // FIX: Derived state! This automatically keeps your selection updated
  // whenever the 'users' array or 'selectedId' changes.
  const selectedUser = users.find((u) => u._id === selectedId) ?? null;

  const debouncedQuery = useDebounce(query, 500);

  const handleSelect = (_id) => setSelectedId(_id);

  const fetchUsers = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: 1, limit: 15, ...filters });
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
    fetchUsers({ search: debouncedQuery });
  }, [debouncedQuery]);

  // FIX: Handles state mutation securely using backend return value
  const handleSave = async (updated) => {
    try {
      const payload = await hybridEncrypt(updated);
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_API_HEADER}/api/update_account`,
        payload,
        { withCredentials: true },
      );

      // Access the fresh database user payload sent from your backend
      const updatedUserData = response.data?.data || response.data;

      // Update the user item directly inside the master state array
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === updatedUserData._id ? updatedUserData : user,
        ),
      );

      toast.success("User updated successfully");
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || error.message || "An error occurred",
      );
    }
  };

  const handleDelete = (_id) => {
    setUsers((prev) => prev.filter((u) => u._id !== _id));
    setSelectedId(null);
  };

  const handleCreate = (formData) => {
    const newUser = {
      ...formData,
      _id: Date.now().toString(), // Stringified to match schema IDs safely
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
    <div className="relative w-full h-[calc(100vh-30px)] md:h-[calc(100vh-90px)] overflow-hidden grid md:grid-cols-[2fr_3fr] gap-3">
      {/* LEFT — detail */}
      <div
        className={`flex flex-col overflow-hidden ${commonComponentBG("l")} overflow-auto ${selectedUser ? " fixed md:relative left-5 md:left-auto top-5 md:top-auto z-50 md:z-auto w-[90%] md:w-auto h-[95%] md:h-full " : " hidden md:inline "} `}
      >
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
      <div className={`flex flex-col overflow-hidden ${commonComponentBG("r")} overflow-auto`}>
        <UserList
          users={users}
          selectedId={selectedId}
          onSelect={handleSelect}
          onCreateClick={() => setShowCreate(true)}
          query={query}
          setQuery={setQuery}
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
