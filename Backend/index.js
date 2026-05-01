require('dotenv').config();
const express = require("express");
const cors = require("cors")

const connectMongoDB = require('./src/config/connectMongoDB.js');
const logger = require('./src/config/logger.js');

const healthRoute = require("./src/routes/health.route.js");
const singInSingUpRoute = require("./src/routes/Auth/SingInSingUp.route.js")
const PublicKeyGeneratorRoute = require('./src/routes/PublicKeyGenerator.route.js');

const app = express();
const PORT = process.env.PORT || 5000;


// Connect to Database
connectMongoDB();

// Middleware
app.use(express.json());
app.use(cors({origin:"*"}))

// Routes
app.use("/", healthRoute); // This makes the URL: http://localhost:5000/api/health
app.use("/api/auth/",singInSingUpRoute)
app.use("/api/",PublicKeyGeneratorRoute)

app.listen(PORT, () => {
    logger.info(`🚀 Inventory Backend running on http://localhost:${PORT}`);
});