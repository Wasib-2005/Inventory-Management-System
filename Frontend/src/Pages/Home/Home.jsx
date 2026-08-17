import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Users,
  Settings2,
  Bell,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Download,
  RefreshCw,
  Moon,
  Sun,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  X,
  TrendingUp,
  TrendingDown,
  PackageSearch,
  Wifi,
  WifiOff,
  Plug,
} from "lucide-react";

/* ------------------------------------------------------------------
   TOKENS
------------------------------------------------------------------- */
const TOKENS = {
  light: {
    bg: "#F4F6F5",
    surface: "#FFFFFF",
    surfaceAlt: "#F8FAF9",
    border: "rgba(15,45,38,0.10)",
    text: "#152023",
    textMuted: "#64748B",
    steel: "#1E293B",
  },
  dark: {
    bg: "#0E1517",
    surface: "#161F22",
    surfaceAlt: "#1B2528",
    border: "rgba(255,255,255,0.08)",
    text: "#EBF2F0",
    textMuted: "#8CA0A0",
    steel: "#E4ECEA",
  },
  emerald: "#059669",
  emeraldSoft: "rgba(5,150,105,0.12)",
  amber: "#D97706",
  amberSoft: "rgba(217,119,6,0.12)",
  rose: "#E11D48",
  roseSoft: "rgba(225,29,72,0.12)",
  indigo: "#4F46E5",
  indigoSoft: "rgba(79,70,229,0.12)",
  blue: "#2563EB",
  blueSoft: "rgba(37,99,235,0.12)",
};

/* ------------------------------------------------------------------
   MOCK DATA — one connected dataset per duration (day / week / month / year)
   Switching "Duration" now drives BOTH charts + the totals from one place.
------------------------------------------------------------------- */
const salesDataByMode = {
  day: [
    { time: "08:00", totalSales: 1200, fullSales: 1000, dueSales: 200 },
    { time: "10:00", totalSales: 2400, fullSales: 2000, dueSales: 400 },
    { time: "12:00", totalSales: 1800, fullSales: 1500, dueSales: 300 },
    { time: "14:00", totalSales: 3500, fullSales: 3000, dueSales: 500 },
    { time: "16:00", totalSales: 4200, fullSales: 3800, dueSales: 400 },
    { time: "18:00", totalSales: 2900, fullSales: 2500, dueSales: 400 },
  ],
  week: [
    { time: "Mon", totalSales: 8500, fullSales: 7000, dueSales: 1500 },
    { time: "Tue", totalSales: 12400, fullSales: 10200, dueSales: 2200 },
    { time: "Wed", totalSales: 9800, fullSales: 8100, dueSales: 1700 },
    { time: "Thu", totalSales: 14500, fullSales: 12000, dueSales: 2500 },
    { time: "Fri", totalSales: 18200, fullSales: 15500, dueSales: 2700 },
    { time: "Sat", totalSales: 11000, fullSales: 9800, dueSales: 1200 },
    { time: "Sun", totalSales: 6400, fullSales: 5800, dueSales: 600 },
  ],
  month: [
    { time: "Week 1", totalSales: 14200, fullSales: 11800, dueSales: 2400 },
    { time: "Week 2", totalSales: 18900, fullSales: 15200, dueSales: 3700 },
    { time: "Week 3", totalSales: 15600, fullSales: 12900, dueSales: 2700 },
    { time: "Week 4", totalSales: 22150, fullSales: 18200, dueSales: 3950 },
  ],
  year: [
    { time: "Jan", totalSales: 58200, fullSales: 48900, dueSales: 9300 },
    { time: "Feb", totalSales: 61500, fullSales: 51200, dueSales: 10300 },
    { time: "Mar", totalSales: 67800, fullSales: 56100, dueSales: 11700 },
    { time: "Apr", totalSales: 64200, fullSales: 53900, dueSales: 10300 },
    { time: "May", totalSales: 71900, fullSales: 60200, dueSales: 11700 },
    { time: "Jun", totalSales: 76400, fullSales: 63800, dueSales: 12600 },
    { time: "Jul", totalSales: 70850, fullSales: 58100, dueSales: 12750 },
    { time: "Aug", totalSales: 74200, fullSales: 61900, dueSales: 12300 },
    { time: "Sep", totalSales: 79800, fullSales: 66500, dueSales: 13300 },
    { time: "Oct", totalSales: 82100, fullSales: 68700, dueSales: 13400 },
    { time: "Nov", totalSales: 88500, fullSales: 74100, dueSales: 14400 },
    { time: "Dec", totalSales: 95200, fullSales: 79800, dueSales: 15400 },
  ],
};

