import fs from "fs";
import path from "path";
import crypto from "crypto";
import {logger} from "./logger.js";

const KEY_DIR = path.join(process.cwd(), "keys");
const PRIVATE_KEY_PATH = path.join(KEY_DIR, "asymmetricKey/private.pem");
const PUBLIC_KEY_PATH = path.join(KEY_DIR, "asymmetricKey/public.pem");
const SYMMETRIC_KEY_PATH = path.join(KEY_DIR, "symmetricKey/season_key.pem");

const ensureDir = (filePath) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const loadOrCreateAsymmetricKeys = () => {
  if (fs.existsSync(PRIVATE_KEY_PATH) && fs.existsSync(PUBLIC_KEY_PATH)) {
    logger.info("Asymmetric keys loaded from storage.");
    return {
      privateKey: fs.readFileSync(PRIVATE_KEY_PATH, "utf8"),
      publicKey: fs.readFileSync(PUBLIC_KEY_PATH, "utf8"),
    };
  }

  logger.warn("Generating new RSA-2048 key pair...");
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });

  ensureDir(PRIVATE_KEY_PATH);
  fs.writeFileSync(PRIVATE_KEY_PATH, privateKey, { mode: 0o600 });
  fs.writeFileSync(PUBLIC_KEY_PATH, publicKey);
  logger.info("Asymmetric keys saved.");

  return { publicKey, privateKey };
};

const loadOrCreateSymmetricKey = () => {
  if (fs.existsSync(SYMMETRIC_KEY_PATH)) {
    logger.info("Symmetric season key loaded from storage.");
    return Buffer.from(
      fs.readFileSync(SYMMETRIC_KEY_PATH, "utf8").trim(),
      "hex",
    );
  }

  logger.warn("Generating new AES-256 season key...");
  const key = crypto.randomBytes(32);

  ensureDir(SYMMETRIC_KEY_PATH);
  fs.writeFileSync(SYMMETRIC_KEY_PATH, key.toString("hex"), { mode: 0o600 });
  logger.info("Symmetric season key saved.");

  return key;
};

const initKeys = () => {
  try {
    const { publicKey, privateKey } = loadOrCreateAsymmetricKeys();
    const symmetricKey = loadOrCreateSymmetricKey();
    return { publicKey, privateKey, symmetricKey };
  } catch (error) {
    logger.error("Failed to initialize security keys:", error);
    process.exit(1);
  }
};

const { publicKey, privateKey, symmetricKey } = initKeys();

export const serverPublicKey = publicKey;
export const serverPrivateKey = privateKey;
export const serverSeasonKey = symmetricKey;
