/**
 * Advanced Security Features for Lapaas OS
 * - CSRF Protection
 * - Two-Factor Authentication (2FA)
 * - Security Monitoring & Audit Logging
 * - Session Management
 */

const crypto = require('crypto');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

// ==================== CSRF PROTECTION ====================

/**
 * CSRF Token Store (in production, use Redis)
 */
const csrfTokenStore = new Map();

/**
 * Generate CSRF token
 */
const generateCSRFToken = (sessionId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = Date.now() + (60 * 60 * 1000); // 1 hour
  
  csrfTokenStore.set(token, {
    sessionId,
    expiry,
    used: false,
  });
  
  // Clean up expired tokens periodically
  cleanupExpiredCSRFTokens();
  
  return token;
};

/**
 * Validate CSRF token
 */
const validateCSRFToken = (token, sessionId) => {
  const tokenData = csrfTokenStore.get(token);
  
  if (!tokenData) {
    return { valid: false, reason: 'Token not found' };
  }
  
  if (tokenData.expiry < Date.now()) {
    csrfTokenStore.delete(token);
    return { valid: false, reason: 'Token expired' };
  }
  
  if (tokenData.sessionId !== sessionId) {
    return { valid: false, reason: 'Session mismatch' };
  }
  
  if (tokenData.used) {
    return { valid: false, reason: 'Token already used' };
  }
  
  // Mark as used (single-use tokens)
  tokenData.used = true;
  
  return { valid: true };
};

/**
 * Clean up expired CSRF tokens
 */
const cleanupExpiredCSRFTokens = () => {
  const now = Date.now();
  for (const [token, data] of csrfTokenStore.entries()) {
    if (data.expiry < now) {
      csrfTokenStore.delete(token);
    }
  }
};

/**
 * CSRF middleware - generates token for GET requests, validates for mutations
 */
const csrfProtection = (req, res, next) => {
  // Skip CSRF for API routes that use JWT (stateless)
  if (req.headers.authorization) {
    return next();
  }
  
  const sessionId = req.cookies?.sessionId || req.headers['x-session-id'];
  
  // For GET requests, generate and attach token
  if (req.method === 'GET') {
    const token = generateCSRFToken(sessionId || 'anonymous');
    res.locals.csrfToken = token;
    res.cookie('XSRF-TOKEN', token, {
      httpOnly: false, // Needs to be readable by JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    return next();
  }
  
  // For mutation requests (POST, PUT, DELETE, PATCH), validate token
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    const token = req.headers['x-csrf-token'] || req.body?._csrf || req.cookies?.['XSRF-TOKEN'];
    
    if (!token) {
      return res.status(403).json({
        error: 'CSRF Error',
        message: 'CSRF token missing',
      });
    }
    
    const validation = validateCSRFToken(token, sessionId || 'anonymous');
    
    if (!validation.valid) {
      securityLogger.warn('CSRF validation failed', {
        reason: validation.reason,
        ip: req.ip,
        path: req.path,
        method: req.method,
      });
      
      return res.status(403).json({
        error: 'CSRF Error',
        message: 'Invalid CSRF token',
      });
    }
  }
  
  next();
};

// ==================== TWO-FACTOR AUTHENTICATION ====================

/**
 * 2FA Configuration
 */
const TFA_CONFIG = {
  issuer: 'Lapaas OS',
  algorithm: 'sha1',
  digits: 6,
  period: 30,
  window: 1, // Allow 1 period before/after for clock drift
};

/**
 * Generate 2FA secret for a user
 */
const generate2FASecret = (userEmail) => {
  const secret = speakeasy.generateSecret({
    name: `${TFA_CONFIG.issuer}:${userEmail}`,
    issuer: TFA_CONFIG.issuer,
    length: 32,
  });
  
  return {
    secret: secret.base32,
    otpauth_url: secret.otpauth_url,
  };
};

/**
 * Generate QR code for 2FA setup
 */
const generate2FAQRCode = async (otpauthUrl) => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Verify 2FA token
 */
const verify2FAToken = (secret, token) => {
  return speakeasy.totp.verify({
    secret: secret,
    encoding: 'base32',
    token: token,
    algorithm: TFA_CONFIG.algorithm,
    digits: TFA_CONFIG.digits,
    step: TFA_CONFIG.period,
    window: TFA_CONFIG.window,
  });
};

/**
 * Generate backup codes for 2FA recovery
 */
const generateBackupCodes = (count = 10) => {
  const codes = [];
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
};

/**
 * Hash backup code for storage
 */
const hashBackupCode = (code) => {
  return crypto.createHash('sha256').update(code).digest('hex');
};

/**
 * 2FA middleware - requires 2FA for protected routes
 */
const require2FA = (req, res, next) => {
  // Check if user has 2FA enabled
  if (!req.user?.twoFactorEnabled) {
    return next();
  }
  
  // Check if 2FA was verified in this session
  if (req.user?.twoFactorVerified) {
    return next();
  }
  
  // Check for 2FA token in request
  const tfaToken = req.headers['x-2fa-token'] || req.body?.twoFactorToken;
  
  if (!tfaToken) {
    return res.status(403).json({
      error: '2FA Required',
      message: 'Two-factor authentication token required',
      code: '2FA_REQUIRED',
    });
  }
  
  // Verify the token (would need user's secret from database)
  // This is a placeholder - actual implementation needs DB lookup
  
  next();
};

// ==================== SECURITY MONITORING & AUDIT LOGGING ====================

/**
 * Create logs directory if it doesn't exist
 */
const logsDir = path.join(__dirname, 'logs');
const fs = require('fs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

/**
 * Security Logger Configuration
 */
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'lapaas-security' },
  transports: [
    // Security events log (rotated daily)
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDir, 'security-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'info',
    }),
    // Error log
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDir, 'security-error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
      level: 'error',
    }),
    // Console output in development
    ...(process.env.NODE_ENV !== 'production' ? [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
    ] : []),
  ],
});

