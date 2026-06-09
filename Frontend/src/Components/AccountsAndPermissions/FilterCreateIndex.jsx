import { useEffect, useState } from "react";
import UserList from "./components/UserList";
import UserDetailPanel from "./components/UserDetailPanel";
import UserDetailEmpty from "./components/UserDetailEmpty";
import CreateUserModal from "./components/CreateUserModal";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import axios from "axios";
import { toast } from "react-toastify";
import { hybridEncrypt } from "../../Service/auth/auth";
import useGetRole from "../../Hooks/useGetRoles";
import useDebounce from "../../Hooks/useDebounce"; // 1. Import your new hook

const FilterCreateIndex = () => {
  const [users, setUsers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const { roles } = useGetRole();
  const roleOptions = roles.length > 0 ? roles : ["user"];
  const selectedUser = users.find((u) => u._id === selectedId) ?? null;

  // 2. Consume the debounce hook here
  // debouncedQuery will only change when the user STOPS typing for 400ms
  const debouncedQuery = useDebounce(query, 400);

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

  // 3. Trigger the network fetch only when the debounced query undergoes an actual change
  useEffect(() => {
    fetchUsers({ search: debouncedQuery });
  }, [debouncedQuery]); 

  const handleSave = async (updated) => {
    try {
      const payload = await hybridEncrypt(updated);
      await axios.post(
        `${import.meta.env.VITE_BACKEND_API_HEADER}/api/update_account`,
        payload,
        { withCredentials: true },
      );
      toast.success("User updated successfully");
    } catch (error) {
      console.error(error);
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
      dob: "", street: "", city: "", state: "", postalCode: "", country: "",
      emName: "", emRel: "", emPhone: "",
    };
    setUsers((prev) => [newUser, ...prev]);
    setSelectedId(newUser._id);
  };

  return (
    <div className="relative w-full h-[calc(100vh-30px)] md:h-[calc(100vh-90px)] rounded-xl overflow-hidden grid md:grid-cols-[2fr_3fr] gap-3">
      {/* LEFT — detail */}
      <div className={`flex flex-col overflow-hidden ${commonComponentBG} ${selectedUser ? " fixed md:relative left-5 md:left-auto top-5 md:top-auto z-50 md:z-auto w-[90%] md:w-auto h-[95%] md:h-full " : " hidden md:inline "} `}>
        {selectedUser ? (
          <UserDetailPanel user={selectedUser} setSelectedId={setSelectedId} onSave={handleSave} onDelete={handleDelete} />
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
          query={query} // Keeps the input field snappy and responsive instantly
          setQuery={setQuery}
        />
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateUserModal roleOptions={roleOptions} onClose={() => setShowCreate(false)} onSubmit={handleCreate} />
      )}
    </div>
  );
};

export default FilterCreateIndex;