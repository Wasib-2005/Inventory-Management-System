require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectMongoDB = require('./src/config/connectMongoDB.js');
const healthRoute = require("./src/routes/health.route.js");
const singInSingUpRoute = require("./src/routes/Auth/SingInSingUp.route.js");
const PublicKeyGeneratorRoute = require('./src/routes/PublicKeyGenerator.route.js');

const app = express();

// Connect to Database
connectMongoDB();

// Parse allowed origins from env
const allowedOrigins = process.env.ALLOWED_ORIGINE
  ? process.env.ALLOWED_ORIGINE.split(',').map(o => o.trim().replace(/\/$/, ''))
  : [];

// Middleware
app.use(express.json());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
}));

// Routes
app.use("/", healthRoute);
app.use("/api/auth/", singInSingUpRoute);
app.use("/api/", PublicKeyGeneratorRoute);

module.exports = app;