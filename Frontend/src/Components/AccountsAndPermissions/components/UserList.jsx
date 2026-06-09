import { IoPersonAddSharp } from "react-icons/io5";
import { CiSearch } from "react-icons/ci";
import UserListItem from "./UserListItem";
import { commonComponentBG } from "../../../Theme/commonComponentBG";

const UserList = ({
  users,
  selectedId,
  onSelect,
  onCreateClick,
  query,
  setQuery,
}) => {
  
  // The data array coming from props is already queried and filtered by the database
  const filtered = users; 

  return (
    <div className={`flex flex-col h-full overflow-hidden bg-(--color-background-secondary) ${commonComponentBG}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[var(--color-background-primary)] border-b border-(--color-border-tertiary) shrink-0">
        <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
          {filtered.length} user{filtered.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={onCreateClick}
          className="flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-[#1D9E75] text-white text-[12px] font-medium border border-[#0F6E56] hover:bg-[#0F6E56] transition-colors"
        >
          <IoPersonAddSharp size={13} />
          Create user
        </button>
      </div>

      {/* Search */}
      <div className="relative px-3 py-2.5 bg-[var(--color-background-primary)] border-b border-(--color-border-tertiary) shrink-0">
        <CiSearch
          className="absolute left-5 top-1/2 -translate-y-1/2 text-(--color-text-tertiary)"
          size={15}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, role…"
          className="w-full h-8 pl-7 pr-2 border border-(--color-border-secondary) rounded-md bg-(--color-background-secondary) text-(--color-text-primary) text-[12px] focus:outline-none focus:border-[#1D9E75]"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full text-[13px] text-(--color-text-tertiary) ">
            No users found
          </div>
        ) : (
          filtered.map((u) => (
            <UserListItem
              key={u._id}
              user={u}
              active={u._id === selectedId}
              onClick={() => onSelect(u._id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default UserList;