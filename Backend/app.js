require('dotenv').config();
const cors = require("cors");
const express = require("express");
const cookieParser = require('cookie-parser');

const connectMongoDB = require('./src/config/connectMongoDB.js');

const healthRoute = require("./src/routes/health.route.js");
const authRoute = require("./src/routes/auth.route.js");
const PublicKeyGeneratorRoute = require('./src/routes/publicKey.route.js');

const app = express();

// Connect to Database
connectMongoDB();

// Parse allowed origins from env
const allowedOrigins = process.env.ALLOWED_ORIGINE
  ? process.env.ALLOWED_ORIGINE.split(',').map(o => o.trim().replace(/\/$/, ''))
  : [];

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS Blocked for origin: ${origin}`);
      callback(new Error(`CORS blocked: ${origin}`));
    } 
  },
  credentials: true, // <--- THIS IS THE FIX
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Routes
app.use("/", healthRoute);
app.use("/api/auth/", authRoute);
app.use("/api/", PublicKeyGeneratorRoute);

module.exports = app;