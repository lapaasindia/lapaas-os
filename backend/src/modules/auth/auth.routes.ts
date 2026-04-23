import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from './auth.controller';
import { authMiddleware } from '@middleware/auth.middleware';

const router = Router();

/**
 * POST /api/v1/auth/register
 * Register a new user
 */
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain uppercase, lowercase, number, and special character'),
    body('firstName').trim().notEmpty().withMessage('First name is required'),
    body('lastName').trim().notEmpty().withMessage('Last name is required'),
  ],
  authController.register.bind(authController)
);

/**
 * POST /api/v1/auth/login
 * Login user
 */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.login.bind(authController)
);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token
 */
router.post('/refresh', authController.refresh.bind(authController));

/**
 * POST /api/v1/auth/logout
 * Logout user
 */
router.post('/logout', authMiddleware, authController.logout.bind(authController));

/**
 * GET /api/v1/auth/me
 * Get current user
 */
router.get('/me', authMiddleware, authController.getCurrentUser.bind(authController));

export default router;
