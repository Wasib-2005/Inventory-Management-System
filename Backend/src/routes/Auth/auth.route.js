const express  = require("express");
const {
  signUpLogic,
  signInLogic,
  refreshAuth,
  logout,
} = require("../../controllers/Auth/auth.Controller.js");

const router = express.Router();

router.post("/singin",     signInLogic);
router.post("/singup",     signUpLogic);
router.post("/refresh",    refreshAuth);   // renamed from refresh_auth
router.post("/logout",     logout);

module.exports = router;