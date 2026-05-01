import { serverPublicKey } from '../config/keyManager.js';
import logger from '../config/logger.js';

/**
 * GET /publickey
 * Sends the persistent public key to the frontend.
 */
export const PublicKeyGenerator = async (req, res) => {
    try {
        // Log the request for security auditing
        logger.info(`Public key requested from IP: ${req.ip}`);

        res.status(200).json({
            success: true,
            publicKey: serverPublicKey, // This is now consistent across restarts
        });
    } catch (error) {
        logger.error("Failed to serve public key:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};