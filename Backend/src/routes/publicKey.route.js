import express from "express";

import { logger } from "../config/logger.js";
import { PublicKeyGenerator } from "../controllers/publicKey.controller.js";

const router = express.Router();

router.get("/publickey", PublicKeyGenerator);

export default router;
