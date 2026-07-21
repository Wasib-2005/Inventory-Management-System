import { useEffect, useRef, useState } from "react";
import { FiSearch, FiUser, FiX } from "react-icons/fi";
import { searchUsers } from "../api";

const UserSelectField = ({ label, value, onChange, placeholder = "Search team member by name..." }) => {
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
    onChange(user);
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-[10px] font-bold text-emerald-700/60 uppercase mb-1">
        {label}
      </label>

      {value ? (
        <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg border border-emerald-300/50 bg-emerald-50/60">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-white border border-emerald-200 flex items-center justify-center shrink-0 overflow-hidden">
              {value.photoUrl ? (
                <img src={value.photoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <FiUser size={12} className="text-emerald-500" />
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-emerald-900 truncate">
                {value.displayName || value.username}
              </p>
              {value.roleTitle && (
                <p className="text-[10px] text-emerald-700/50 truncate">{value.roleTitle}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="p-1 text-emerald-700/40 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors shrink-0"
          >
            <FiX size={13} />
          </button>
        </div>
      ) : (
        <div className="relative">
          <FiSearch size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/40" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            placeholder={placeholder}
            className="w-full text-sm pl-8 pr-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
          />
        </div>
      )}

      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}

      {isOpen && !value && (
        <div className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-emerald-300/40 rounded-lg shadow-lg">
          {isLoading ? (
            <p className="text-[12px] text-emerald-700/40 italic p-3">Searching...</p>
          ) : results.length === 0 ? (
            <p className="text-[12px] text-emerald-700/40 italic p-3">No matches</p>
          ) : (
            results.map((user) => (
              <button
                key={user._id}
                type="button"
                onClick={() => handleSelect(user)}
                className="w-full flex items-center gap-3 p-2.5 text-left hover:bg-emerald-50/60 border-b border-emerald-100 last:border-b-0 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {user.photoUrl ? (
                    <img src={user.photoUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <FiUser size={13} className="text-emerald-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-semibold text-emerald-900 truncate">
                    {user.displayName || user.username}
                    {user.roleTitle && (
                      <span className="text-emerald-700/50 font-medium"> · {user.roleTitle}</span>
                    )}
                  </p>
                  <p className="text-[10px] text-emerald-700/50 truncate">
                    {user.employeeId ? `ID: ${user.employeeId}` : user.email}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default UserSelectField;