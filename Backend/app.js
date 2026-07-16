import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import connectMongoDB from "./src/config/connectMongoDB.js";
import healthRoute from "./src/routes/health.route.js";
import authRoute from "./src/routes/auth.route.js";
import PublicKeyGeneratorRoute from "./src/routes/publicKey.route.js";
import AccountsAndPermissionsRoute from "./src/routes/AccountsRelated.Route/accountsAndPermissions.route.js";
import RoleRoute from "./src/routes/roles.route.js";
import ManageAccountsRoute from "./src/routes/AccountsRelated.Route/manageAccounts.route.js";
import ManagerRouter from "./src/routes/AccountsRelated.Route/managers.route.js";
import WarehouseRouter from "./src/routes/Warehouse.Routes/Warehouse.route.js";
import CategoryRouter from "./src/routes/Products.Routes/Category.route.js";
import SupplierRouter from "./src/routes/supplier.route.js";
import ProductRouter from "./src/routes/Products.Routes/Products.route.js";
import { generateImageName } from "./src/utility/image/imageNameGenetator.js";
import {logger} from "./src/config/logger.js";

const app = express();

connectMongoDB();

const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(",").map((o) =>
      o.trim().replace(/\/$/, ""),
    )
  : [];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Blocked for origin: ${origin}`);
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cookieParser());
app.use(express.json());
app.use(cors(corsOptions));
app.options("/{*path}", cors(corsOptions));

logger.info(`Image probider is ${process.env.UPLOAD_PROVIDER}`);

// app.use((req, res, next) => {
//   const start = Date.now();

//   const ip =
//     req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
//     req.socket.remoteAddress;

//   console.log("─".repeat(60));
//   console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
//   console.log(`  IP      : ${ip}`);
//   console.log(`  Origin  : ${req.headers.origin || "—"}`);
//   console.log(`  UA      : ${req.headers["user-agent"] || "—"}`);

//   if (Object.keys(req.query).length) {
//     console.log(`  Query   :`, req.query);
//   }

//   if (req.body && Object.keys(req.body).length) {
//     const { password, confirmPassword, ...safeBody } = req.body; // strip sensitive fields
//     console.log(`  Body    :`, safeBody);
//   }

//   res.on("finish", () => {
//     const ms = Date.now() - start;
//     const statusIcon = res.statusCode < 400 ? "✅" : "❌";
//     console.log(`  ${statusIcon} Status : ${res.statusCode} (${ms}ms)`);
//     console.log("─".repeat(60));
//   });

//   next();
// });

// Simulate network delay remove it
app.use((req, res, next) => {
  const DELAY_MS = 1;
  setTimeout(next, DELAY_MS);
});

app.use("/", healthRoute);
app.use("/api/auth/", authRoute);
app.use("/api/", PublicKeyGeneratorRoute);

app.use("/api/", AccountsAndPermissionsRoute);
app.use("/api/", RoleRoute);
app.use("/api/", ManageAccountsRoute);
app.use("/api/", ManagerRouter);
app.use("/api/warehouses", WarehouseRouter);
app.use("/api/category", CategoryRouter);
app.use("/api/suppliers", SupplierRouter);
app.use("/api/product", ProductRouter);

export default app;
