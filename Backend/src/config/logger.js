const pino = require('pino');

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const baseLogger = pino({
  level: LOG_LEVEL,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

// Create a proxy/wrapper to handle (message, ...args)
const logger = {
  // This captures all arguments
  info: (msg, ...args) => baseLogger.info(args.length ? { extra: args } : {}, msg, ...args),
  debug: (msg, ...args) => baseLogger.debug(args.length ? { extra: args } : {}, msg, ...args),
  error: (msg, ...args) => baseLogger.error(args.length ? { extra: args } : {}, msg, ...args),
  warn: (msg, ...args) => baseLogger.warn(args.length ? { extra: args } : {}, msg, ...args),
};

module.exports = logger;