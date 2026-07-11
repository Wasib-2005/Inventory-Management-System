const express = require("express");
const logger = require('../config/logger.js');
const { PublicKeyGenerator } = require("../controllers/publicKey.controller.js");

const router = express.Router();

router.get("/publickey", PublicKeyGenerator);

module.exports = router; 