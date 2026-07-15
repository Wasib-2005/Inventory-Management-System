import pino from "pino";

const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: LOG_LEVEL,

  transport: isProduction // TODO: addd !
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,

  // 3. Automatically formats Error object stack traces safely
  serializers: pino.stdSerializers,
});
