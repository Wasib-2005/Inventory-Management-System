import { IoPersonSharp } from "react-icons/io5";
import { getInitials } from "../data/helpers";

const UserAvatar = ({ user, size = "sm" }) => {
  const sizeClass = size === "lg" ? "w-12 h-12 text-base" : "w-[30px] h-[30px] text-[11px]";
  const iconSize = size === "lg" ? 22 : 14;

  return (
    <div
      className={`${sizeClass} rounded-full bg-[#9FE1CB] flex items-center justify-center font-medium text-[#085041] shrink-0 overflow-hidden uppercase tracking-wider`}
    >
      {user?.photoUrl ? (
        <img
          src={user.photoUrl}
          alt="User avatar"
          className="w-full h-full object-cover"
        />
      ) : user?.firstName || user?.lastName || user?.displayName || user?.email ? (
        <span>{getInitials(user)}</span>
      ) : (
        <IoPersonSharp size={iconSize} />
      )}
    </div>
  );
};

export default UserAvatar;