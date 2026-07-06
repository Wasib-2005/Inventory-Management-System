require("dotenv").config();
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const connectMongoDB = require("./src/config/connectMongoDB.js");
const healthRoute = require("./src/routes/health.route.js");
const authRoute = require("./src/routes/auth.route.js");
const PublicKeyGeneratorRoute = require("./src/routes/publicKey.route.js");
const AccountsAndPermissionsRoute = require("./src/routes/AccountsRelated/accountsAndPermissions.route.js");
const RoleRoute = require("./src/routes/roles.route.js");
const ManageAccountsRoute = require("./src/routes/AccountsRelated/manageAccounts.route.js");
const ManagerRouter = require("./src/routes/AccountsRelated/managers.route.js");
const WarehouseRouter = require("./src/routes/Warehouse.Routes/Warehouse.route.js");

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
  const DELAY_MS = 1000;
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
module.exports = app;
