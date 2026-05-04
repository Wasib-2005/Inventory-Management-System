import jwt from 'jsonwebtoken';

const privateKey = process.env.JWT_SECRET;

/**
 * Generates a JWT token
 * @param {Object} data - Payload to encode
 * @param {string|number} time - Expiration (e.g., '1d', '2h', 3600)
 */
export const getToken = (data, time) => {
    return jwt.sign({ data }, privateKey, { expiresIn: time });
};