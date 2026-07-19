import express from "express";
import { streamDashboard } from "../../controllers/Stream.controller/dashboardStream.controller.js";
import { todaySalesStream } from "../../controllers/Stream.controller/todaySalesStream.controller.js";

const router = express.Router();

router.get("/livedashboard", streamDashboard);
router.get("/todaysales", todaySalesStream);

export default router;
