import { useRef, useCallback } from "react";
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
  hasMore,
  onLoadMore,
  isLoadingMore,
}) => {
  const observerRef = useRef(null);

  const sentinelCb = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node || !hasMore || isLoadingMore) return;
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      });
      observerRef.current.observe(node);
    },
    [hasMore, isLoadingMore, onLoadMore],
  );

  return (
    <div className={`flex flex-col h-full overflow-hidden bg-(--color-background-secondary) ${commonComponentBG("r")}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[var(--color-background-primary)] border-b border-(--color-border-tertiary) shrink-0">
        <span className="text-[12px] font-medium text-[var(--color-text-secondary)]">
          {users.length} user{users.length !== 1 ? "s" : ""}
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
        {users.length === 0 && !isLoadingMore ? (
          <div className="flex items-center justify-center h-full text-[13px] text-(--color-text-tertiary)">
            No users found
          </div>
        ) : (
          <>
            {users.map((u) => (
              <UserListItem
                key={u._id}
                user={u}
                active={u._id === selectedId}
                onClick={() => onSelect(u._id)}
              />
            ))}

            {/* Sentinel */}
            <div ref={sentinelCb} className="h-px" />

            {isLoadingMore && (
              <div className="flex items-center justify-center py-4 gap-2 text-[12px] text-(--color-text-tertiary)">
                <span className="w-3.5 h-3.5 rounded-full border-2 border-(--color-border-secondary) border-t-[#1D9E75] animate-spin" />
                Loading…
              </div>
            )}

            {!hasMore && users.length > 0 && (
              <div className="text-center py-3 text-[11px] text-(--color-text-tertiary) opacity-40">
                All users loaded
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserList;