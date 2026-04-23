import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query } from '@config/database';
import { logger } from '@config/logger';

interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export class AuthService {
  private jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  private jwtExpiry = process.env.JWT_EXPIRY || '15m';
  private refreshExpiry = process.env.JWT_REFRESH_EXPIRY || '7d';

  /**
   * Register a new user
   */
  async register(payload: RegisterPayload) {
    try {
      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = $1',
        [payload.email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('Email already registered');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(
        payload.password,
        parseInt(process.env.BCRYPT_ROUNDS || '12')
      );

      // Create user
      const userId = uuidv4();
      const result = await query(
        `INSERT INTO users (id, email, password_hash, first_name, last_name, email_verified)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id, email, first_name, last_name, created_at`,
        [userId, payload.email, hashedPassword, payload.firstName, payload.lastName, false]
      );

      logger.info(`User registered: ${payload.email}`);

      return {
        id: result.rows[0].id,
        email: result.rows[0].email,
        firstName: result.rows[0].first_name,
        lastName: result.rows[0].last_name,
        createdAt: result.rows[0].created_at,
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user with email and password
   */
  async login(payload: LoginPayload): Promise<AuthTokens & { user: any }> {
    try {
      // Find user
      const result = await query(
        'SELECT id, email, password_hash, first_name, last_name FROM users WHERE email = $1',
        [payload.email]
      );

      if (result.rows.length === 0) {
        throw new Error('Invalid credentials');
      }

      const user = result.rows[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(payload.password, user.password_hash);

      if (!isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      // Generate tokens
      const tokens = this.generateTokens(user.id, user.email);

      // Store session
      await this.createSession(user.id, tokens.refreshToken);

      // Update last login
      await query(
        'UPDATE users SET last_login_at = NOW() WHERE id = $1',
        [user.id]
      );

      logger.info(`User logged in: ${payload.email}`);

      return {
        ...tokens,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
        },
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Generate JWT tokens
   */
  private generateTokens(userId: string, email: string): AuthTokens {
    const accessToken = jwt.sign(
      {
        sub: userId,
        email,
        type: 'access',
      },
      this.jwtSecret,
      { expiresIn: this.jwtExpiry }
    );

    const refreshToken = jwt.sign(
      {
        sub: userId,
        type: 'refresh',
      },
      this.jwtSecret,
      { expiresIn: this.refreshExpiry }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  /**
   * Create user session
   */
  private async createSession(userId: string, refreshToken: string) {
    const sessionId = uuidv4();
    const tokenHash = await bcrypt.hash(refreshToken, 10);

    await query(
      `INSERT INTO user_sessions (id, user_id, refresh_token_hash, expires_at)
       VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`,
      [sessionId, userId, tokenHash]
    );
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string) {
    try {
      const decoded = jwt.verify(token, this.jwtSecret);
      return decoded;
    } catch (error) {
      logger.error('Token verification error:', error);
      throw new Error('Invalid token');
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const decoded = this.verifyToken(refreshToken);

      if ((decoded as any).type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      // Get user
      const result = await query(
        'SELECT id, email FROM users WHERE id = $1',
        [(decoded as any).sub]
      );

      if (result.rows.length === 0) {
        throw new Error('User not found');
      }

      const user = result.rows[0];
      return this.generateTokens(user.id, user.email);
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(userId: string) {
    try {
      await query(
        'DELETE FROM user_sessions WHERE user_id = $1',
        [userId]
      );

      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
