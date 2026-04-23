"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const logger_1 = require("@config/logger");
const authMiddleware = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No token provided',
                code: 'NO_TOKEN',
            });
        }
        const token = authHeader.substring(7);
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        // Attach user to request
        req.user = {
            id: decoded.sub,
            email: decoded.email,
        };
        next();
    }
    catch (error) {
        logger_1.logger.error('Auth middleware error:', error);
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                error: 'Token expired',
                code: 'TOKEN_EXPIRED',
            });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                error: 'Invalid token',
                code: 'INVALID_TOKEN',
            });
        }
        res.status(401).json({
            error: 'Unauthorized',
            message: error.message,
        });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map