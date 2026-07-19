import { logger } from "../../config/logger.js";
import dashboardSse from "../../utility/sseManager/dashboardSse.js";

export const streamDashboard = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  dashboardSse.addClient(res);
  logger.info(
    { totalClients: dashboardSse.getClientCount() },
    "[SSE] Client connected",
  );

  res.write(
    `data: ${JSON.stringify({ status: "connected", timestamp: new Date() })}\n\n`,
  );

  req.on("close", () => {
    dashboardSse.removeClient(res);
    logger.info(
      { totalClients: dashboardSse.getClientCount() },
      "[SSE] Client disconnected",
    );
  });
};
