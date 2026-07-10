import jwt from 'jsonwebtoken';
const jwtSecret = process.env.JWT_SECRET || 'streamverse-dev-jwt-secret-do-not-use-in-production-0x7f';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
/**
 * Generate a JWT token for a user
 */
export function generateToken(userId) {
    return jwt.sign({ userId }, jwtSecret, { expiresIn: jwtExpiresIn });
}
/**
 * Verify a JWT token and return the payload
 */
export function verifyToken(token) {
    try {
        return jwt.verify(token, jwtSecret);
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=jwt.js.map