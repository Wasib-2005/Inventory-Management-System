import { useCallback, useEffect, useRef, useState } from "react";
import { FiCheck, FiX, FiArrowRight, FiSearch } from "react-icons/fi";
import { getDebtCredit, payDebtCredit, searchDebtCredit, getTotalDebt } from "./api";

const currency = import.meta.env.VITE_CURRENCY_SYMBOL;
const LIMIT = 15;
const SCROLL_THRESHOLD = 150;

const STATUS_STYLES = {
  pending: "text-amber-600 bg-amber-50 border-amber-200",
  paid: "text-emerald-600 bg-emerald-50 border-emerald-200",
};

const formatOrderId = (id) => {
  const last8 = String(id || "").slice(-8);
  return `${last8.slice(0, 4)} ${last8.slice(4, 8)}`;
};

const StatsRow = ({ stats, loading }) => {
  if (loading || !stats) return null;
  const items = [
    { label: "Total Due", value: `${currency}${Number(stats.totalDue || 0).toLocaleString()}` },
    { label: "Total Orders", value: Number(stats.totalOrder || 0).toLocaleString() },
    { label: "Debt Orders", value: Number(stats.totalDebtOrderCount || 0).toLocaleString() },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 mb-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="p-3 rounded-lg border border-emerald-300/40 bg-white/70"
        >
          <p className="text-xs font-bold text-emerald-700/50 uppercase tracking-wide">
            {item.label}
          </p>
          <p className="text-base font-extrabold text-emerald-900 truncate mt-0.5">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  );
};

