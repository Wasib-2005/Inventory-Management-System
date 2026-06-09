const express = require("express");
const logger = require("../config/logger.js");
const { getManagers } = require("../controllers/managers.Controller.js");
const { verifyAccess } = require("../middlewares/verifyAccess.middleware.js");

const router = express.Router();

router.get(
  "/get-managers",
  //  verifyAccess,
  getManagers,
);

module.exports = router;
