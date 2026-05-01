const express = require("express");
const logger = require('../config/logger.js');
const { PublicKeyGenerator } = require("../controllers/PublicKeyGenerator.Controller.js");

const router = express.Router();

router.get("/publickey", PublicKeyGenerator);

module.exports = router; 