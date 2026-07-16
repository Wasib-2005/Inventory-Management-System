import { useNavigate } from "react-router";
import { FiUsers } from "react-icons/fi";

const HeaderActions = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/accounts-and-permissions")}
      className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-white/70 hover:bg-white border border-emerald-300/50 px-2.5 py-1.5 rounded-lg transition-colors shadow-sm shrink-0"
    >
      <FiUsers size={13} />
      Manage Users
    </button>
  );
};

export default HeaderActions;