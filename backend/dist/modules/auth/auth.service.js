"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const database_1 = require("@config/database");
const logger_1 = require("@config/logger");
class AuthService {
    constructor() {
        this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        this.jwtExpiry = process.env.JWT_EXPIRY || '15m';
        this.refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';
    }
    /**
     * Register a new user
     */
    async register(payload) {
        try {
            // Check if user already exists
            const existingUser = await (0, database_1.query)('SELECT id FROM users WHERE email = $1', [payload.email]);
            if (existingUser.rows.length > 0) {
                throw new Error('Email already registered');
            }
            // Hash password
            const hashedPassword = await bcryptjs_1.default.hash(payload.password, parseInt(process.env.BCRYPT_ROUNDS || '12'));
            // Create user
            const userId = (0, uuid_1.v4)();
            const result = await (0, database_1.query)(`INSERT INTO users (id, email, password_hash, first_name, last_name, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, first_name, last_name, created_at`, [userId, payload.email, hashedPassword, payload.firstName, payload.lastName, false]);
            logger_1.logger.info(`User registered: ${payload.email}`);
            return {
                id: result.rows[0].id,
                email: result.rows[0].email,
                firstName: result.rows[0].first_name,
                lastName: result.rows[0].last_name,
                createdAt: result.rows[0].created_at,
            };
        }
        catch (error) {
            logger_1.logger.error('Registration error:', error);
            throw error;
        }
    }
    /**
     * Login user with email and password
     */
    async login(payload) {
        try {
            // Find user
            const result = await (0, database_1.query)('SELECT id, email, password_hash, first_name, last_name FROM users WHERE email = $1', [payload.email]);
            if (result.rows.length === 0) {
                throw new Error('Invalid credentials');
            }
            const user = result.rows[0];
            // Verify password
            const isPasswordValid = await bcryptjs_1.default.compare(payload.password, user.password_hash);
            if (!isPasswordValid) {
                throw new Error('Invalid credentials');
            }
            // Generate tokens
            const tokens = this.generateTokens(user.id, user.email);
            // Store session
            await this.createSession(user.id, tokens.refreshToken);
            // Update last login
            await (0, database_1.query)('UPDATE users SET last_login_at = NOW() WHERE id = $1', [user.id]);
            logger_1.logger.info(`User logged in: ${payload.email}`);
            return {
                ...tokens,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                },
            };
        }
        catch (error) {
            logger_1.logger.error('Login error:', error);
            throw error;
        }
    }
    /**
     * Generate JWT tokens
     */
    generateTokens(userId, email) {
        const accessToken = jsonwebtoken_1.default.sign({
            sub: userId,
            email,
            type: 'access',
        }, this.jwtSecret, { expiresIn: this.jwtExpiry });
        const refreshToken = jsonwebtoken_1.default.sign({
            sub: userId,
            type: 'refresh',
        }, this.jwtSecret, { expiresIn: this.refreshExpiry });
        return {
            accessToken,
            refreshToken,
            expiresIn: 900, // 15 minutes in seconds
        };
    }
    /**
     * Create user session
     */
    async createSession(userId, refreshToken) {
        const sessionId = (0, uuid_1.v4)();
        const tokenHash = await bcryptjs_1.default.hash(refreshToken, 10);
        await (0, database_1.query)(`INSERT INTO user_sessions (id, user_id, refresh_token_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`, [sessionId, userId, tokenHash]);
    }
    /**
     * Verify JWT token
     */
    verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, this.jwtSecret);
            return decoded;
        }
        catch (error) {
            logger_1.logger.error('Token verification error:', error);
            throw new Error('Invalid token');
        }
    }
    /**
     * Refresh access token
     */
    async refreshAccessToken(refreshToken) {
        try {
            const decoded = this.verifyToken(refreshToken);
            if (decoded.type !== 'refresh') {
                throw new Error('Invalid refresh token');
            }
            // Get user
            const result = await (0, database_1.query)('SELECT id, email FROM users WHERE id = $1', [decoded.sub]);
            if (result.rows.length === 0) {
                throw new Error('User not found');
            }
            const user = result.rows[0];
            return this.generateTokens(user.id, user.email);
        }
        catch (error) {
            logger_1.logger.error('Token refresh error:', error);
            throw error;
        }
    }
    /**
     * Logout user
     */
    async logout(userId) {
        try {
            await (0, database_1.query)('DELETE FROM user_sessions WHERE user_id = $1', [userId]);
            logger_1.logger.info(`User logged out: ${userId}`);
        }
        catch (error) {
            logger_1.logger.error('Logout error:', error);
            throw error;
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map