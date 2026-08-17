import { useNavigate } from "react-router";
import { FiUsers } from "react-icons/fi";

const HeaderActions = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/accounts-and-permissions")}
      className="flex items-center gap-2 text-sm font-bold text-emerald-800 bg-white/70 hover:bg-white border border-emerald-300/50 px-4 py-2.5 rounded-xl transition-colors shadow-sm shrink-0"
    >
      <FiUsers size={16} />
      Manage Users
    </button>
  );
};

export default HeaderActions;