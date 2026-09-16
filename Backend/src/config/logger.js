import "dotenv/config";

import fs from "fs";
import path from "path";
import { Writable } from "stream";
import { fileURLToPath } from "url";
import pino from "pino";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOG_LEVEL = process.env.LOG_LEVEL || "info";
const LOG_DIRECTORY = path.resolve(__dirname, "../../logs");
const LOG_FILE = path.join(LOG_DIRECTORY, "backend.log");
const MAX_LOG_BYTES = parseLogSize(
  process.env.LOG_LIMIT || process.env.LOG_LIMITE || "1MB",
);

function parseLogSize(value) {
  const match = String(value).trim().match(/^(\d+(?:\.\d+)?)\s*(B|KB|MB|GB)?$/i);
  if (!match) {
    throw new Error(`Invalid LOG_LIMIT value "${value}". Use values like 1MB.`);
  }

  const units = { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3 };
  return Math.max(1, Math.floor(Number(match[1]) * (units[match[2]?.toUpperCase()] || 1)));
}

class RotatingLogStream extends Writable {
  #stream;
  #bytesWritten = 0;

  constructor(filePath, maxBytes) {
    super();
    this.filePath = filePath;
    this.maxBytes = maxBytes;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    this.#bytesWritten = fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
    this.#stream = fs.createWriteStream(filePath, { flags: "a" });
  }

  _write(chunk, encoding, callback) {
    const data = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding);
    if (this.#bytesWritten > 0 && this.#bytesWritten + data.length > this.maxBytes) {
      this.#stream.end(() => {
        const archivePath = `${this.filePath}.${new Date()
          .toISOString()
          .replace(/[:.]/g, "-")}`;
        fs.renameSync(this.filePath, archivePath);
        this.#bytesWritten = 0;
        this.#stream = fs.createWriteStream(this.filePath, { flags: "a" });
        this.#write(data, callback);
      });
      return;
    }

    this.#write(data, callback);
  }

  #write(data, callback) {
    this.#bytesWritten += data.length;
    this.#stream.write(data, callback);
  }

  _final(callback) {
    this.#stream.end(callback);
  }
}

const fileStream = new RotatingLogStream(LOG_FILE, MAX_LOG_BYTES);

export const logger = pino(
  {
    level: LOG_LEVEL,
    serializers: pino.stdSerializers,
  },
  pino.multistream([
    { level: LOG_LEVEL, stream: process.stdout },
    { level: LOG_LEVEL, stream: fileStream },
  ]),
);

logger.info(
  { logFile: LOG_FILE, maxLogBytes: MAX_LOG_BYTES },
  "Structured backend logging initialized",
);
