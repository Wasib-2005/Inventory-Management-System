import { useEffect, useRef, useState } from "react";
import { FiSearch, FiUser } from "react-icons/fi";
import { searchUsers } from "./api";


const UserSearchPanel = ({ onSelectUser }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const controller = new AbortController();
    const debounce = setTimeout(() => {
      setIsLoading(true);
      setError("");
      searchUsers(query, controller.signal, 8)
        .then((res) => {
          setResults(res.data?.data || res.data || []);
          setIsOpen(true);
        })
        .catch((err) => {
          if (err.name !== "CanceledError") {
            setError(err.response?.data?.message || "Could not search users");
          }
        })
        .finally(() => setIsLoading(false));
    }, 350);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (user) => {
    onSelectUser(user);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const addressLine = (address) =>
    [address?.city, address?.state, address?.country]
      .filter(Boolean)
      .join(", ");

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
        Find Existing Account
      </label>
      <div className="relative">
        <FiSearch
          size={13}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/40"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          placeholder="Search by username, name, email, or phone..."
          className="w-full text-sm pl-8 pr-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
        />
      </div>

      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}

      {isOpen && (
        <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto bg-white border border-emerald-300/40 rounded-lg shadow-lg">
          {isLoading ? (
            <p className="text-[12px] text-emerald-700/40 italic p-3">
              Searching...
            </p>
          ) : results.length === 0 ? (
            <p className="text-[12px] text-emerald-700/40 italic p-3">
              No matching accounts
            </p>
          ) : (
            results.map((user) => (
              <button
                key={user._id}
                type="button"
                onClick={() => handleSelect(user)}
                className="w-full flex items-center gap-3 p-2.5 text-left hover:bg-emerald-50/60 border-b border-emerald-100 last:border-b-0 transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {user.photoUrl ? (
                    <img
                      src={user.photoUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FiUser size={14} className="text-emerald-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-emerald-900 truncate">
                    {user.displayName || user.username}
                    {user.roleTitle && (
                      <span className="text-emerald-700/50 font-medium">
                        {" "}
                        · {user.roleTitle}
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-emerald-700/50 truncate">
                    {user.phone || user.email || "No contact on file"}
                    {addressLine(user.address) &&
                      ` · ${addressLine(user.address)}`}
                  </p>
                </div>
                {user.isActive === false && (
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full border bg-slate-100 text-slate-500 border-slate-200 shrink-0">
                    Inactive
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserSearchPanel;
