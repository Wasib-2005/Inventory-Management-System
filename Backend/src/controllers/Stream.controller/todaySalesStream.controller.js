import { logger } from "../../config/logger.js";
import todaySalesSse from "../../utility/sseManager/todaySalesSse.js";

export const todaySalesStream = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  todaySalesSse.addClient(res);
  logger.info(
    { totalClients: todaySalesSse.getClientCount() },
    "[SSE] Client connected",
  );

  res.write(
    `data: ${JSON.stringify({ status: "connected", timestamp: new Date() })}\n\n`,
  );

  req.on("close", () => {
    todaySalesSse.removeClient(res);
    logger.info(
      { totalClients: todaySalesSse.getClientCount() },
      "[SSE] Client disconnected",
    );
  });
};
