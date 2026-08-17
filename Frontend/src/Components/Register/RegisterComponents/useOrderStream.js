import { useCallback, useEffect, useRef, useState } from "react";

const STREAM_PATH = "/api/order/order-stream-today";

// - On connect, backend sends an array of today's orders as the first frame.
// - After that, each new order arrives as { event: "NEW_ORDER", orderData }.
// - EventSource auto-retries on error by default; we don't want that — we
//   want an explicit disconnected state with a manual Reconnect action.
export const useOrderStream = () => {
  const [status, setStatus] = useState("connecting"); // connecting | live | disconnected
  const [orders, setOrders] = useState([]);
  const esRef = useRef(null);

  const connect = useCallback(() => {
    esRef.current?.close();
    setStatus("connecting");

    const url = `${import.meta.env.VITE_BACKEND_API_HEADER}${STREAM_PATH}`;
    const es = new EventSource(url, { withCredentials: true });
    esRef.current = es;

    es.onopen = () => setStatus("live");

    es.onmessage = (e) => {
      let payload;
      try {
        payload = JSON.parse(e.data);
      } catch {
        return; // heartbeat pings (": ping") never reach onmessage anyway
      }

      if (payload?.error) return;

      if (Array.isArray(payload)) {
        setOrders(payload); // initial today-so-far snapshot
        return;
      }

      if (payload?.event === "NEW_ORDER" && payload.orderData) {
        setOrders((prev) => [payload.orderData, ...prev]);
      }
    };

    es.onerror = () => {
      es.close();
      esRef.current = null;
      setStatus("disconnected");
    };
  }, []);

  useEffect(() => {
    connect();
    return () => esRef.current?.close();
  }, [connect]);

  // Lets callers patch a single order in place after confirming/paying it,
  // without waiting on a broadcast the backend doesn't send for those
  // actions (only NEW_ORDER is broadcast today).
  const updateOrder = useCallback((orderId, patch) => {
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, ...patch } : o)),
    );
  }, []);

  return { status, orders, reconnect: connect, updateOrder };
};