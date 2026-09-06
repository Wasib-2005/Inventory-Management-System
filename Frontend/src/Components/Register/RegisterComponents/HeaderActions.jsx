import { useNavigate } from "react-router";
import { FiUsers, FiHome } from "react-icons/fi";

const HeaderActions = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => navigate("/warehouse")}
        className="flex items-center gap-2 text-[16px] font-bold text-emerald-800 bg-white/70 hover:bg-white border border-emerald-300/50 px-4 py-2.5 rounded-xl transition-colors shadow-sm shrink-0"
      >
        <FiHome size={16} />
        Warehouse
      </button>

      <button
        type="button"
        onClick={() => navigate("/accounts-and-permissions")}
        className="flex items-center gap-2 text-[16px] font-bold text-emerald-800 bg-white/70 hover:bg-white border border-emerald-300/50 px-4 py-2.5 rounded-xl transition-colors shadow-sm shrink-0"
      >
        <FiUsers size={16} />
        Manage Users
      </button>
    </div>
  );
};

export default HeaderActions;