/**
 * Audit Logger for tracking all user actions
 */
const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'lapaas-audit' },
  transports: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logsDir, 'audit-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '50m',
      maxFiles: '90d', // Keep audit logs for 90 days
    }),
  ],
});

/**
 * Security event types
 */
const SecurityEventTypes = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  PASSWORD_CHANGE: 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_COMPLETE: 'PASSWORD_RESET_COMPLETE',
  TWO_FACTOR_ENABLED: 'TWO_FACTOR_ENABLED',
  TWO_FACTOR_DISABLED: 'TWO_FACTOR_DISABLED',
  TWO_FACTOR_FAILURE: 'TWO_FACTOR_FAILURE',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED: 'ACCOUNT_UNLOCKED',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  API_KEY_CREATED: 'API_KEY_CREATED',
  API_KEY_REVOKED: 'API_KEY_REVOKED',
  SESSION_CREATED: 'SESSION_CREATED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  CSRF_FAILURE: 'CSRF_FAILURE',
  SQL_INJECTION_ATTEMPT: 'SQL_INJECTION_ATTEMPT',
  XSS_ATTEMPT: 'XSS_ATTEMPT',
};

/**
 * Log security event
 */
const logSecurityEvent = (eventType, data) => {
  const event = {
    eventType,
    timestamp: new Date().toISOString(),
    ...data,
  };
  
  // Determine log level based on event type
  const errorEvents = [
    SecurityEventTypes.LOGIN_FAILURE,
    SecurityEventTypes.TWO_FACTOR_FAILURE,
    SecurityEventTypes.PERMISSION_DENIED,
    SecurityEventTypes.RATE_LIMIT_EXCEEDED,
    SecurityEventTypes.SUSPICIOUS_ACTIVITY,
    SecurityEventTypes.CSRF_FAILURE,
    SecurityEventTypes.SQL_INJECTION_ATTEMPT,
    SecurityEventTypes.XSS_ATTEMPT,
  ];
  
  if (errorEvents.includes(eventType)) {
    securityLogger.warn(eventType, event);
  } else {
    securityLogger.info(eventType, event);
  }
  
  return event;
};

