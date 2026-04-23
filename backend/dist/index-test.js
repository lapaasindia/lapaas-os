"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const pino_http_1 = __importDefault(require("pino-http"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const logger_1 = require("@config/logger");
// Load environment variables
dotenv_1.default.config({ path: '.env.local' });
// In-memory database for testing
const users = [];
const sessions = [];
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, pino_http_1.default)({ logger: logger_1.logger }));
// Auth Middleware
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided',
                code: 'NO_TOKEN',
            });
        }
        const token = authHeader.substring(7);
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        req.user = {
            id: decoded.sub,
            email: decoded.email,
        };
        next();
    }
    catch (error) {
        res.status(401).json({
            error: 'Unauthorized',
            message: error.message,
        });
    }
};
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: 'in-memory',
    });
});
// API version endpoint
app.get('/api/v1', (req, res) => {
    res.json({
        version: '1.0.0',
        name: 'Lapaas OS API',
        environment: process.env.NODE_ENV,
        mode: 'test-mode-in-memory',
    });
});
// Register endpoint
app.post('/api/v1/auth/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        // Validation
        if (!email || !password || !firstName || !lastName) {
            return res.status(400).json({
                error: 'Missing required fields',
            });
        }
        // Check if user exists
        if (users.find((u) => u.email === email)) {
            return res.status(400).json({
                error: 'Email already registered',
                code: 'EMAIL_EXISTS',
            });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const userId = (0, uuid_1.v4)();
        const user = {
            id: userId,
            email,
            password_hash: hashedPassword,
            first_name: firstName,
            last_name: lastName,
            email_verified: false,
            created_at: new Date().toISOString(),
        };
        users.push(user);
        logger_1.logger.info(`User registered: ${email}`);
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                createdAt: user.created_at,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Register error:', error);
        res.status(500).json({
            error: 'Registration failed',
            message: error.message,
        });
    }
});
// Login endpoint
app.post('/api/v1/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Validation
        if (!email || !password) {
            return res.status(400).json({
                error: 'Email and password required',
            });
        }
        // Find user
        const user = users.find((u) => u.email === email);
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS',
            });
        }
        // Verify password
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid credentials',
                code: 'INVALID_CREDENTIALS',
            });
        }
        // Generate tokens
        const accessToken = jsonwebtoken_1.default.sign({
            sub: user.id,
            email: user.email,
            type: 'access',
        }, JWT_SECRET, { expiresIn: '15m' });
        const refreshToken = jsonwebtoken_1.default.sign({
            sub: user.id,
            type: 'refresh',
        }, JWT_SECRET, { expiresIn: '7d' });
        // Store session
        sessions.push({
            id: (0, uuid_1.v4)(),
            user_id: user.id,
            refresh_token_hash: refreshToken,
            created_at: new Date().toISOString(),
        });
        logger_1.logger.info(`User logged in: ${email}`);
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                accessToken,
                refreshToken,
                expiresIn: 900,
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.first_name,
                    lastName: user.last_name,
                },
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            message: error.message,
        });
    }
});
// Refresh token endpoint
app.post('/api/v1/auth/refresh', (req, res) => {
    try {
        const refreshToken = req.body.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({
                error: 'Refresh token required',
            });
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, JWT_SECRET);
        if (decoded.type !== 'refresh') {
            return res.status(401).json({
                error: 'Invalid refresh token',
            });
        }
        const user = users.find((u) => u.id === decoded.sub);
        if (!user) {
            return res.status(401).json({
                error: 'User not found',
            });
        }
        const newAccessToken = jsonwebtoken_1.default.sign({
            sub: user.id,
            email: user.email,
            type: 'access',
        }, JWT_SECRET, { expiresIn: '15m' });
        res.json({
            success: true,
            message: 'Token refreshed',
            data: {
                accessToken: newAccessToken,
                expiresIn: 900,
            },
        });
    }
    catch (error) {
        logger_1.logger.error('Refresh error:', error);
        res.status(401).json({
            error: 'Token refresh failed',
            message: error.message,
        });
    }
});
// Get current user endpoint
app.get('/api/v1/auth/me', authMiddleware, (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized',
            });
        }
        res.json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        logger_1.logger.error('Get current user error:', error);
        res.status(500).json({
            error: 'Failed to get current user',
            message: error.message,
        });
    }
});
// Logout endpoint
app.post('/api/v1/auth/logout', authMiddleware, (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({
                error: 'Unauthorized',
            });
        }
        logger_1.logger.info(`User logged out: ${userId}`);
        res.json({
            success: true,
            message: 'Logout successful',
        });
    }
    catch (error) {
        logger_1.logger.error('Logout error:', error);
        res.status(500).json({
            error: 'Logout failed',
            message: error.message,
        });
    }
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
    });
});
// Error handler
app.use((err, req, res, next) => {
    logger_1.logger.error(err);
    res.status(err.status || 500).json({
        error: err.name || 'Internal Server Error',
        message: err.message,
    });
});
// Start server
app.listen(PORT, () => {
    logger_1.logger.info(`🚀 Test Server running on http://localhost:${PORT}`);
    logger_1.logger.info(`📝 API Documentation: http://localhost:${PORT}/api/docs`);
    logger_1.logger.info(`🏥 Health Check: http://localhost:${PORT}/api/health`);
    logger_1.logger.info(`📊 Mode: In-Memory (Testing)`);
});
exports.default = app;
//# sourceMappingURL=index-test.js.map