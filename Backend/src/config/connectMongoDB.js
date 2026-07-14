import mongoose from "mongoose";
import { logger } from "./logger.js";

const connectMongoDB = async () => {
  const MONGOURL = process.env.MONGOURL;

  if (!MONGOURL) {
    logger.warn(
      " MONGOURL not found in environment variables. Skipping DB connection.",
    );
    return;
  }

  try {
    await mongoose.connect(MONGOURL);
    logger.info(" MongoDB Connected Successfully");
  } catch (error) {
    logger.error(` MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectMongoDB;