/**
 * Log audit event (user actions)
 */
const logAuditEvent = (action, data) => {
  const event = {
    action,
    timestamp: new Date().toISOString(),
    ...data,
  };
  
  auditLogger.info(action, event);
  
  return event;
};

/**
 * Security monitoring middleware
 */
const securityMonitor = (req, res, next) => {
  const startTime = Date.now();
  
  // Capture original end function
  const originalEnd = res.end;
  
  res.end = function(...args) {
    const duration = Date.now() - startTime;
    
    // Log audit event for all requests
    logAuditEvent('API_REQUEST', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: req.user?.id || 'anonymous',
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    });
    
    // Log security events for specific status codes
    if (res.statusCode === 401) {
      logSecurityEvent(SecurityEventTypes.PERMISSION_DENIED, {
        path: req.path,
        method: req.method,
        ip: req.ip,
        userId: req.user?.id,
      });
    }
    
    if (res.statusCode === 429) {
      logSecurityEvent(SecurityEventTypes.RATE_LIMIT_EXCEEDED, {
        path: req.path,
        method: req.method,
        ip: req.ip,
      });
    }
    
    originalEnd.apply(res, args);
  };
  
  next();
};

// ==================== SESSION MANAGEMENT ====================

/**
 * Session store (in production, use Redis)
 */
const sessionStore = new Map();

/**
 * Create session
 */
const createSession = (userId, metadata = {}) => {
  const sessionId = crypto.randomBytes(32).toString('hex');
  const session = {
    id: sessionId,
    userId,
    createdAt: new Date().toISOString(),
    lastActivity: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    ip: metadata.ip,
    userAgent: metadata.userAgent,
    twoFactorVerified: false,
  };
  
  sessionStore.set(sessionId, session);
  
  logSecurityEvent(SecurityEventTypes.SESSION_CREATED, {
    sessionId,
    userId,
    ip: metadata.ip,
  });
  
  return session;
};

/**
 * Get session
 */
const getSession = (sessionId) => {
  const session = sessionStore.get(sessionId);
  
  if (!session) {
    return null;
  }
  
  // Check if expired
  if (new Date(session.expiresAt) < new Date()) {
    sessionStore.delete(sessionId);
    logSecurityEvent(SecurityEventTypes.SESSION_EXPIRED, {
      sessionId,
      userId: session.userId,
    });
    return null;
  }
  
  // Update last activity
  session.lastActivity = new Date().toISOString();
  
  return session;
};

/**
 * Destroy session
 */
const destroySession = (sessionId) => {
  const session = sessionStore.get(sessionId);
  if (session) {
    sessionStore.delete(sessionId);
    logSecurityEvent(SecurityEventTypes.LOGOUT, {
      sessionId,
      userId: session.userId,
    });
  }
};

/**
 * Get all sessions for a user
 */
const getUserSessions = (userId) => {
  const sessions = [];
  for (const [id, session] of sessionStore.entries()) {
    if (session.userId === userId) {
      sessions.push({
        id,
        createdAt: session.createdAt,
        lastActivity: session.lastActivity,
        ip: session.ip,
        userAgent: session.userAgent,
      });
    }
  }
  return sessions;
};

/**
 * Revoke all sessions for a user (except current)
 */
const revokeAllUserSessions = (userId, exceptSessionId = null) => {
  const revokedCount = [];
  for (const [id, session] of sessionStore.entries()) {
    if (session.userId === userId && id !== exceptSessionId) {
      sessionStore.delete(id);
      revokedCount.push(id);
    }
  }
  return revokedCount;
};

// ==================== ACCOUNT LOCKOUT ====================

/**
 * Failed login attempts store
 */
const failedLoginAttempts = new Map();

/**
 * Account lockout configuration
 */
const LOCKOUT_CONFIG = {
  maxAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  attemptWindow: 15 * 60 * 1000, // 15 minutes
};

/**
 * Record failed login attempt
 */
