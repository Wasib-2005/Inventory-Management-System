import express from "express";
import {
  signUpLogic,
  signInLogic,
  logout,
} from "../controllers/Auth/auth.controller.js";
import { refreshAuth } from "../controllers/Auth/refreshAuth.controller.js";
import { blockRouteMiddleware } from "../middlewares/blockRoute.middleware.js";

const router = express.Router();

router.post("/signin", signInLogic);
router.post("/signup", blockRouteMiddleware, signUpLogic);
router.post("/refresh", refreshAuth);
router.post("/logout", logout);

export default router;
