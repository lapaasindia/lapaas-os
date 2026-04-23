/**
 * Security Middleware for Lapaas OS
 * Implements rate limiting, input validation, and security headers
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { v4: uuidv4, validate: uuidValidate } = require('uuid');

// ==================== RATE LIMITING ====================

/**
 * General API rate limiter
 * 1000 requests per 15 minutes per IP (increased for development)
 */
const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // Higher limit for development
  message: {
    error: 'Too many requests',
    message: 'You have exceeded the rate limit. Please try again later.',
    retryAfter: 15 * 60, // seconds
  },
  standardHeaders: true, validate: { xForwardedForHeader: false, default: false }, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    console.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

/**
 * Strict rate limiter for authentication endpoints
 * 50 requests per 15 minutes per IP (increased for development)
 */
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 5 : 50, // Higher limit for development
  message: {
    error: 'Too many authentication attempts',
    message: 'Too many login attempts. Please try again after 15 minutes.',
    retryAfter: 15 * 60,
  },
  standardHeaders: true, validate: { xForwardedForHeader: false, default: false },
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  handler: (req, res, next, options) => {
    console.warn(`Auth rate limit exceeded for IP: ${req.ip}, email: ${req.body?.email}`);
    res.status(429).json(options.message);
  },
});

/**
 * Password reset rate limiter
 * 3 requests per hour per IP
 */
const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per hour
  message: {
    error: 'Too many password reset requests',
    message: 'Too many password reset attempts. Please try again after 1 hour.',
    retryAfter: 60 * 60,
  },
  standardHeaders: true, validate: { xForwardedForHeader: false, default: false },
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    console.warn(`Password reset rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json(options.message);
  },
});

/**
 * API key rate limiter (for future API key auth)
 * 1000 requests per hour per API key
 */
const apiKeyRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000,
  keyGenerator: (req) => req.headers['x-api-key'] || req.ip,
  message: {
    error: 'API rate limit exceeded',
    message: 'You have exceeded the API rate limit.',
    retryAfter: 60 * 60,
  },
  standardHeaders: true, validate: { xForwardedForHeader: false, default: false },
  legacyHeaders: false,
});

// ==================== INPUT VALIDATION ====================

/**
 * Sanitize string input - remove potentially dangerous characters
 */
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  
  // Remove null bytes
  str = str.replace(/\0/g, '');
  
  // Trim whitespace
  str = str.trim();
  
  // Limit length to prevent DoS
  if (str.length > 10000) {
    str = str.substring(0, 10000);
  }
  
  return str;
};

/**
 * Sanitize object recursively
 */
const sanitizeObject = (obj) => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (typeof obj === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      // Sanitize key names too
      const sanitizedKey = sanitizeString(key);
      sanitized[sanitizedKey] = sanitizeObject(value);
    }
    return sanitized;
  }
  
  return obj;
};

/**
 * Input sanitization middleware
 */
const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query params
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize params
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

/**
 * Validate email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
const isStrongPassword = (password) => {
  if (!password || password.length < 8) return false;
  
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  return hasUppercase && hasLowercase && hasNumber;
};

/**
 * Validate UUID format
 */
const isValidUUID = (id) => {
  return uuidValidate(id);
};

/**
 * Validate request body against schema
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];
      
      // Required check
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        continue;
      }
      
      // Skip further validation if field is optional and not provided
      if (!rules.required && (value === undefined || value === null)) {
        continue;
      }
      
      // Type check
      if (rules.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rules.type) {
          errors.push(`${field} must be of type ${rules.type}`);
        }
      }
      
      // Email validation
      if (rules.email && !isValidEmail(value)) {
        errors.push(`${field} must be a valid email address`);
      }
      
      // Password validation
      if (rules.password && !isStrongPassword(value)) {
        errors.push(`${field} must be at least 8 characters with uppercase, lowercase, and number`);
      }
      
      // UUID validation
      if (rules.uuid && !isValidUUID(value)) {
        errors.push(`${field} must be a valid UUID`);
      }
      
      // Min length
      if (rules.minLength && value.length < rules.minLength) {
        errors.push(`${field} must be at least ${rules.minLength} characters`);
      }
      
      // Max length
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`${field} must be at most ${rules.maxLength} characters`);
      }
      
      // Enum validation
      if (rules.enum && !rules.enum.includes(value)) {
        errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
      }
      
      // Custom validation
      if (rules.custom && typeof rules.custom === 'function') {
        const customError = rules.custom(value);
        if (customError) {
          errors.push(customError);
        }
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Request validation failed',
        details: errors,
      });
    }
    
    next();
  };
};

// ==================== SECURITY HEADERS ====================

/**
 * Enhanced security headers configuration
 */
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Adjust for your needs
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:*", "https://api.lapaas.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false, // May need to disable for some integrations
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-site" },
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" },
  hidePoweredBy: true,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: { permittedPolicies: "none" },
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  xssFilter: true,
});

// ==================== CORS CONFIGURATION ====================

/**
 * Secure CORS configuration
 */
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) {
      return callback(null, true);
    }
    
    // Allowed origins
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:3000',
      // Add production domains here
      // 'https://app.lapaas.com',
      // 'https://lapaas.com',
    ];
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow Electron app
    if (origin.startsWith('file://')) {
      return callback(null, true);
    }
    
    // Log rejected origins for debugging
    console.warn(`CORS blocked origin: ${origin}`);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-API-Key'],
  exposedHeaders: ['RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
  maxAge: 86400, // 24 hours
};

// ==================== REQUEST LOGGING ====================

/**
 * Security audit logging middleware
 */
const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || 'anonymous',
  };
  
  // Log response on finish
  res.on('finish', () => {
    logData.statusCode = res.statusCode;
    logData.duration = Date.now() - startTime;
    
    // Log security-relevant events
    if (res.statusCode === 401 || res.statusCode === 403) {
      console.warn('Security Event:', JSON.stringify(logData));
    } else if (req.path.includes('/auth/')) {
      console.log('Auth Event:', JSON.stringify(logData));
    }
  });
  
  next();
};

// ==================== ERROR HANDLING ====================

/**
 * Secure error handler - don't expose internal errors
 */
const secureErrorHandler = (err, req, res, next) => {
  // Log the full error internally
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userId: req.user?.id,
  });
  
  // Don't expose internal error details to client
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
    });
  }
  
  if (err.name === 'UnauthorizedError' || err.message === 'jwt expired') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or expired token',
    });
  }
  
  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Cross-origin request blocked',
    });
  }
  
  // Generic error response
  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: isProduction ? 'An unexpected error occurred' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

// ==================== SQL INJECTION PREVENTION ====================

/**
 * Check for SQL injection patterns
 */
const hasSQLInjection = (str) => {
  if (typeof str !== 'string') return false;
  
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|UNION|DECLARE)\b)/i,
    /(--|#|\/\*|\*\/)/,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/i,
    /('|")\s*(OR|AND)\s*('|")/i,
    /(;|\||`)/,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(str));
};

