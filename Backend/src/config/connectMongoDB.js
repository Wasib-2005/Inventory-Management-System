const mongoose = require('mongoose');
const logger = require('./logger.js'); // Make sure path is correct

const connectMongoDB = async () => {
    const MONGOURL = process.env.MONGOURL;

    if (!MONGOURL) {
        logger.warn("⚠️  MONGOURL not found in environment variables. Skipping DB connection.");
        return;
    }

    try {
        await mongoose.connect(MONGOURL);
        logger.info("🍃 MongoDB Connected Successfully");
    } catch (error) {
        // This is where your colorful red error happens!
        logger.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1); // Stop the server if the DB fails
    }
};

module.exports = connectMongoDB;