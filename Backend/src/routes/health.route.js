const express = require("express");
const logger = require('../config/logger.js');

const router = express.Router();

router.get("/health", async (req, res) => {
    logger.debug("Health check requested");
    res.status(200).json({ status: "OK", message: "Server is healthy" });
});

module.exports = router;