const buyDataByMode = {
  day: [
    { time: "08:00", totalBuy: 800, paidBuy: 750 },
    { time: "12:00", totalBuy: 2100, paidBuy: 1950 },
    { time: "16:00", totalBuy: 1400, paidBuy: 1400 },
    { time: "20:00", totalBuy: 3100, paidBuy: 2900 },
  ],
  week: [
    { time: "Mon", totalBuy: 4500, paidBuy: 4200 },
    { time: "Tue", totalBuy: 8200, paidBuy: 7800 },
    { time: "Wed", totalBuy: 6100, paidBuy: 5900 },
    { time: "Thu", totalBuy: 9400, paidBuy: 9000 },
    { time: "Fri", totalBuy: 11200, paidBuy: 10500 },
  ],
  month: [
    { time: "Week 1", totalBuy: 8400, paidBuy: 7900 },
    { time: "Week 2", totalBuy: 11200, paidBuy: 10500 },
    { time: "Week 3", totalBuy: 7800, paidBuy: 7500 },
    { time: "Week 4", totalBuy: 10810, paidBuy: 10000 },
  ],
  year: [
    { time: "Jan", totalBuy: 31200, paidBuy: 29400 },
    { time: "Feb", totalBuy: 33500, paidBuy: 31800 },
    { time: "Mar", totalBuy: 35100, paidBuy: 33200 },
    { time: "Apr", totalBuy: 32800, paidBuy: 31100 },
    { time: "May", totalBuy: 37200, paidBuy: 35000 },
    { time: "Jun", totalBuy: 39800, paidBuy: 37600 },
    { time: "Jul", totalBuy: 38210, paidBuy: 35900 },
    { time: "Aug", totalBuy: 40500, paidBuy: 38200 },
    { time: "Sep", totalBuy: 42800, paidBuy: 40300 },
    { time: "Oct", totalBuy: 44100, paidBuy: 41700 },
    { time: "Nov", totalBuy: 47600, paidBuy: 45000 },
    { time: "Dec", totalBuy: 51200, paidBuy: 48400 },
  ],
};

const initialSales = [
  { id: "TX-1001", item: "Industrial Steel Rods", customer: "BuildCorp Inc.", qty: 50, amount: 4200, status: "Complete", time: "10 min ago" },
  { id: "TX-1002", item: "Pneumatic Valves V2", customer: "Apex Hydraulics", qty: 12, amount: 1350, status: "Due", time: "25 min ago" },
  { id: "TX-1003", item: "Heavy Duty Straps", customer: "Global Logistics", qty: 100, amount: 800, status: "Complete", time: "42 min ago" },
  { id: "TX-1004", item: "Hydraulic Oil (50L)", customer: "Metro Workshop", qty: 4, amount: 640, status: "Complete", time: "1 hr ago" },
  { id: "TX-1005", item: "Copper Cable Drums", customer: "PowerGrid Co.", qty: 8, amount: 5100, status: "Due", time: "1.5 hrs ago" },
  { id: "TX-1006", item: "Safety Helmets Class A", customer: "Safety First Ltd", qty: 200, amount: 2400, status: "Complete", time: "2 hrs ago" },
  { id: "TX-1007", item: "Rubber Gaskets Pack", customer: "FlexiParts Corp", qty: 30, amount: 450, status: "Complete", time: "3 hrs ago" },
  { id: "TX-1008", item: "Aluminum Sheets 4x8", customer: "SheetMetal Inc", qty: 15, amount: 3100, status: "Due", time: "3.5 hrs ago" },
  { id: "TX-1009", item: "Conveyor Belt Assembly", customer: "LogiTech Hub", qty: 2, amount: 8900, status: "Complete", time: "4 hrs ago" },
  { id: "TX-1010", item: "Digital Flow Meter", customer: "Precision Automation", qty: 6, amount: 1800, status: "Complete", time: "5 hrs ago" },
];

const productPool = [
  "Industrial Steel Rods", "Pneumatic Valves V2", "Heavy Duty Straps", "Hydraulic Oil (50L)",
  "Copper Cable Drums", "Safety Helmets Class A", "Rubber Gaskets Pack", "Aluminum Sheets 4x8",
  "Conveyor Belt Assembly", "Digital Flow Meter", "M8 Hex Bolts (box)", "Welding Rods Pack",
];
const customerPool = [
  "BuildCorp Inc.", "Apex Hydraulics", "Global Logistics", "Metro Workshop", "PowerGrid Co.",
  "Safety First Ltd", "FlexiParts Corp", "SheetMetal Inc", "LogiTech Hub", "Precision Automation",
];

const durationLabels = { day: "Today", week: "This Week", month: "This Month", year: "This Year" };
const durationSub = { day: "vs yesterday", week: "vs last week", month: "vs last month", year: "vs last year" };

const fmtUSD = (n) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

/* ------------------------------------------------------------------
   LIVE DASHBOARD via SSE (Server-Sent Events)
   ------------------------------------------------------------------
   This is intentionally built the same way it would work against a
   real backend: connect() opens an EventSource, onmessage applies a
   small JSON "patch" to state (NOT a full re-fetch), onerror triggers
   reconnect with backoff, and a status pill + Reconnect button reflect
   connection state.

   There is no live backend wired into this preview environment, so
   SSE_DEMO_MODE simulates the server pushing small patches on an
   interval, using the exact same patch shapes a real server would
   send. To go live:
     1. Set SSE_DEMO_MODE = false
     2. Point SSE_ENDPOINT at your server route
     3. Have your server emit `data: <json>\n\n` events shaped like:
          { "type": "metric",      "key": "activeWorkers", "value": 19 }
          { "type": "price_update","id": "TX-1001", "amount": 4500 }
          { "type": "new_sale",    "record": { id, item, customer, qty, amount, status, time } }
   A minimal Node/Express example is described at the bottom of this
   file in a comment block you can copy into a real server.
------------------------------------------------------------------- */
const SSE_ENDPOINT = "/api/dashboard/stream";
const SSE_DEMO_MODE = true;