const recordFailedLogin = (identifier) => {
  const now = Date.now();
  let attempts = failedLoginAttempts.get(identifier) || { count: 0, firstAttempt: now, lockedUntil: null };
  
  // Reset if outside attempt window
  if (now - attempts.firstAttempt > LOCKOUT_CONFIG.attemptWindow) {
    attempts = { count: 0, firstAttempt: now, lockedUntil: null };
  }
  
  attempts.count++;
  attempts.lastAttempt = now;
  
  // Lock account if max attempts exceeded
  if (attempts.count >= LOCKOUT_CONFIG.maxAttempts) {
    attempts.lockedUntil = now + LOCKOUT_CONFIG.lockoutDuration;
    logSecurityEvent(SecurityEventTypes.ACCOUNT_LOCKED, {
      identifier,
      attempts: attempts.count,
      lockedUntil: new Date(attempts.lockedUntil).toISOString(),
    });
  }
  
  failedLoginAttempts.set(identifier, attempts);
  
  return attempts;
};

/**
 * Check if account is locked
 */
const isAccountLocked = (identifier) => {
  const attempts = failedLoginAttempts.get(identifier);
  
  if (!attempts || !attempts.lockedUntil) {
    return { locked: false };
  }
  
  if (Date.now() > attempts.lockedUntil) {
    // Lockout expired, reset
    failedLoginAttempts.delete(identifier);
    return { locked: false };
  }
  
  return {
    locked: true,
    remainingTime: Math.ceil((attempts.lockedUntil - Date.now()) / 1000),
    lockedUntil: new Date(attempts.lockedUntil).toISOString(),
  };
};

/**
 * Clear failed login attempts (on successful login)
 */
const clearFailedLogins = (identifier) => {
  failedLoginAttempts.delete(identifier);
};

// ==================== IP BLOCKING ====================

/**
 * Blocked IPs store
 */
const blockedIPs = new Map();

/**
 * Block an IP address
 */
const blockIP = (ip, reason, duration = 24 * 60 * 60 * 1000) => {
  blockedIPs.set(ip, {
    blockedAt: Date.now(),
    expiresAt: Date.now() + duration,
    reason,
  });
  
  logSecurityEvent(SecurityEventTypes.SUSPICIOUS_ACTIVITY, {
    action: 'IP_BLOCKED',
    ip,
    reason,
    duration,
  });
};

/**
 * Check if IP is blocked
 */
const isIPBlocked = (ip) => {
  const block = blockedIPs.get(ip);
  
  if (!block) {
    return { blocked: false };
  }
  
  if (Date.now() > block.expiresAt) {
    blockedIPs.delete(ip);
    return { blocked: false };
  }
  
  return {
    blocked: true,
    reason: block.reason,
    expiresAt: new Date(block.expiresAt).toISOString(),
  };
};

/**
 * IP blocking middleware
 */
const ipBlockingMiddleware = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const blockStatus = isIPBlocked(ip);
  
  if (blockStatus.blocked) {
    return res.status(403).json({
      error: 'Access Denied',
      message: 'Your IP address has been blocked',
      reason: blockStatus.reason,
      expiresAt: blockStatus.expiresAt,
    });
  }
  
  next();
};

// ==================== EXPORTS ====================

module.exports = {
  // CSRF
  csrfProtection,
  generateCSRFToken,
  validateCSRFToken,
  
  // 2FA
  generate2FASecret,
  generate2FAQRCode,
  verify2FAToken,
  generateBackupCodes,
  hashBackupCode,
  require2FA,
  TFA_CONFIG,
  
  // Security Logging
  securityLogger,
  auditLogger,
  logSecurityEvent,
  logAuditEvent,
  securityMonitor,
  SecurityEventTypes,
  
  // Session Management
  createSession,
  getSession,
  destroySession,
  getUserSessions,
  revokeAllUserSessions,
  
  // Account Lockout
  recordFailedLogin,
  isAccountLocked,
  clearFailedLogins,
  LOCKOUT_CONFIG,
  
  // IP Blocking
  blockIP,
  isIPBlocked,
  ipBlockingMiddleware,
};
