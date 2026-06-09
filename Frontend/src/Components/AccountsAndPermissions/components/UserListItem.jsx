import UserAvatar from "./UserAvatar";

const UserListItem = ({ user, active, onClick }) => (
  <div
    onClick={onClick}
    role="button"
    tabIndex={0}
    onKeyDown={(e) => e.key === "Enter" && onClick()}
    className={`flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer border-b border-(--color-border-tertiary) last:border-b-0 transition-colors
      ${active
        ? "bg-[var(--color-background-primary)] border-l-2 border-l-[#1D9E75] pl-3"
        : "hover:bg-[var(--color-background-primary)]"
      }`}
  >
    <UserAvatar user={user} size="sm" />

    <div className="flex-1 min-w-0">
      <div className="text-[13px] font-medium truncate">
        {user.firstName} {user.lastName}
      </div>
      <div className="text-[11px] text-(--color-text-tertiary) truncate mt-0.5">
        {user.roleTitle} · {user.employmentStatus}
      </div>
    </div>

    <span
      className={`w-[7px] h-[7px] rounded-full shrink-0 ${user.isActive ? "bg-[#1D9E75]" : "bg-[#B4B2A9]"}`}
    />
  </div>
);

export default UserListItem;
