const express = require("express");
const {
  signUpLogic,
  signInLogic,
  logout,
} = require("../controllers/Auth/auth.controller.js");
const {
  refreshAuth,
} = require("../controllers/Auth/refreshAuth.controller.js");
const {
  blockRouteMiddleware,
} = require("../middlewares/blockRoute.middleware.js");

const router = express.Router();

router.post("/singin", signInLogic);
router.post("/singup", blockRouteMiddleware, signUpLogic);
router.post("/refresh", refreshAuth);
router.post("/logout", logout);

module.exports = router;
