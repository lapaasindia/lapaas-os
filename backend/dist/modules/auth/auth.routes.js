"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("@middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post('/register', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain uppercase, lowercase, number, and special character'),
    (0, express_validator_1.body)('firstName').trim().notEmpty().withMessage('First name is required'),
    (0, express_validator_1.body)('lastName').trim().notEmpty().withMessage('Last name is required'),
], auth_controller_1.authController.register.bind(auth_controller_1.authController));
/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post('/login', [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
], auth_controller_1.authController.login.bind(auth_controller_1.authController));
/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post('/refresh', auth_controller_1.authController.refresh.bind(auth_controller_1.authController));
/**
 * POST /api/v1/auth/logout
 * Logout user
 */
router.post('/logout', auth_middleware_1.authMiddleware, auth_controller_1.authController.logout.bind(auth_controller_1.authController));
/**
 * GET /api/v1/auth/me
 * Get current user
 */
router.get('/me', auth_middleware_1.authMiddleware, auth_controller_1.authController.getCurrentUser.bind(auth_controller_1.authController));
exports.default = router;
//# sourceMappingURL=auth.routes.js.map