const LedgerRow = ({ account, onSettled }) => {
  const payable = account.status !== "paid";
  const [isSettling, setIsSettling] = useState(false);
  const [payAmount, setPayAmount] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState(null);

  const entered = Number(payAmount) || 0;
  const currentDue = Number(account.dueAmount) || 0;
  const newDue = Math.max(currentDue - entered, 0);
  const returnAmount = Math.max(entered - currentDue, 0);
  const newStatus = entered > 0 ? (newDue <= 0 ? "paid" : "pending") : null;

  const handleConfirm = async (e) => {
    e.preventDefault();
    if (entered <= 0) return;
    setIsConfirming(true);
    setError(null);
    try {
      await payDebtCredit(account._id, entered);
      setPayAmount("");
      setIsSettling(false);
      onSettled();
    } catch {
      setError("Payment failed");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    setPayAmount("");
    setError(null);
    setIsSettling(false);
  };

  return (
    <div className="p-4 border border-emerald-300/30 rounded-lg bg-emerald-50/40 flex flex-col gap-2.5 text-sm">
      <button
        type="button"
        onClick={() => payable && setIsSettling((v) => !v)}
        className={`flex justify-between items-center gap-3 text-left ${!payable ? "cursor-default" : ""}`}
      >
        <div className="min-w-0">
          <h4 className="font-bold text-emerald-900 text-base truncate">
            {account.customerId?.username || "Unknown"}{" "}
            <span className="font-mono text-emerald-700/60 text-sm">
              #{formatOrderId(account._id)}
            </span>
          </h4>
          <span className="text-xs text-emerald-700/60 truncate block mt-0.5">
            {account.customerId?.phone || "—"}
            {account.customerId?.email ? ` · ${account.customerId.email}` : ""}
          </span>
        </div>
        <div className="text-right shrink-0">
          <span className="block font-black text-amber-600 text-lg">
            {currency}
            {currentDue.toLocaleString()}
          </span>
          <span
            className={`inline-block text-xs font-bold uppercase px-2 py-0.5 rounded-full border mt-1 ${
              STATUS_STYLES[account.status] || STATUS_STYLES.pending
            }`}
          >
            {account.status}
          </span>
        </div>
      </button>

      {payable && isSettling && (
        <form onSubmit={handleConfirm} className="flex flex-col gap-2.5 pt-3 border-t border-emerald-300/30">
          <input
            type="number"
            min={0}
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            placeholder={`Pay amount (${currency})`}
            autoFocus
            className="w-full text-sm px-3 py-2 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
          />

          {entered > 0 && (
            <div className="flex flex-col gap-2 bg-white rounded-lg border border-emerald-200/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className="block text-xs font-bold text-emerald-700/50 uppercase">Due</span>
                  <span className="text-base font-black text-amber-600">
                    {currency}
                    {currentDue.toLocaleString()}
                  </span>
                </div>
                <FiArrowRight size={14} className="text-emerald-700/30 shrink-0" />
                <div className="text-right">
                  <span className="block text-xs font-bold text-emerald-700/50 uppercase">
                    {returnAmount > 0 ? "Return" : "New Due"}
                  </span>
                  <span
                    className={`text-base font-black ${
                      returnAmount > 0 || newDue <= 0 ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {currency}
                    {(returnAmount > 0 ? returnAmount : newDue).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-emerald-100">
                <span
                  className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border ${
                    STATUS_STYLES[account.status] || STATUS_STYLES.pending
                  }`}
                >
                  {account.status}
                </span>
                <FiArrowRight size={14} className="text-emerald-700/30 shrink-0" />
                <span
                  className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full border ${
                    STATUS_STYLES[newStatus] || STATUS_STYLES.pending
                  }`}
                >
                  {newStatus}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={isConfirming || entered <= 0}
              className="flex items-center gap-1.5 text-sm font-bold text-white bg-[#1D9E75] hover:bg-[#0F6E56] px-3 py-2 rounded-lg transition-colors disabled:opacity-50 shrink-0"
            >
              <FiCheck size={14} />
              {isConfirming ? "..." : "Confirm"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isConfirming}
              className="flex items-center gap-1.5 text-sm font-bold text-emerald-700/70 bg-white hover:bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg transition-colors disabled:opacity-50 shrink-0"
            >
              <FiX size={14} />
              Cancel
            </button>
          </div>
          {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}
        </form>
      )}
    </div>
  );
};

const CreditDebtFolder = () => {
  const [ledger, setLedger] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchingMore, setIsSearchingMore] = useState(false);
  const [searchError, setSearchError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLedger([]);
    setPage(1);
    setHasMore(true);
    getDebtCredit("debt", controller.signal, { page: 1, limit: LIMIT })
      .then((res) => {
        const data = res.data?.data || [];
        setLedger(data);
        setHasMore(data.length === LIMIT);
      })
      .catch((err) => {
        if (err.name !== "CanceledError") setLedger([]);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [reloadKey]);

  useEffect(() => {
    const controller = new AbortController();
    setStatsLoading(true);
    getTotalDebt(controller.signal)
      .then((res) => setStats(res.data || null))
      .catch((err) => {
        if (err.name !== "CanceledError") setStats(null);
      })
      .finally(() => setStatsLoading(false));
    return () => controller.abort();
  }, [reloadKey]);

  const loadMore = useCallback(() => {
    if (loading || isLoadingMore || !hasMore) return;
    const nextPage = page + 1;
    setIsLoadingMore(true);
    getDebtCredit("debt", undefined, { page: nextPage, limit: LIMIT })
      .then((res) => {
        const data = res.data?.data || [];
        setLedger((prev) => [...prev, ...data]);
        setPage(nextPage);
        setHasMore(data.length === LIMIT);
      })
      .finally(() => setIsLoadingMore(false));
  }, [loading, isLoadingMore, hasMore, page]);

  useEffect(() => {
    const query = searchInput.trim();
    setSearchQuery(query);

    if (!query) {
      setSearchResults(null);
      setSearchError("");
      return;
    }

    const normalized = query.toLowerCase().replace(/\s+/g, "");
    const localMatches = ledger.filter((a) =>
      String(a._id || "").toLowerCase().includes(normalized),
    );

    if (localMatches.length > 0) {
      setSearchResults(localMatches);
      setSearchHasMore(false);
      setSearchError("");
      return;
    }

    const controller = new AbortController();
    const debounce = setTimeout(() => {
      setIsSearching(true);
      setSearchError("");
      setSearchPage(1);
      searchDebtCredit(query, controller.signal, { page: 1, limit: LIMIT })
        .then((res) => {
          const data = res.data?.data || [];
          setSearchResults(data);
          setSearchHasMore(data.length === LIMIT);
        })
        .catch((err) => {
          if (err.name !== "CanceledError") {
            setSearchResults([]);
            setSearchError("Could not search");
          }
        })
        .finally(() => setIsSearching(false));
    }, 350);

    return () => {
      clearTimeout(debounce);
      controller.abort();
    };
  }, [searchInput, ledger]);

  const loadMoreSearch = useCallback(() => {
    if (isSearching || isSearchingMore || !searchHasMore) return;
    const nextPage = searchPage + 1;
    setIsSearchingMore(true);
    searchDebtCredit(searchQuery, undefined, { page: nextPage, limit: LIMIT })
      .then((res) => {
        const data = res.data?.data || [];
        setSearchResults((prev) => [...(prev || []), ...data]);
        setSearchPage(nextPage);
        setSearchHasMore(data.length === LIMIT);
      })
      .finally(() => setIsSearchingMore(false));
  }, [searchQuery, isSearching, isSearchingMore, searchHasMore, searchPage]);

  const isSearchMode = searchQuery.length > 0;

  const handleScroll = (e) => {
    const el = e.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom > SCROLL_THRESHOLD) return;
    if (isSearchMode) {
      loadMoreSearch();
    } else {
      loadMore();
    }
  };

  const visibleLedger = isSearchMode ? searchResults || [] : ledger;

  return (
    <div>
      <div className="mb-4">
        <h3 className="text-lg font-bold text-emerald-900">Due / Debt Ledger</h3>
        <p className="text-sm text-emerald-700/60 mt-1">
          Settle client invoices and track outstanding balances
        </p>
      </div>

      <StatsRow stats={stats} loading={statsLoading} />

      <div className="relative mb-3">
        <FiSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-700/40" />
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by order ID..."
          className="w-full text-sm pl-9 pr-3 py-2.5 rounded-lg border border-emerald-300/50 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
        />
      </div>

      <div onScroll={handleScroll} className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
        {isSearchMode ? (
          isSearching ? (
            <p className="text-sm text-emerald-700/50 italic">Searching...</p>
          ) : searchError ? (
            <p className="text-sm text-rose-500 font-semibold">{searchError}</p>
          ) : visibleLedger.length === 0 ? (
            <p className="text-sm text-emerald-700/50 italic">No matching orders</p>
          ) : (
            <>
              {visibleLedger.map((account) => (
                <LedgerRow
                  key={account._id}
                  account={account}
                  onSettled={() => setReloadKey((k) => k + 1)}
                />
              ))}
              {isSearchingMore && (
                <p className="text-sm text-emerald-700/50 italic text-center py-2">
                  Loading more...
                </p>
              )}
            </>
          )
        ) : loading ? (
          <p className="text-sm text-emerald-700/50 italic">Loading...</p>
        ) : visibleLedger.length === 0 ? (
          <p className="text-sm text-emerald-700/50 italic">No accounts here</p>
        ) : (
          <>
            {visibleLedger.map((account) => (
              <LedgerRow
                key={account._id}
                account={account}
                onSettled={() => setReloadKey((k) => k + 1)}
              />
            ))}
            {isLoadingMore && (
              <p className="text-sm text-emerald-700/50 italic text-center py-2">
                Loading more...
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CreditDebtFolder;