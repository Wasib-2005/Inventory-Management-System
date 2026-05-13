require('dotenv').config();
const cors = require("cors");
const express = require("express");
const cookieParser = require('cookie-parser');
const connectMongoDB = require('./src/config/connectMongoDB.js');
const healthRoute = require("./src/routes/health.route.js");
const authRoute = require("./src/routes/auth.route.js");
const PublicKeyGeneratorRoute = require('./src/routes/publicKey.route.js');

const app = express();

connectMongoDB();

const allowedOrigins = process.env.ALLOWED_ORIGIN
  ? process.env.ALLOWED_ORIGIN.split(',').map(o => o.trim().replace(/\/$/, ''))
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
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));
app.options('/{*path}', cors(corsOptions)); // ← Express 5 wildcard syntax

app.use("/", healthRoute);
app.use("/api/auth/", authRoute);
app.use("/api/", PublicKeyGeneratorRoute);

module.exports = app;