const pino = require('pino');

const LOG_LEVEL = process.env.LOG_LEVEL
console.log(LOG_LEVEL)
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty', 
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});
logger.info(`Log Level: ${LOG_LEVEL} `)

module.exports = logger;