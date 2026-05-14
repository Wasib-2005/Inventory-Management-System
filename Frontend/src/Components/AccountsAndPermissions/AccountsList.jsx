import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { FiUsers, FiAlertCircle, FiInbox } from "react-icons/fi";
import { PALETTE } from "../../Theme/palette";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import AccountListItem from "./AccountItem";
import axios from "axios";

const PAGE_SIZE = 15;
const API = import.meta.env.VITE_BACKEND_API_HEADER;

const AccountsList = ({ filters }) => {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const pageRef = useRef(1);
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);

  const fetchPage = useCallback(
    async (pageNum) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          page: pageNum,
          limit: PAGE_SIZE,
          ...filters,
        });
        const res = await fetch(
          `${API}/api/accounts-and-permissions?${params}`,
          { credentials: "include" },
        );
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        const data = await res.json();
        const incoming = Array.isArray(data) ? data : (data.accounts ?? []);
        const more = incoming.length === PAGE_SIZE;
        setItems((prev) => (pageNum === 1 ? incoming : [...prev, ...incoming]));
        setHasMore(more);
        hasMoreRef.current = more;
      } catch (err) {
        setError(err.message);
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [filters],
  ); // re-runs when filters change

  // Reset + fetch on filter change
  useEffect(() => {
    pageRef.current = 1;
    hasMoreRef.current = true;
    setItems([]);
    setHasMore(true);
    fetchPage(1);
  }, [fetchPage]);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMoreRef.current &&
          !loadingRef.current
        ) {
          pageRef.current += 1;
          fetchPage(pageRef.current);
        }
      },
      { threshold: 0.1 },
    );
    if (sentinelRef.current) observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchPage]);

  const handleRoleChange = async (id, newRole) => {
    // 1. Optimistic UI update (update the UI immediately)
    setItems((prev) =>
      prev.map((a) => (a._id === id ? { ...a, userType: newRole } : a)),
    );

    try {
      // 2. Axios PATCH request
      // Note: Axios automatically stringifies the body and sets Content-Type to application/json
      await axios.patch(
        `${API}/api/change_role`,
        {
          userId: id,
          userType: newRole,
        },
        {
          withCredentials: true, // This replaces credentials: "include"
        },
      );

      // If we reach here, the request was successful (200-299 status)
    } catch (err) {
      console.error("Role update failed:", err.response?.data || err.message);

      // 3. Revert on error
      // We reset the page and re-fetch to ensure the UI matches the server state
      pageRef.current = 1;
      fetchPage(1);
    }
  };

  const retry = () => {
    pageRef.current = 1;
    hasMoreRef.current = true;
    setHasMore(true);
    setItems([]);
    fetchPage(1);
  };

  return (
    <div
      className={`mx-1 md:mx-0 ${commonComponentBG} md:w-full mt-3 flex flex-col h-[calc(80.5vh)] md:h-[calc(100vh-190px)]`}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 px-3.5 py-2.5 flex-shrink-0">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center"
          style={{ background: PALETTE.mint }}
        >
          <FiUsers size={11} className="text-white" />
        </div>
        <span className="text-[11px] font-bold text-emerald-900/60 uppercase tracking-wider">
          Accounts
        </span>
        {items.length > 0 && (
          <span
            className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-md"
            style={{ background: "rgba(47,160,132,0.12)", color: PALETTE.mint }}
          >
            {items.length}
            {hasMore ? "+" : ""}
          </span>
        )}
      </div>
      <div className="h-px bg-emerald-300/40 flex-shrink-0" />

      {/* List */}
      <div className="flex-1 overflow-y-auto md:px-3 py-2.5 flex flex-col gap-2 ">
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-2 py-10 text-center"
          >
            <FiAlertCircle size={20} className="text-red-400" />
            <p className="text-[12px] text-red-500/70">{error}</p>
            <button
              onClick={retry}
              className="text-[11px] font-semibold px-3 py-1.5 rounded-lg mt-1"
              style={{
                background: "rgba(47,160,132,0.12)",
                color: PALETTE.mint,
                border: "1px solid rgba(47,160,132,0.25)",
              }}
            >
              Retry
            </button>
          </motion.div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-center border">
            <FiInbox size={20} className="text-emerald-400/50" />
            <p className="text-[12px] text-emerald-900/40">No accounts found</p>
          </div>
        )}

        {items.map((account) => (
          <AccountListItem
            key={account._id}
            account={account}
            onRoleChange={handleRoleChange}
          />
        ))}

        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl px-4 py-3.5 flex items-center gap-3 animate-pulse"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(52,211,153,0.12)",
                borderLeft: "3px solid rgba(52,211,153,0.18)",
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex-shrink-0"
                style={{ background: "rgba(52,211,153,0.10)" }}
              />
              <div className="flex-1 flex flex-col gap-2">
                <div
                  className="h-3.5 rounded-lg w-1/3"
                  style={{ background: "rgba(52,211,153,0.10)" }}
                />
                <div
                  className="h-3 rounded-lg w-1/2"
                  style={{ background: "rgba(52,211,153,0.07)" }}
                />
              </div>
            </div>
          ))}

        <div ref={sentinelRef} className="h-1 w-full" />

        {!hasMore && items.length > 0 && !loading && (
          <div className="flex items-center gap-2 py-2 px-1">
            <div className="flex-1 h-px bg-emerald-200/60" />
            <span className="text-[10px] text-emerald-900/30 tracking-wider uppercase">
              all loaded
            </span>
            <div className="flex-1 h-px bg-emerald-200/60" />
          </div>
        )}
      </div>
    </div>
  );
};
export default AccountsList;
