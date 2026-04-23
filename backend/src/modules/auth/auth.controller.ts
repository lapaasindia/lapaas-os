import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { authService } from './auth.service';
import { logger } from '@config/logger';

export class AuthController {
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, firstName, lastName } = req.body;

      // Register user
      const user = await authService.register({
        email,
        password,
        firstName,
        lastName,
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: user,
      });
    } catch (error: any) {
      logger.error('Register error:', error);

      if (error.message === 'Email already registered') {
        return res.status(400).json({
          error: 'Email already registered',
          code: 'EMAIL_EXISTS',
        });
      }

      res.status(500).json({
        error: 'Registration failed',
        message: error.message,
      });
    }
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response) {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Login user
      const result = await authService.login({ email, password });

      // Set refresh token as httpOnly cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          accessToken: result.accessToken,
          expiresIn: result.expiresIn,
          user: result.user,
        },
      });
    } catch (error: any) {
      logger.error('Login error:', error);

      if (error.message === 'Invalid credentials') {
        return res.status(401).json({
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS',
        });
      }

      res.status(500).json({
        error: 'Login failed',
        message: error.message,
      });
    }
  }

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  async refresh(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          error: 'Refresh token required',
          code: 'REFRESH_TOKEN_REQUIRED',
        });
      }

      // Refresh token
      const tokens = await authService.refreshAccessToken(refreshToken);

      // Set new refresh token as httpOnly cookie
      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      res.json({
        success: true,
        message: 'Token refreshed',
        data: {
          accessToken: tokens.accessToken,
          expiresIn: tokens.expiresIn,
        },
      });
    } catch (error: any) {
      logger.error('Refresh error:', error);

      res.status(401).json({
        error: 'Token refresh failed',
        message: error.message,
      });
    }
  }

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  async logout(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      // Logout user
      await authService.logout(userId);

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error: any) {
      logger.error('Logout error:', error);

      res.status(500).json({
        error: 'Logout failed',
        message: error.message,
      });
    }
  }

  /**
   * Get current user
   * GET /api/v1/auth/me
   */
  async getCurrentUser(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          code: 'UNAUTHORIZED',
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      logger.error('Get current user error:', error);

      res.status(500).json({
        error: 'Failed to get current user',
        message: error.message,
      });
    }
  }
}

export const authController = new AuthController();
