import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import logger from './logger.js';

const KEY_DIR = path.join(process.cwd(), 'keys');
const PRIVATE_KEY_PATH = path.join(KEY_DIR, 'private.pem');
const PUBLIC_KEY_PATH = path.join(KEY_DIR, 'public.pem');

const getKeys = () => {
    try {
        // Step 1: Check if keys already exist locally
        if (fs.existsSync(PRIVATE_KEY_PATH) && fs.existsSync(PUBLIC_KEY_PATH)) {
            logger.info("Security keys loaded from storage.");
            return {
                privateKey: fs.readFileSync(PRIVATE_KEY_PATH, 'utf8'),
                publicKey: fs.readFileSync(PUBLIC_KEY_PATH, 'utf8')
            };
        }

        // Step 2: If not, generate them once
        logger.warn("No keys found. Generating persistent RSA-2048 key pair...");
        
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: { type: 'spki', format: 'pem' },
            privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
        });

        // Step 3: Create 'keys' directory and save files
        if (!fs.existsSync(KEY_DIR)) {
            fs.mkdirSync(KEY_DIR, { recursive: true });
        }
        
        fs.writeFileSync(PRIVATE_KEY_PATH, privateKey);
        fs.writeFileSync(PUBLIC_KEY_PATH, publicKey);
        
        logger.info(`Keys successfully saved to ${KEY_DIR}`);
        return { publicKey, privateKey };

    } catch (error) {
        logger.error("Failed to initialize security keys:", error);
        process.exit(1); // Kill the process if we can't secure the app
    }
};

const { publicKey, privateKey } = getKeys();

export const serverPublicKey = publicKey;
export const serverPrivateKey = privateKey;