function makeDemoPatch(currentSales) {
  const roll = Math.random();
  if (roll < 0.4) {
    const keys = ["activeWorkers", "activeOperations", "inboundPending", "outboundWaiting"];
    const key = keys[Math.floor(Math.random() * keys.length)];
    const jitter = Math.random() > 0.5 ? 1 : -1;
    return { type: "metric", key, jitter };
  }
  if (roll < 0.75 && currentSales.length) {
    const row = currentSales[Math.floor(Math.random() * currentSales.length)];
    const delta = Math.round((Math.random() * 400 - 100));
    const amount = Math.max(50, row.amount + delta);
    return { type: "price_update", id: row.id, amount };
  }
  const item = productPool[Math.floor(Math.random() * productPool.length)];
  const customer = customerPool[Math.floor(Math.random() * customerPool.length)];
  return {
    type: "new_sale",
    record: {
      id: `TX-${1010 + Math.floor(Math.random() * 900) + 1}`,
      item,
      customer,
      qty: Math.floor(Math.random() * 40) + 1,
      amount: Math.floor(Math.random() * 4000) + 300,
      status: Math.random() > 0.3 ? "Complete" : "Due",
      time: "just now",
    },
  };
}

function useLiveDashboard() {
  const [metrics, setMetrics] = useState({
    activeWorkers: { value: 18, delta: 0 },
    activeOperations: { value: 6, delta: 0 },
    inboundPending: { value: 9, delta: 0 },
    outboundWaiting: { value: 14, delta: 0 },
  });
  const [sales, setSales] = useState(initialSales);
  const [status, setStatus] = useState("connecting"); // connecting | connected | disconnected | error
  const [flashIds, setFlashIds] = useState(() => new Set());
  const [lastEventAt, setLastEventAt] = useState(null);

  const esRef = useRef(null);
  const demoIntervalRef = useRef(null);
  const demoOpenTimeoutRef = useRef(null);
  const retryRef = useRef(0);
  const reconnectTimeoutRef = useRef(null);
  const salesRef = useRef(sales);
  salesRef.current = sales;

  const flashRow = (id) => {
    setFlashIds((prev) => new Set(prev).add(id));
    setTimeout(() => {
      setFlashIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 1400);
  };

  const applyPatch = useCallback((patch) => {
    setLastEventAt(new Date());
    if (patch.type === "metric") {
      setMetrics((prev) => {
        const cur = prev[patch.key];
        if (!cur) return prev;
        const nextVal = Math.max(0, cur.value + patch.jitter);
        const delta = cur.value === 0 ? 0 : Math.round(((nextVal - cur.value) / cur.value) * 1000) / 10;
        return { ...prev, [patch.key]: { value: nextVal, delta } };
      });
    } else if (patch.type === "price_update") {
      setSales((prev) => prev.map((s) => (s.id === patch.id ? { ...s, amount: patch.amount } : s)));
      flashRow(patch.id);
    } else if (patch.type === "new_sale") {
      setSales((prev) => [patch.record, ...prev].slice(0, 40));
      flashRow(patch.record.id);
    }
  }, []);

  const teardown = useCallback(() => {
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    if (demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
    }
    if (demoOpenTimeoutRef.current) {
      clearTimeout(demoOpenTimeoutRef.current);
      demoOpenTimeoutRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const scheduleReconnect = useCallback(() => {
    const delay = Math.min(15000, 1000 * 2 ** retryRef.current);
    retryRef.current += 1;
    reconnectTimeoutRef.current = setTimeout(() => connect(), delay);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = useCallback(() => {
    teardown();
    setStatus("connecting");

    if (SSE_DEMO_MODE) {
      demoOpenTimeoutRef.current = setTimeout(() => {
        setStatus("connected");
        retryRef.current = 0;
        demoIntervalRef.current = setInterval(() => {
          applyPatch(makeDemoPatch(salesRef.current));
        }, 2600);
      }, 600);
      return;
    }

    try {
      const es = new EventSource(SSE_ENDPOINT);
      esRef.current = es;
      es.onopen = () => {
        setStatus("connected");
        retryRef.current = 0;
      };
      es.onmessage = (evt) => {
        try {
          applyPatch(JSON.parse(evt.data));
        } catch (err) {
          // ignore malformed frame
        }
      };
      es.onerror = () => {
        setStatus("error");
        es.close();
        scheduleReconnect();
      };
    } catch (err) {
      setStatus("error");
      scheduleReconnect();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyPatch, teardown, scheduleReconnect]);

  const disconnect = useCallback(() => {
    teardown();
    setStatus("disconnected");
  }, [teardown]);

  const reconnect = useCallback(() => {
    retryRef.current = 0;
    connect();
  }, [connect]);

  useEffect(() => {
    connect();
    return () => teardown();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { metrics, sales, status, flashIds, lastEventAt, reconnect, disconnect };
}

/* ------------------------------------------------------------------
   SMALL HELPERS / SUBCOMPONENTS
------------------------------------------------------------------- */
function useCountUp(target, durationMs = 600) {
  const [value, setValue] = useState(target);
  const prevRef = useRef(target);
  useEffect(() => {
    const from = prevRef.current;
    prevRef.current = target;
    if (from === target) {
      setValue(target);
      return;
    }
    let startTs = null;
    let raf;
    const step = (ts) => {
      if (startTs === null) startTs = ts;
      const progress = Math.min(1, (ts - startTs) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return value;
}

const CustomTooltip = ({ active, payload, label, dark }) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="p-3 rounded-xl shadow-xl text-xs space-y-1 border"
        style={{
          background: dark ? "#0E1517" : "#152023",
          borderColor: "rgba(255,255,255,0.08)",
          color: "#EBF2F0",
          fontFamily: "'IBM Plex Mono', monospace",
        }}
      >
        <p className="font-bold border-b pb-1 mb-1" style={{ borderColor: "rgba(255,255,255,0.12)", color: "#9DB0AE" }}>
          {label}
        </p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 font-medium" style={{ color: entry.color }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold">{fmtUSD(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

function StatCard({ icon: Icon, label, value, delta, accent, accentSoft, sub, dark }) {
  const count = useCountUp(value);
  const positive = delta >= 0;
  return (
    <div
      className="p-4 rounded-2xl flex items-center justify-between transition-all hover:-translate-y-0.5"
      style={{
        background: dark ? TOKENS.dark.surface : TOKENS.light.surface,
        border: `1px solid ${dark ? TOKENS.dark.border : TOKENS.light.border}`,
        borderLeft: `4px solid ${accent}`,
      }}
    >
      <div>
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: dark ? TOKENS.dark.textMuted : TOKENS.light.textMuted }}>
          {label}
        </span>
        <div className="text-2xl font-black mt-1" style={{ fontFamily: "'Space Grotesk', sans-serif", color: dark ? TOKENS.dark.steel : TOKENS.light.steel }}>
          {count}
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <span
            className="inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ color: positive ? TOKENS.emerald : TOKENS.rose, background: positive ? TOKENS.emeraldSoft : TOKENS.roseSoft }}
          >
            {positive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(delta)}%
          </span>
          <span className="text-[11px]" style={{ color: dark ? TOKENS.dark.textMuted : TOKENS.light.textMuted }}>
            {sub}
          </span>
        </div>
      </div>
      <div className="p-3 rounded-xl" style={{ background: accentSoft, color: accent }}>
        <Icon size={22} />
      </div>
    </div>
  );
}

function ConnectionPill({ status, onReconnect, t, darkMode }) {
  const map = {
    connected: { color: TOKENS.emerald, soft: TOKENS.emeraldSoft, label: "Connected", icon: Wifi, pulse: true },
    connecting: { color: TOKENS.amber, soft: TOKENS.amberSoft, label: "Connecting…", icon: Plug, pulse: true },
    disconnected: { color: TOKENS.rose, soft: TOKENS.roseSoft, label: "Disconnected", icon: WifiOff, pulse: false },
    error: { color: TOKENS.rose, soft: TOKENS.roseSoft, label: "Connection error", icon: WifiOff, pulse: false },
  };
  const cfg = map[status] || map.disconnected;
  const Icon = cfg.icon;
  const showReconnect = status === "disconnected" || status === "error";
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold"
      style={{ background: cfg.soft, color: cfg.color }}
      title="Live data connection (SSE)"
    >
      <span className="relative flex items-center justify-center">
        {cfg.pulse && (
          <span
            className="absolute inline-flex w-2.5 h-2.5 rounded-full opacity-60 animate-ping"
            style={{ background: cfg.color }}
          />
        )}
        <Icon size={14} />
      </span>
      {cfg.label}
      {showReconnect && (
        <button
          onClick={onReconnect}
          className="ml-1 px-2 py-0.5 rounded-lg text-[11px] font-extrabold"
          style={{ background: cfg.color, color: darkMode ? "#0E1517" : "white" }}
        >
          Reconnect
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   MAIN COMPONENT
------------------------------------------------------------------- */
const Dashboard = () => {
  const [darkMode, setDarkMode] = useState(false);
  const t = darkMode ? TOKENS.dark : TOKENS.light;
  const cx = (light, dark) => (darkMode ? dark : light);

  // Single duration now drives BOTH graphs + totals + KPI sub-labels.
  const [timeDuration, setTimeDuration] = useState("month");
  const [fromDate, setFromDate] = useState("2026-07-01T00:00");
  const [toDate, setToDate] = useState("2026-07-28T23:59");

  const { metrics, sales, status, flashIds, lastEventAt, reconnect } = useLiveDashboard();

  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Low stock alert", body: "M8 hex bolts below reorder threshold (12 left).", time: "4 min ago", read: false, tone: "amber" },
    { id: 2, title: "Shipment received", body: "BC-2291 checked in at Dock 3, 340 units.", time: "22 min ago", read: false, tone: "emerald" },
    { id: 3, title: "Payment overdue", body: "Apex Hydraulics invoice TX-1002 is 5 days past due.", time: "1 hr ago", read: false, tone: "rose" },
    { id: 4, title: "Dispatch confirmed", body: "Order #4468 delivery acknowledged by customer.", time: "3 hrs ago", read: true, tone: "emerald" },
  ]);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const [toast, setToast] = useState(null);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(id);
  }, [toast]);

  const pulseFeed = useMemo(
    () => [
      "DOCK 3 · inbound pallet scan complete",
      "DOCK 6 · outbound truck sealed",
      "PICK · order #4471 staged for QC",
      "RECEIVE · shipment BC-2291 checked in",
      "ALERT · low stock: M8 hex bolts",
      "DISPATCH · order #4468 left facility",
      "DOCK 1 · forklift cycle complete",
      "QC · batch #91 passed inspection",
    ],
    []
  );

  const handleRefresh = () => {
    setToast({ text: "Live feed is already streaming — no manual refresh needed" });
  };

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filteredSales = useMemo(() => {
    let rows = sales.filter((s) => {
      const matchesSearch =
        search.trim() === "" || [s.id, s.item, s.customer].join(" ").toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
    if (sortKey) {
      rows = [...rows].sort((a, b) => {
        let av = a[sortKey];
        let bv = b[sortKey];
        if (typeof av === "string") {
          av = av.toLowerCase();
          bv = bv.toLowerCase();
        }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return rows;
  }, [sales, search, statusFilter, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredSales.length / pageSize));
  const pageRows = filteredSales.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const exportCSV = () => {
    const header = ["Invoice ID", "Item", "Customer", "Qty", "Amount", "Status", "Time"];
    const rows = filteredSales.map((s) => [s.id, s.item, s.customer, s.qty, s.amount, s.status, s.time]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.csv";
    a.click();
    URL.revokeObjectURL(url);
    setToast({ text: `Exported ${filteredSales.length} rows to CSV` });
  };

  const markAllRead = () => setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));

  // Totals now derive from the SAME dataset driving the charts —
  // switching Duration recomputes everything together.
  const currentSalesSeries = salesDataByMode[timeDuration];
  const currentBuySeries = buyDataByMode[timeDuration];
  const totals = useMemo(() => {
    const s = currentSalesSeries.reduce(
      (acc, d) => {
        acc.total += d.totalSales;
        acc.full += d.fullSales;
        acc.due += d.dueSales;
        return acc;
      },
      { total: 0, full: 0, due: 0 }
    );
    const b = currentBuySeries.reduce(
      (acc, d) => {
        acc.total += d.totalBuy;
        acc.paid += d.paidBuy;
        return acc;
      },
      { total: 0, paid: 0 }
    );
    return { sales: s, buy: b };
  }, [currentSalesSeries, currentBuySeries]);

  const SortHeader = ({ label, sortKeyName, align = "left" }) => (
    <th
      className={`p-3 cursor-pointer select-none group ${align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"}`}
      onClick={() => toggleSort(sortKeyName)}
    >
      <span className={`inline-flex items-center gap-1 ${align === "right" ? "flex-row-reverse" : ""}`}>
        {label}
        <ArrowUpDown size={11} className="opacity-40 group-hover:opacity-90 transition-opacity" style={{ color: sortKey === sortKeyName ? TOKENS.emerald : undefined }} />
      </span>
    </th>
  );

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ background: t.bg, color: t.text, fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700;800&family=Inter:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .marquee-track { animation: marquee 32s linear infinite; }
        .marquee-wrap:hover .marquee-track { animation-play-state: paused; }
        @keyframes toast-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .toast-anim { animation: toast-in 0.25s ease-out; }
        @keyframes row-flash { 0% { background-color: rgba(5,150,105,0.22); } 100% { background-color: transparent; } }
        .row-flash { animation: row-flash 1.4s ease-out; }
        ::selection { background: ${TOKENS.emerald}; color: white; }
      `}</style>

      <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-5">
        {/* HEADER */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b" style={{ borderColor: t.border }}>
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight flex items-center gap-2" style={{ fontFamily: "'Space Grotesk', sans-serif", color: t.steel }}>
              Dashboard
              <span className="font-medium text-base" style={{ color: TOKENS.emerald }}>| Warehouse IMS</span>
            </h1>
            <p className="text-xs mt-1 flex items-center gap-1.5 flex-wrap" style={{ color: t.textMuted }}>
              Real-time business performance & warehouse activity
              <span className="inline-flex items-center gap-1 ml-2">
                <Clock size={12} /> Last event {lastEventAt ? lastEventAt.toLocaleTimeString() : "—"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <ConnectionPill status={status} onReconnect={reconnect} t={t} darkMode={darkMode} />

            <button onClick={handleRefresh} className="p-2.5 rounded-xl transition-all flex items-center gap-1.5 text-xs font-bold" style={{ background: TOKENS.emeraldSoft, color: TOKENS.emerald }}>
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Live</span>
            </button>

            <button onClick={() => setDarkMode((d) => !d)} className="p-2.5 rounded-xl transition-all" style={{ background: cx("#F1F5F4", "#22302F"), color: t.steel }} aria-label="Toggle dark mode">
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative">
              <button onClick={() => setNotifOpen((o) => !o)} className="p-2.5 rounded-xl relative transition-all" style={{ background: TOKENS.emeraldSoft, color: TOKENS.emerald }} aria-label="Notifications">
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-bold flex items-center justify-center rounded-full text-white" style={{ background: TOKENS.rose, border: `2px solid ${t.bg}` }}>
                    {unreadCount}
                  </span>
                )}
                <Bell size={20} />
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl z-20 overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
                  <div className="flex items-center justify-between p-3 border-b" style={{ borderColor: t.border }}>
                    <span className="font-bold text-sm" style={{ color: t.steel }}>Notifications</span>
                    <div className="flex items-center gap-2">
                      <button onClick={markAllRead} className="text-[11px] font-bold" style={{ color: TOKENS.emerald }}>Mark all read</button>
                      <button onClick={() => setNotifOpen(false)} style={{ color: t.textMuted }}><X size={16} /></button>
                    </div>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y" style={{ borderColor: t.border }}>
                    {notifications.map((n) => {
                      const toneColor = n.tone === "amber" ? TOKENS.amber : n.tone === "rose" ? TOKENS.rose : TOKENS.emerald;
                      const toneSoft = n.tone === "amber" ? TOKENS.amberSoft : n.tone === "rose" ? TOKENS.roseSoft : TOKENS.emeraldSoft;
                      return (
                        <button key={n.id} onClick={() => setNotifications((ns) => ns.map((x) => (x.id === n.id ? { ...x, read: true } : x)))} className="w-full text-left p-3 flex gap-2.5 transition-colors hover:opacity-90" style={{ background: n.read ? "transparent" : cx("#F8FAF9", "#1B2528") }}>
                          <span className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0" style={{ background: n.read ? "transparent" : toneColor }} />
                          <span className="p-1.5 rounded-lg h-fit" style={{ background: toneSoft, color: toneColor }}><AlertCircle size={14} /></span>
                          <span className="flex-1">
                            <span className="block text-xs font-bold" style={{ color: t.steel }}>{n.title}</span>
                            <span className="block text-[11px] mt-0.5" style={{ color: t.textMuted }}>{n.body}</span>
                            <span className="block text-[10px] mt-1" style={{ color: t.textMuted }}>{n.time}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* OPERATIONS PULSE TICKER */}
        <div className="marquee-wrap rounded-xl overflow-hidden relative" style={{ background: darkMode ? "#0A1011" : "#101B1A", border: `1px solid ${t.border}` }}>
          <div className="flex items-center">
            <span className="flex-shrink-0 px-3 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ background: TOKENS.emerald, color: "#0A1011" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" /> Live Ops
            </span>
            <div className="overflow-hidden flex-1 py-2">
              <div className="marquee-track flex items-center gap-8 whitespace-nowrap" style={{ width: "200%" }}>
                {[...pulseFeed, ...pulseFeed].map((e, i) => (
                  <span key={i} className="text-[12px] px-2" style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#9DE8C7" }}>▸ {e}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* DURATION SELECTOR — single control now drives both graphs + totals + KPI context */}
        <div className="p-4 rounded-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold uppercase tracking-wider mr-2 flex items-center gap-1" style={{ color: t.textMuted }}>
              <Clock size={14} /> Duration:
            </span>
            {["day", "week", "month", "year"].map((mode) => (
              <button
                key={mode}
                onClick={() => setTimeDuration(mode)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all"
                style={timeDuration === mode ? { background: TOKENS.emerald, color: "white" } : { background: cx("#F1F5F4", "#20302E"), color: t.textMuted }}
              >
                {mode === "day" ? "1 day" : mode === "week" ? "1 week" : mode === "month" ? "1 month" : "1 year"}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: t.textMuted }}>From:</span>
              <input type="datetime-local" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="text-xs py-1.5 px-2 rounded-lg outline-none" style={{ background: cx("#FFFFFF", "#1B2528"), border: `1px solid ${t.border}`, color: t.text }} />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold" style={{ color: t.textMuted }}>To:</span>
              <input type="datetime-local" value={toDate} onChange={(e) => setToDate(e.target.value)} className="text-xs py-1.5 px-2 rounded-lg outline-none" style={{ background: cx("#FFFFFF", "#1B2528"), border: `1px solid ${t.border}`, color: t.text }} />
            </div>
          </div>
        </div>

        {/* KPI CARDS — live via SSE, sub-label follows Duration */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Active Workers" value={metrics.activeWorkers.value} delta={metrics.activeWorkers.delta} accent={TOKENS.blue} accentSoft={TOKENS.blueSoft} sub={durationSub[timeDuration]} dark={darkMode} />
          <StatCard icon={Settings2} label="Active Operations" value={metrics.activeOperations.value} delta={metrics.activeOperations.delta} accent={TOKENS.emerald} accentSoft={TOKENS.emeraldSoft} sub={durationSub[timeDuration]} dark={darkMode} />
          <StatCard icon={ArrowDownLeft} label="Inbound Pending" value={metrics.inboundPending.value} delta={metrics.inboundPending.delta} accent={TOKENS.amber} accentSoft={TOKENS.amberSoft} sub={durationSub[timeDuration]} dark={darkMode} />
          <StatCard icon={ArrowUpRight} label="Outbound Waiting" value={metrics.outboundWaiting.value} delta={metrics.outboundWaiting.delta} accent={TOKENS.indigo} accentSoft={TOKENS.indigoSoft} sub={durationSub[timeDuration]} dark={darkMode} />
        </section>

        {/* GRAPH SECTION — both charts read off the same `timeDuration`, no independent mode toggle */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl space-y-4" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
            <div className="flex items-center justify-between gap-2 border-b pb-3" style={{ borderColor: t.border }}>
              <div>
                <h2 className="font-extrabold text-base" style={{ fontFamily: "'Space Grotesk', sans-serif", color: t.steel }}>Sales Performance</h2>
                <p className="text-xs" style={{ color: t.textMuted }}>{durationLabels[timeDuration]} · hover for breakdowns</p>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentSalesSeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradTotalSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={TOKENS.blue} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={TOKENS.blue} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradFullSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={TOKENS.emerald} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={TOKENS.emerald} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradDueSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={TOKENS.rose} stopOpacity={0.25} />
                      <stop offset="100%" stopColor={TOKENS.rose} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#22302F" : "#EEF2F1"} />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: t.textMuted }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: t.textMuted }} />
                  <Tooltip content={<CustomTooltip dark={darkMode} />} />
                  <Area type="monotone" dataKey="totalSales" name="Total Sales" stroke={TOKENS.blue} fill="url(#gradTotalSales)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  <Area type="monotone" dataKey="fullSales" name="Full Sales" stroke={TOKENS.emerald} fill="url(#gradFullSales)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  <Area type="monotone" dataKey="dueSales" name="Due Sales" stroke={TOKENS.rose} fill="url(#gradDueSales)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: cx("linear-gradient(90deg,#EFF6F5,#EAF7F1)", "#1B2528") }}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: t.textMuted }}>Total Sales Revenue · {durationLabels[timeDuration]}</span>
                <div className="text-2xl font-black mt-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif", color: t.steel }}>{fmtUSD(totals.sales.total)}</div>
              </div>
              <div className="text-right flex flex-wrap justify-end gap-1">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: TOKENS.emeraldSoft, color: TOKENS.emerald }}>Full: {fmtUSD(totals.sales.full)}</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: TOKENS.roseSoft, color: TOKENS.rose }}>Due: {fmtUSD(totals.sales.due)}</span>
              </div>
            </div>
          </div>

          <div className="p-5 rounded-xl space-y-4" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
            <div className="flex items-center justify-between gap-2 border-b pb-3" style={{ borderColor: t.border }}>
              <div>
                <h2 className="font-extrabold text-base" style={{ fontFamily: "'Space Grotesk', sans-serif", color: t.steel }}>Buy & Procurement</h2>
                <p className="text-xs" style={{ color: t.textMuted }}>{durationLabels[timeDuration]} · total purchase vs paid</p>
              </div>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentBuySeries} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradTotalBuy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={TOKENS.indigo} stopOpacity={0.35} />
                      <stop offset="100%" stopColor={TOKENS.indigo} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradPaidBuy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={TOKENS.emerald} stopOpacity={0.3} />
                      <stop offset="100%" stopColor={TOKENS.emerald} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={darkMode ? "#22302F" : "#EEF2F1"} />
                  <XAxis dataKey="time" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: t.textMuted }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: t.textMuted }} />
                  <Tooltip content={<CustomTooltip dark={darkMode} />} />
                  <Area type="monotone" dataKey="totalBuy" name="Total Buy" stroke={TOKENS.indigo} fill="url(#gradTotalBuy)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  <Area type="monotone" dataKey="paidBuy" name="Paid Buy" stroke={TOKENS.emerald} fill="url(#gradPaidBuy)" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: cx("linear-gradient(90deg,#EEF0FC,#EAF7F1)", "#1B2528") }}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wide" style={{ color: t.textMuted }}>Total Purchase Value · {durationLabels[timeDuration]}</span>
                <div className="text-2xl font-black mt-0.5" style={{ fontFamily: "'Space Grotesk', sans-serif", color: t.steel }}>{fmtUSD(totals.buy.total)}</div>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: TOKENS.emeraldSoft, color: TOKENS.emerald }}>Paid: {fmtUSD(totals.buy.paid)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* TRANSACTIONS TABLE */}
        <section className="rounded-xl overflow-hidden" style={{ background: t.surface, border: `1px solid ${t.border}` }}>
          <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-3" style={{ borderColor: t.border, background: cx("#FAFBFA", "#1B2528") }}>
            <div>
              <h2 className="font-extrabold text-base" style={{ fontFamily: "'Space Grotesk', sans-serif", color: t.steel }}>Recent Transactions</h2>
              <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>{filteredSales.length} of {sales.length} records · live</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: t.textMuted }} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search item, customer, ID…" className="pl-8 pr-3 py-1.5 text-xs rounded-lg outline-none w-48" style={{ background: cx("#FFFFFF", "#111A1C"), border: `1px solid ${t.border}`, color: t.text }} />
              </div>

              <div className="flex items-center gap-1 p-1 rounded-lg" style={{ background: cx("#F1F5F4", "#20302E") }}>
                {["All", "Complete", "Due"].map((s) => (
                  <button key={s} onClick={() => setStatusFilter(s)} className="px-2.5 py-1 text-[11px] font-bold rounded" style={statusFilter === s ? { background: t.surface, color: TOKENS.emerald, boxShadow: "0 1px 2px rgba(0,0,0,0.08)" } : { color: t.textMuted }}>
                    {s}
                  </button>
                ))}
              </div>

              <button onClick={exportCSV} className="px-3 py-1.5 text-xs font-bold rounded-lg flex items-center gap-1.5" style={{ background: TOKENS.emerald, color: "white" }}>
                <Download size={14} /> Export CSV
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-[10px] uppercase font-extrabold tracking-wider border-b" style={{ background: cx("#F5F7F6", "#1B2528"), color: t.textMuted, borderColor: t.border }}>
                <tr>
                  <SortHeader label="Invoice ID" sortKeyName="id" />
                  <SortHeader label="Item & Buyer" sortKeyName="item" />
                  <SortHeader label="Qty" sortKeyName="qty" align="center" />
                  <SortHeader label="Amount" sortKeyName="amount" align="right" />
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 pr-5 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: t.border }}>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center">
                      <div className="flex flex-col items-center gap-2" style={{ color: t.textMuted }}>
                        <PackageSearch size={28} />
                        <span className="text-sm font-semibold">No transactions match your filters</span>
                        <button onClick={() => { setSearch(""); setStatusFilter("All"); }} className="text-xs font-bold mt-1" style={{ color: TOKENS.emerald }}>Clear filters</button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageRows.map((sale) => (
                    <tr key={sale.id} className={flashIds.has(sale.id) ? "row-flash" : ""}>
                      <td className="p-3 pl-5 text-xs font-bold" style={{ fontFamily: "'IBM Plex Mono', monospace", color: TOKENS.blue }}>{sale.id}</td>
                      <td className="p-3">
                        <span className="font-bold block" style={{ color: t.steel }}>{sale.item}</span>
                        <span className="text-[11px]" style={{ color: t.textMuted }}>{sale.customer}</span>
                      </td>
                      <td className="p-3 text-center font-semibold" style={{ color: t.text }}>{sale.qty}</td>
                      <td className="p-3 text-right font-black" style={{ fontFamily: "'IBM Plex Mono', monospace", color: t.steel }}>{fmtUSD(sale.amount)}</td>
                      <td className="p-3 text-center">
                        {sale.status === "Complete" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full" style={{ color: TOKENS.emerald, background: TOKENS.emeraldSoft }}><CheckCircle2 size={13} /> Full Paid</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full" style={{ color: TOKENS.rose, background: TOKENS.roseSoft }}><AlertCircle size={13} /> Due Pending</span>
                        )}
                      </td>
                      <td className="p-3 pr-5 text-right text-xs font-medium" style={{ color: t.textMuted }}>{sale.time}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredSales.length > 0 && (
            <div className="flex items-center justify-between p-3 border-t text-xs" style={{ borderColor: t.border, color: t.textMuted }}>
              <span>Page {page} of {totalPages}</span>
              <div className="flex items-center gap-1">
                <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="p-1.5 rounded-lg disabled:opacity-30" style={{ background: cx("#F1F5F4", "#20302E") }}><ChevronLeft size={14} /></button>
                <button disabled={page === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="p-1.5 rounded-lg disabled:opacity-30" style={{ background: cx("#F1F5F4", "#20302E") }}><ChevronRight size={14} /></button>
              </div>
            </div>
          )}
        </section>
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 toast-anim">
          <div className="px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-semibold" style={{ background: t.steel, color: darkMode ? "#0E1517" : "white" }}>
            <CheckCircle2 size={16} style={{ color: TOKENS.emerald }} />
            {toast.text}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

/* ------------------------------------------------------------------
   REAL BACKEND — minimal Node/Express SSE server to pair with this UI
   ------------------------------------------------------------------
   Save as server.js, `npm i express`, then `node server.js`.
   Set SSE_DEMO_MODE = false above once this is running, and point
   SSE_ENDPOINT at "http://localhost:4000/api/dashboard/stream" (or
   proxy it under /api/dashboard/stream in your app).

   const express = require("express");
   const app = express();

   app.get("/api/dashboard/stream", (req, res) => {
     res.set({
       "Content-Type": "text/event-stream",
       "Cache-Control": "no-cache",
       Connection: "keep-alive",
     });
     res.flushHeaders();

     const send = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);

     // Example: push a price change whenever your real system emits one
     const timer = setInterval(() => {
       send({ type: "price_update", id: "TX-1001", amount: 1000 });
     }, 5000);

     req.on("close", () => clearInterval(timer));
   });

   app.listen(4000, () => console.log("SSE server on :4000"));
------------------------------------------------------------------- */