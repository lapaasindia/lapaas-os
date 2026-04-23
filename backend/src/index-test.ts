import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pinoHttp from 'pino-http';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@config/logger';

// Load environment variables
dotenv.config({ path: '.env.local' });

// In-memory database for testing
const users: any[] = [];
const sessions: any[] = [];

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// Auth Middleware
const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
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
    const decoded = jwt.verify(token, JWT_SECRET);

    (req as any).user = {
      id: (decoded as any).sub,
      email: (decoded as any).email,
    };

    next();
  } catch (error: any) {
    res.status(401).json({
      error: 'Unauthorized',
      message: error.message,
    });
  }
};

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'in-memory',
  });
});

// API version endpoint
app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    version: '1.0.0',
    name: 'Lapaas OS API',
    environment: process.env.NODE_ENV,
    mode: 'test-mode-in-memory',
  });
});

// Register endpoint
app.post('/api/v1/auth/register', async (req: Request, res: Response) => {
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
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const userId = uuidv4();
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

    logger.info(`User registered: ${email}`);

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
  } catch (error: any) {
    logger.error('Register error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message,
    });
  }
});

// Login endpoint
app.post('/api/v1/auth/login', async (req: Request, res: Response) => {
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
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Generate tokens
    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'access',
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = jwt.sign(
      {
        sub: user.id,
        type: 'refresh',
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Store session
    sessions.push({
      id: uuidv4(),
      user_id: user.id,
      refresh_token_hash: refreshToken,
      created_at: new Date().toISOString(),
    });

    logger.info(`User logged in: ${email}`);

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
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message,
    });
  }
});

// Refresh token endpoint
app.post('/api/v1/auth/refresh', (req: Request, res: Response) => {
  try {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token required',
      });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET);

    if ((decoded as any).type !== 'refresh') {
      return res.status(401).json({
        error: 'Invalid refresh token',
      });
    }

    const user = users.find((u) => u.id === (decoded as any).sub);

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
      });
    }

    const newAccessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'access',
      },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken: newAccessToken,
        expiresIn: 900,
      },
    });
  } catch (error: any) {
    logger.error('Refresh error:', error);
    res.status(401).json({
      error: 'Token refresh failed',
      message: error.message,
    });
  }
});

// Get current user endpoint
app.get('/api/v1/auth/me', authMiddleware, (req: Request, res: Response) => {
  try {
    const user = (req as any).user;

    if (!user) {
      return res.status(401).json({
        error: 'Unauthorized',
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
});

// Logout endpoint
app.post('/api/v1/auth/logout', authMiddleware, (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    logger.info(`User logged out: ${userId}`);

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
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message,
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Test Server running on http://localhost:${PORT}`);
  logger.info(`📝 API Documentation: http://localhost:${PORT}/api/docs`);
  logger.info(`🏥 Health Check: http://localhost:${PORT}/api/health`);
  logger.info(`📊 Mode: In-Memory (Testing)`);
});

export default app;
