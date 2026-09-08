import { logger } from "../config/logger.js";
import Order from "../models/Order.model.js";
import Movement from "../models/Tasks/Movement.model.js";
import dashboardSse from "../utility/sseManager/dashboardSse.js";

const TIMEZONE = process.env.VITE_TIMEZONE || process.env.TIMEZONE || "Asia/Dhaka";

// Helper function to format MongoDB raw keys into human-readable chart labels
function formatChartLabel(key, period) {
  if (!key) return "";

  try {
    if (period === "day") {
      // Key format: "2026-09-08 14:00"
      const timePart = key.split(" ")[1];
      if (!timePart) return key;
      const hour = parseInt(timePart.split(":")[0], 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      const h12 = hour % 12 || 12;
      return `${h12.toString().padStart(2, "0")}:00 ${ampm}`;
    }

    if (period === "week") {
      // Key format: "2026-09-08" -> "Tue, Sep 08"
      const [year, month, day] = key.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "2-digit",
      });
    }

    if (period === "year") {
      // Key format: "2026-09" -> "Sep"
      const [year, month] = key.split("-").map(Number);
      const date = new Date(year, month - 1, 1);
      return date.toLocaleDateString("en-US", { month: "short" });
    }

    // Default "month" view: Key format: "2026-09-08" -> "Sep 08"
    const [year, month, day] = key.split("-").map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString("en-US", { month: "short", day: "2-digit" });
  } catch (err) {
    return key;
  }
}

function getPeriodConfig(period) {
  const now = new Date();
  let startDate = new Date(now);
  let sortFormat = "%Y-%m-%d";

  if (period === "day") {
    startDate.setHours(0, 0, 0, 0);
    sortFormat = "%Y-%m-%d %H:00";
  } else if (period === "week") {
    startDate.setDate(now.getDate() - 7);
    startDate.setHours(0, 0, 0, 0);
    sortFormat = "%Y-%m-%d";
  } else if (period === "year") {
    startDate = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
    sortFormat = "%Y-%m";
  } else {
    // "month" (default: last 30 days)
    startDate.setDate(now.getDate() - 30);
    startDate.setHours(0, 0, 0, 0);
    sortFormat = "%Y-%m-%d";
  }

  return { startDate, sortFormat };
}

export const getDashboardLiveData = async (req, res) => {
  const period = req.query.period || "month";
  const { startDate, sortFormat } = getPeriodConfig(period);

  logger.info(`User requested dashboard live data for period: ${period}`);

  req.on("close", () => {
    dashboardSse.removeClient(res);
  });

  try {
    const [orderMetrics, salesChart, movementMetrics, movementChart, recentOrders] =
      await Promise.all([
        // 1. KPI Aggregation for Orders within period
        Order.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $project: {
              dueAmount: { $ifNull: ["$dueAmount", 0] },
              discountAmount: { $ifNull: ["$payment.discountAmount", 0] },
              paidAmount: { $ifNull: ["$payment.paidAmount", 0] },
              grossTotal: {
                $reduce: {
                  input: "$items",
                  initialValue: 0,
                  in: { $add: ["$$value", { $multiply: ["$$this.price", "$$this.qty"] }] },
                },
              },
            },
          },
          {
            $group: {
              _id: null,
              grossTotal: { $sum: "$grossTotal" },
              totalPaid: { $sum: "$paidAmount" },
              totalDiscount: { $sum: "$discountAmount" },
              totalDueLeft: { $sum: "$dueAmount" },
              totalOrders: { $sum: 1 },
              fullyPaidCount: {
                $sum: { $cond: [{ $lte: ["$dueAmount", 0] }, 1, 0] },
              },
              pendingDueCount: {
                $sum: { $cond: [{ $gt: ["$dueAmount", 0] }, 1, 0] },
              },
            },
          },
        ]),

        // 2. Dynamic Time-Grouped Sales Trend Aggregation
        Order.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: {
                $dateToString: { format: sortFormat, date: "$createdAt", timezone: TIMEZONE },
              },
              grossTotal: {
                $sum: {
                  $reduce: {
                    input: "$items",
                    initialValue: 0,
                    in: { $add: ["$$value", { $multiply: ["$$this.price", "$$this.qty"] }] },
                  },
                },
              },
              paidAmount: { $sum: { $ifNull: ["$payment.paidAmount", 0] } },
              discountAmount: { $sum: { $ifNull: ["$payment.discountAmount", 0] } },
              dueAmount: { $sum: { $ifNull: ["$dueAmount", 0] } },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        // 3. Stock Movement KPI Aggregation
        Movement.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: "$type",
              count: { $sum: 1 },
            },
          },
        ]),

        // 4. Dynamic Time-Grouped Stock Movement Aggregation
        Movement.aggregate([
          { $match: { createdAt: { $gte: startDate } } },
          {
            $group: {
              _id: {
                key: { $dateToString: { format: sortFormat, date: "$createdAt", timezone: TIMEZONE } },
                type: "$type",
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { "_id.key": 1 } },
        ]),

        // 5. Recent orders snapshot
        Order.find()
          .sort({ createdAt: -1 })
          .limit(15)
          .populate([
            { path: "createdBy", select: "username" },
            { path: "customerId", select: "username" },
            { path: "items.product", select: "name" },
          ])
          .lean(),
      ]);

    const kpi = orderMetrics[0] || {
      grossTotal: 0,
      totalPaid: 0,
      totalDiscount: 0,
      totalDueLeft: 0,
      totalOrders: 0,
      fullyPaidCount: 0,
      pendingDueCount: 0,
    };

    const stockKpi = {
      inbound: movementMetrics.find((m) => m._id === "inbound")?.count || 0,
      outbound: movementMetrics.find((m) => m._id === "outbound")?.count || 0,
    };

    // Format sales chart with clean display labels
    const formattedSalesChart = salesChart.map((item) => ({
      periodKey: item._id,
      period: formatChartLabel(item._id, period),
      grossTotal: item.grossTotal,
      paidAmount: item.paidAmount,
      discount: item.discountAmount,
      dueAmount: item.dueAmount,
    }));

    // Group movement chart by formatted date key
    const movementMap = {};
    movementChart.forEach((item) => {
      const key = item._id.key;
      const label = formatChartLabel(key, period);
      if (!movementMap[key]) {
        movementMap[key] = { periodKey: key, period: label, inbound: 0, outbound: 0 };
      }
      if (item._id.type === "inbound") movementMap[key].inbound = item.count;
      if (item._id.type === "outbound") movementMap[key].outbound = item.count;
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders?.();

    dashboardSse.addClient(res);

    res.write(
      `data: ${JSON.stringify({
        type: "INIT",
        period,
        metrics: kpi,
        stockMetrics: stockKpi,
        salesChart: formattedSalesChart,
        movementChart: Object.values(movementMap),
        recentOrders,
      })}\n\n`
    );
  } catch (error) {
    logger.error(`Error fetching dashboard live data: ${error.message}`, { error });

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    } else {
      res.write(
        `data: ${JSON.stringify({ type: "ERROR", message: "Stream initialization failed" })}\n\n`
      );
      res.end();
    }
  }
};