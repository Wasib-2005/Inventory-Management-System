import { getInitials } from "../data/helpers";


const UserAvatar = ({ user, size = "sm" }) => {
  const sizeClass = size === "lg" ? "w-12 h-12 text-base" : "w-[30px] h-[30px] text-[11px]";
  return (
    <div
      className={`${sizeClass} rounded-full bg-[#9FE1CB] flex items-center justify-center font-medium text-[#085041] shrink-0`}
    >
      {getInitials(user)}
    </div>
  );
};

export default UserAvatar;
