import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { FiUsers, FiAlertCircle, FiInbox } from "react-icons/fi";
import { PALETTE } from "../../Theme/palette";
import { commonComponentBG } from "../../Theme/commonComponentBG";
import AccountListItem from "./AccountItem";

const PAGE_SIZE = 15;

const AccountsList = ({ accountsData, setAccountsData }) => {
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use a ref for page so the observer callback always sees the latest value
  // without needing to be in its dependency array
  const pageRef = useRef(1);
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false); // mirror of loading for the observer closure
  const hasMoreRef = useRef(true); // mirror of hasMore for the observer closure

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchPage = useCallback(async (pageNum) => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_API_HEADER}/api/accounts-and-permissions?page=${pageNum}&limit=${PAGE_SIZE}`,
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
  }, []);

  // Initial load only
  useEffect(() => {
    fetchPage(1);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Infinite scroll ───────────────────────────────────────────────────────
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
  }, [fetchPage]); // stable — fetchPage is memoised with useCallback([])

  // ── Mutation helpers ──────────────────────────────────────────────────────
  const handleRoleChange = async (id, newRole) => {
    setItems((prev) =>
      prev.map((acc) => (acc._id === id ? { ...acc, userType: newRole } : acc)),
    );
    try {
      await fetch(
        `https://localhost:5000/api/accounts-and-permissions/${id}/role`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ userType: newRole }),
        },
      );
    } catch {
      pageRef.current = 1;
      fetchPage(1);
    }
  };

  const handleRetry = () => {
    pageRef.current = 1;
    hasMoreRef.current = true;
    setHasMore(true);
    setItems([]);
    fetchPage(1);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={`mx-1 md:mx-0 ${commonComponentBG} md:w-full mt-3 flex flex-co  h-[calc(80.5vh)]  md:h-[calc(100vh-190px)] `}
      // style={{ height: "" }}
    >
      {/* Header */}
      <div className="flex items-center gap-1.5 px-3.5 py-2.5 flex-shrink-0">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
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

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto px-3 py-2.5 flex flex-col gap-2">
        {/* Error */}
        {error && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center gap-2 py-10 text-center"
          >
            <FiAlertCircle size={22} className="text-red-400" />
            <p className="text-[13px] text-red-500/80">{error}</p>
            <button
              onClick={handleRetry}
              className="text-[12px] font-semibold px-3 py-1.5 rounded-lg mt-1"
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

        {/* Empty */}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
            <FiInbox size={22} className="text-emerald-400/50" />
            <p className="text-[13px] text-emerald-900/40">No accounts found</p>
          </div>
        )}

        {/* Items */}
        {items.map((account) => (
          <AccountListItem
            key={account._id}
            account={account}
            onRoleChange={handleRoleChange}
          />
        ))}

        {/* Skeletons */}
        {loading &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`skel-${i}`}
              className="rounded-2xl px-4 py-3.5 flex items-center gap-3 animate-pulse"
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid rgba(52,211,153,0.12)",
                borderLeft: "3.5px solid rgba(52,211,153,0.2)",
              }}
            >
              <div
                className="w-11 h-11 rounded-full flex-shrink-0"
                style={{ background: "rgba(52,211,153,0.12)" }}
              />
              <div className="flex-1 flex flex-col gap-2">
                <div
                  className="h-3.5 rounded-md w-1/3"
                  style={{ background: "rgba(52,211,153,0.12)" }}
                />
                <div
                  className="h-3 rounded-md w-1/2"
                  style={{ background: "rgba(52,211,153,0.08)" }}
                />
              </div>
            </div>
          ))}

        {/* Sentinel */}
        <div ref={sentinelRef} className="h-1 w-full" />

        {/* End of list */}
        {!hasMore && items.length > 0 && !loading && (
          <p className="text-center text-[11px] text-emerald-900/30 py-2 tracking-wider uppercase">
            All accounts loaded
          </p>
        )}
      </div>
    </div>
  );
};

export default AccountsList;
