import express from "express";

import { logger } from "../config/logger.js";
import { PublicKeyGenerator } from "../controllers/publicKey.controller.js";

const router = express.Router();

router.get("/", PublicKeyGenerator);

export default router;
