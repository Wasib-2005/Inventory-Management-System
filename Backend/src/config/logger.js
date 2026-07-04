const pino = require("pino");

const LOG_LEVEL = process.env.LOG_LEVEL || "info";

const baseLogger = pino({
  level: LOG_LEVEL,
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "SYS:standard",
      ignore: "pid,hostname",
    },
  },
});

function buildCtx(args) {
  if (!args.length) return { ctx: {}, suffix: "" };

  const ctx = {};
  const strings = [];

  for (const arg of args) {
    if (arg instanceof Error) {
      ctx.err = arg;
    } else if (arg && typeof arg === "object") {
      Object.assign(ctx, arg);
    } else {
      strings.push(String(arg));
    }
  }

  return { ctx, suffix: strings.join(" ") };
}

function makeLog(level) {
  return (msg, ...args) => {
    const { ctx, suffix } = buildCtx(args);
    baseLogger[level](ctx, suffix ? `${msg} ${suffix}` : msg);
  };
}

const logger = {
  info: makeLog("info"),
  debug: makeLog("debug"),
  warn: makeLog("warn"),
  error: makeLog("error"),
};

module.exports = logger;
