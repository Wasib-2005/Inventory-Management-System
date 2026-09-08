import { useNavigate } from "react-router";
import { FiUsers, FiHome } from "react-icons/fi";

const HeaderActions = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-2 sm:flex items-stretch gap-2 w-full lg:w-auto">
      <button
        type="button"
        onClick={() => navigate("/warehouse")}
        className="flex items-center justify-center gap-2 text-[16px] font-bold text-emerald-800 bg-white/70 hover:bg-white border border-emerald-300/50 px-3 sm:px-4 py-3 rounded-xl transition-colors shadow-sm"
      >
        <FiHome size={16} />
        Warehouse
      </button>

      <button
        type="button"
        onClick={() => navigate("/accounts-and-permissions")}
        className="flex items-center justify-center gap-2 text-[16px] font-bold text-emerald-800 bg-white/70 hover:bg-white border border-emerald-300/50 px-3 sm:px-4 py-3 rounded-xl transition-colors shadow-sm"
      >
        <FiUsers size={16} />
        Manage Users
      </button>
    </div>
  );
};

export default HeaderActions;