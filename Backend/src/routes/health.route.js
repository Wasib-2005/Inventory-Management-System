import express from "express";
import { logger } from "../config/logger.js";

const router = express.Router();

router.get("/", async (req, res) => {
  logger.debug("Health check requested");
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

export default router;
  