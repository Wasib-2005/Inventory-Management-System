import "dotenv/config";

import http from "http";
import https from "https";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url"; // 1. Import this helper
import app from "./app.js";
import { logger } from "./src/config/logger.js";

// 2. Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 5000;
const isHttps = process.env.IS_HTTPS === "true";

let server;

if (isHttps) {
  const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, "../certs/localhost-key.pem")),
    cert: fs.readFileSync(path.join(__dirname, "../certs/localhost.pem")),
  };
  server = https.createServer(sslOptions, app);
} else {
  server = http.createServer(app);
}

server.listen(PORT, () => {
  logger.info(
    `🚀 Inventory Backend running on ${isHttps ? "https" : "http"}://localhost:${PORT}`,
  );
});

server.on("error", (error) => {
  logger.error("Server error:", error);
});
