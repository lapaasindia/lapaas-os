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
const logger_1 = require("@config/logger");
// Load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, pino_http_1.default)({ logger: logger_1.logger }));
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// API version endpoint
app.get('/api/v1', (req, res) => {
    res.json({
        version: '1.0.0',
        name: 'Lapaas OS API',
        environment: process.env.NODE_ENV,
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
        timestamp: new Date().toISOString(),
    });
});
// Error handler
app.use((err, req, res, next) => {
    logger_1.logger.error(err);
    res.status(err.status || 500).json({
        error: err.name || 'Internal Server Error',
        message: err.message,
        timestamp: new Date().toISOString(),
    });
});
// Start server
app.listen(PORT, () => {
    logger_1.logger.info(`🚀 Server running on http://localhost:${PORT}`);
    logger_1.logger.info(`📝 API Documentation: http://localhost:${PORT}/api/docs`);
    logger_1.logger.info(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});
exports.default = app;
//# sourceMappingURL=index.js.map