/**
 * SQL injection prevention middleware
 */
const preventSQLInjection = (req, res, next) => {
  const checkObject = (obj, path = '') => {
    if (typeof obj === 'string' && hasSQLInjection(obj)) {
      return path || 'input';
    }
    
    if (typeof obj === 'object' && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        const result = checkObject(value, path ? `${path}.${key}` : key);
        if (result) return result;
      }
    }
    
    return null;
  };
  
  const bodyInjection = checkObject(req.body);
  const queryInjection = checkObject(req.query);
  const paramsInjection = checkObject(req.params);
  
  if (bodyInjection || queryInjection || paramsInjection) {
    console.warn('SQL Injection attempt detected:', {
      ip: req.ip,
      path: req.path,
      field: bodyInjection || queryInjection || paramsInjection,
    });
    
    return res.status(400).json({
      error: 'Invalid Input',
      message: 'Request contains invalid characters',
    });
  }
  
  next();
};

// ==================== VALIDATION SCHEMAS ====================

const validationSchemas = {
  register: {
    email: { required: true, type: 'string', email: true },
    password: { required: true, type: 'string', password: true },
    firstName: { required: true, type: 'string', minLength: 1, maxLength: 50 },
    lastName: { required: true, type: 'string', minLength: 1, maxLength: 50 },
  },
  login: {
    email: { required: true, type: 'string', email: true },
    password: { required: true, type: 'string', minLength: 1 },
  },
  createTask: {
    title: { required: true, type: 'string', minLength: 1, maxLength: 200 },
    priority: { required: false, type: 'string', enum: ['P1', 'P2', 'P3', 'P4'] },
    status: { required: false, type: 'string', enum: ['pending', 'in_progress', 'done', 'blocked'] },
  },
  createMeeting: {
    title: { required: true, type: 'string', minLength: 1, maxLength: 200 },
    start_at: { required: true, type: 'string' },
    end_at: { required: true, type: 'string' },
  },
  createRequest: {
    description: { required: true, type: 'string', minLength: 1, maxLength: 1000 },
    urgency: { required: true, type: 'string', enum: ['P1', 'P2', 'P3', 'P4'] },
    category: { required: false, type: 'string', maxLength: 50 },
  },
};

// ==================== EXPORTS ====================

module.exports = {
  // Rate limiters
  generalRateLimiter,
  authRateLimiter,
  passwordResetRateLimiter,
  apiKeyRateLimiter,
  
  // Input validation
  sanitizeInput,
  validateBody,
  isValidEmail,
  isStrongPassword,
  isValidUUID,
  validationSchemas,
  
  // Security headers
  securityHeaders,
  
  // CORS
  corsOptions,
  
  // Logging
  securityLogger,
  
  // Error handling
  secureErrorHandler,
  
  // SQL injection prevention
  preventSQLInjection,
};
