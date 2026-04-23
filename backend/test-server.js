// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { sendTeamInvitation, sendPasswordResetEmail, generateRandomPassword } = require('./email-service');

// Security middleware
const {
  generalRateLimiter,
  authRateLimiter,
  passwordResetRateLimiter,
  sanitizeInput,
  validateBody,
  validationSchemas,
  corsOptions,
  securityLogger,
  secureErrorHandler,
  preventSQLInjection,
} = require('./security-middleware');
const adminRoutes = require('./admin-routes');
const adminPlansRoutes = require('./admin-plans-routes');
const collectionsUserRoutes = require('./collections-user-routes');
const financeRoutes = require('./finance-routes');
const financePhase2Routes = require('./finance-phase2-routes');
const financePhase3Routes = require('./finance-phase3-routes');
const billingRoutes = require('./billing-routes');
const invoicingRoutes = require('./invoicing-routes');
const productsRoutes = require('./products-routes');
const customersVendorsRoutes = require('./customers-vendors-routes');
const payablesRoutes = require('./payables-routes');
const complianceRoutes = require('./compliance-routes');
const founderOSRoutes = require('./founder-os-routes');
const founderOSExtendedRoutes = require('./founder-os-extended-routes');
const calendarTasksRoutes = require('./calendar-tasks-routes');
const founderOSPhase0Routes = require('./founder-os-phase0-routes');
const founderOSCommitmentsTimeBlocksRoutes = require('./founder-os-commitments-timeblocks-routes');
const founderOSMeetingsRoutes = require('./founder-os-meetings-routes');
const founderOSFirewallRoutes = require('./founder-os-firewall-routes');
const founderOSDeepWorkGuardrailsRoutes = require('./founder-os-deepwork-guardrails-routes');
const founderOSAutoPlanHeatmapRoutes = require('./founder-os-autoplan-heatmap-routes');
const founderOSRecordingTranscriptionRoutes = require('./founder-os-recording-transcription-routes');
const founderOSStartupShutdownRoutes = require('./founder-os-startup-shutdown-routes');
const founderOSAfterActionRoutes = require('./founder-os-after-action-routes');
const meetingOSEnhancedRoutes = require('./meeting-os-enhanced-routes');
const interruptionFirewallRoutes = require('./interruption-firewall-routes');
const teamManagementRoutes = require('./team-management-routes');
const featureControlRoutes = require('./feature-control-routes');
const securityRoutes = require('./security-routes');

// Advanced security features
const {
  securityMonitor,
  logSecurityEvent,
  logAuditEvent,
  SecurityEventTypes,
  recordFailedLogin,
  isAccountLocked,
  clearFailedLogins,
  ipBlockingMiddleware,
} = require('./security-advanced');

// In-memory database (for non-critical data)
const users = [];
const sessions = [];
const organizations = [];
const teams = [];
const roles = [];
const activities = [];

// SQLite Database for persistent storage
const DB_PATH = path.join(__dirname, 'lapaas.db');
let db = null;

// Initialize database connection
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Database connection error:', err);
        reject(err);
      } else {
        console.log('✅ Database connected:', DB_PATH);
        
        // Create tables if they don't exist
        db.serialize(() => {
          // Users table with role field
          db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            firstName TEXT,
            lastName TEXT,
            phone TEXT,
            position TEXT,
            department TEXT,
            avatar TEXT,
            role TEXT DEFAULT 'member',
            orgId TEXT,
            teamId TEXT,
            isActive BOOLEAN DEFAULT 1,
            resetToken TEXT,
            resetTokenExpiry DATETIME,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          // Add missing columns to users table if they don't exist (for existing databases)
          db.run(`ALTER TABLE users ADD COLUMN phone TEXT`, () => {});
          db.run(`ALTER TABLE users ADD COLUMN position TEXT`, () => {});
          db.run(`ALTER TABLE users ADD COLUMN department TEXT`, () => {});
          db.run(`ALTER TABLE users ADD COLUMN avatar TEXT`, () => {});
          
          // 2FA columns
          db.run(`ALTER TABLE users ADD COLUMN twoFactorEnabled BOOLEAN DEFAULT 0`, () => {});
          db.run(`ALTER TABLE users ADD COLUMN twoFactorSecret TEXT`, () => {});
          db.run(`ALTER TABLE users ADD COLUMN twoFactorBackupCodes TEXT`, () => {});
          db.run(`ALTER TABLE users ADD COLUMN passwordChangedAt DATETIME`, () => {});

          // Teams table (drop and recreate to fix schema)
          db.run(`DROP TABLE IF EXISTS teams`);
          db.run(`CREATE TABLE IF NOT EXISTS teams (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            organizationId TEXT,
            leaderId TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          // Team members table
          db.run(`CREATE TABLE IF NOT EXISTS team_members (
            id TEXT PRIMARY KEY,
            teamId TEXT NOT NULL,
            userId TEXT NOT NULL,
            role TEXT DEFAULT 'Member',
            addedBy TEXT,
            addedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (teamId) REFERENCES teams(id),
            FOREIGN KEY (userId) REFERENCES users(id),
            UNIQUE(teamId, userId)
          )`);

          // Task assignments table
          db.run(`CREATE TABLE IF NOT EXISTS task_assignments (
            id TEXT PRIMARY KEY,
            task_id TEXT NOT NULL,
            assigned_to TEXT NOT NULL,
            assigned_by TEXT NOT NULL,
            due_at DATETIME,
            notes TEXT,
            status TEXT DEFAULT 'assigned',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          // Request approvals table
          db.run(`CREATE TABLE IF NOT EXISTS request_approvals (
            id TEXT PRIMARY KEY,
            request_id TEXT NOT NULL,
            escalated_by TEXT NOT NULL,
            escalated_to TEXT,
            reason TEXT,
            priority TEXT DEFAULT 'P2',
            status TEXT DEFAULT 'pending',
            resolved_by TEXT,
            resolved_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          // Notifications table
          db.run(`CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT,
            data TEXT,
            read BOOLEAN DEFAULT 0,
            read_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          // Missing tables for test report
          db.run(`CREATE TABLE IF NOT EXISTS feature_roles (
            id TEXT PRIMARY KEY,
            role_name TEXT NOT NULL,
            feature_id TEXT NOT NULL,
            can_read BOOLEAN DEFAULT 1,
            can_write BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          db.run(`CREATE TABLE IF NOT EXISTS request_sla_tracking (
            id TEXT PRIMARY KEY,
            request_id TEXT NOT NULL,
            priority TEXT DEFAULT 'standard',
            sla_deadline DATETIME,
            first_response_at DATETIME,
            resolution_at DATETIME,
            is_breached BOOLEAN DEFAULT 0,
            updated_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          db.run(`CREATE TABLE IF NOT EXISTS request_batches (
            id TEXT PRIMARY KEY,
            batch_date TEXT,
            batch_time TEXT,
            status TEXT DEFAULT 'pending',
            request_count INTEGER DEFAULT 0,
            processed_at DATETIME,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          db.run(`CREATE TABLE IF NOT EXISTS request_batch_items (
            id TEXT PRIMARY KEY,
            batch_id TEXT NOT NULL,
            request_id TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          db.run(`CREATE TABLE IF NOT EXISTS sessions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            token TEXT NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          db.run(`CREATE TABLE IF NOT EXISTS organizations (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            domain TEXT,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          db.run(`CREATE TABLE IF NOT EXISTS billing_subscriptions (
            id TEXT PRIMARY KEY,
            org_id TEXT NOT NULL,
            plan_id TEXT NOT NULL,
            status TEXT DEFAULT 'active',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          db.run(`CREATE TABLE IF NOT EXISTS invoices (
            id TEXT PRIMARY KEY,
            org_id TEXT NOT NULL,
            amount REAL NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          db.run(`CREATE TABLE IF NOT EXISTS customers (
            id TEXT PRIMARY KEY,
            org_id TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          db.run(`CREATE TABLE IF NOT EXISTS vendors (
            id TEXT PRIMARY KEY,
            org_id TEXT NOT NULL,
            name TEXT NOT NULL,
            email TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            action TEXT NOT NULL,
            resource_type TEXT,
            resource_id TEXT,
            details TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )`);

          console.log('✅ Database tables created/verified');
          resolve();
        });
      }
    });
  });
};

// Initialize default roles
const initializeRoles = () => {
  const defaultRoles = [
    { id: uuidv4(), name: 'Admin', permissions: ['create', 'read', 'update', 'delete'] },
    { id: uuidv4(), name: 'Manager', permissions: ['create', 'read', 'update'] },
    { id: uuidv4(), name: 'Member', permissions: ['read', 'update'] },
    { id: uuidv4(), name: 'Viewer', permissions: ['read'] },
  ];
  roles.push(...defaultRoles);
};

// Initialize default admin user
const initializeDefaultAdmin = async () => {
  try {
    // Check if admin user exists
    const existingAdmin = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', ['admin@lapaas.com'], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!existingAdmin) {
      // Use strong default password from env or generate secure one
      const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'LapaasAdmin@2025!Secure';
      const hashedPassword = await bcrypt.hash(defaultAdminPassword, 12);
      const adminId = 'user-001';
      
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO users (id, email, password_hash, firstName, lastName, role, orgId, teamId, isActive, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [adminId, 'admin@lapaas.com', hashedPassword, 'Admin', 'User', 'admin', 'org-001', null, 1, new Date().toISOString(), new Date().toISOString()],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      console.log('✅ Default admin user created (admin@lapaas.com)');
      console.log('⚠️  IMPORTANT: Change the default admin password immediately!');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Initialize default teams and sample users
const initializeDefaultTeamsAndUsers = async () => {
  try {
    // Check if teams exist
    const existingTeams = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM teams', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    if (existingTeams.length === 0) {
      // Create default teams
      const defaultTeams = [
        { id: 'team-001', name: 'Engineering', description: 'Software development team', organizationId: 'org-001', leaderId: 'user-001' },
        { id: 'team-002', name: 'Marketing', description: 'Marketing and growth team', organizationId: 'org-001', leaderId: 'user-001' },
        { id: 'team-003', name: 'Sales', description: 'Sales and business development', organizationId: 'org-001', leaderId: 'user-001' },
        { id: 'team-004', name: 'Operations', description: 'Operations and support team', organizationId: 'org-001', leaderId: 'user-001' },
      ];

      for (const team of defaultTeams) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO teams (id, name, description, organizationId, leaderId, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [team.id, team.name, team.description, team.organizationId, team.leaderId, new Date().toISOString(), new Date().toISOString()],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
      console.log('✅ Default teams created');
    }

    // Create sample users if needed
    const hashedPassword = await bcrypt.hash('password123', 12);
    const sampleUsers = [
      { id: 'user-002', email: 'john.smith@lapaas.com', firstName: 'John', lastName: 'Smith', role: 'team_leader', teamId: 'team-001' },
      { id: 'user-003', email: 'sarah.johnson@lapaas.com', firstName: 'Sarah', lastName: 'Johnson', role: 'member', teamId: 'team-001' },
      { id: 'user-004', email: 'mike.wilson@lapaas.com', firstName: 'Mike', lastName: 'Wilson', role: 'member', teamId: 'team-002' },
      { id: 'user-005', email: 'emily.davis@lapaas.com', firstName: 'Emily', lastName: 'Davis', role: 'team_leader', teamId: 'team-003' },
    ];

    for (const user of sampleUsers) {
      // Check if user already exists
      const existing = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE email = ?', [user.email], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!existing) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO users (id, email, password_hash, firstName, lastName, role, orgId, teamId, isActive, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user.id, user.email, hashedPassword, user.firstName, user.lastName, user.role, 'org-001', user.teamId, 1, new Date().toISOString(), new Date().toISOString()],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        console.log(`✅ Created user: ${user.email}`);
      }
    }

    // Always ensure team memberships exist
    const teamMemberships = [
      { id: 'tm-001', teamId: 'team-001', userId: 'user-001', role: 'leader' },
      { id: 'tm-002', teamId: 'team-001', userId: 'user-002', role: 'leader' },
      { id: 'tm-003', teamId: 'team-001', userId: 'user-003', role: 'member' },
      { id: 'tm-004', teamId: 'team-002', userId: 'user-004', role: 'member' },
      { id: 'tm-005', teamId: 'team-003', userId: 'user-005', role: 'leader' },
    ];

    let membershipsCreated = 0;
    for (const membership of teamMemberships) {
      const existing = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM team_members WHERE teamId = ? AND userId = ?', [membership.teamId, membership.userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (!existing) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO team_members (id, teamId, userId, role, addedAt)
             VALUES (?, ?, ?, ?, ?)`,
            [membership.id, membership.teamId, membership.userId, membership.role, new Date().toISOString()],
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
        membershipsCreated++;
      }
    }
    if (membershipsCreated > 0) {
      console.log(`✅ Created ${membershipsCreated} team memberships`);
    }
  } catch (error) {
    console.error('Error initializing default teams and users:', error);
  }
};

// Activity logging helper
const logActivity = (userId, action, resource, details) => {
  activities.push({
    id: uuidv4(),
    userId,
    action,
    resource,
    details,
    timestamp: new Date().toISOString(),
  });
};

initializeRoles();

// Configuration
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'lapaas-secure-jwt-secret-change-in-production-' + require('crypto').randomBytes(16).toString('hex');

// Create app
const app = express();

// Security Middleware (order matters!)
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // Secure CORS
app.use(express.json({ limit: '10mb' })); // Body parser with size limit
app.use(sanitizeInput); // Sanitize all inputs
app.use(preventSQLInjection); // SQL injection prevention
app.use(securityLogger); // Security audit logging

// Rate limiting
app.use('/api/v1/auth/login', authRateLimiter);
app.use('/api/v1/auth/register', authRateLimiter);
app.use('/api/v1/auth/forgot-password', passwordResetRateLimiter);
app.use('/api/v1/auth/reset-password', passwordResetRateLimiter);
app.use('/api/', generalRateLimiter); // General rate limit for all API routes

// IP blocking and security monitoring
app.use(ipBlockingMiddleware);
app.use(securityMonitor);

// Auth middleware
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
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      orgId: decoded.orgId,
      teamId: decoded.teamId,
    };

    next();
  } catch (error) {
    res.status(401).json({
      error: 'Unauthorized',
      message: error.message,
    });
  }
};

// Helper to filter data by user access
const filterByUserAccess = (items, userId, userRole, teamId) => {
  if (userRole === 'admin') {
    return items; // Admin sees all
  }
  
  if (userRole === 'team_leader' && teamId) {
    // Team leader sees their own data + team members' data
    return items.filter(item => 
      item.user_id === userId || 
      item.assigned_to === userId ||
      item.created_by === userId ||
      (item.team_id && item.team_id === teamId)
    );
  }
  
  // Member sees only their own data
  return items.filter(item => 
    item.user_id === userId || 
    item.assigned_to === userId ||
    item.created_by === userId
  );
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: 'in-memory-test',
  });
});

// API version
app.get('/api/v1', (req, res) => {
  res.json({
    version: '1.0.0',
    name: 'Lapaas OS API',
    environment: 'test',
    mode: 'in-memory',
  });
});

// Register
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Missing required fields',
      });
    }

    if (users.find((u) => u.email === email)) {
      return res.status(400).json({
        error: 'Email already registered',
        code: 'EMAIL_EXISTS',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();

    // Save to database
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (id, email, password_hash, firstName, lastName, role, orgId, teamId, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, email, hashedPassword, firstName, lastName, 'member', null, null, 1, new Date().toISOString(), new Date().toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        id: userId,
        email,
        firstName,
        lastName,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Registration failed',
      message: error.message,
    });
  }
});

// Login
app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password, twoFactorToken } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password required',
      });
    }

    // Check if account is locked
    const lockStatus = isAccountLocked(email);
    if (lockStatus.locked) {
      logSecurityEvent(SecurityEventTypes.LOGIN_FAILURE, {
        email,
        reason: 'Account locked',
        ip: req.ip,
      });
      return res.status(423).json({
        error: 'Account Locked',
        message: `Too many failed login attempts. Try again in ${Math.ceil(lockStatus.remainingTime / 60)} minutes.`,
        lockedUntil: lockStatus.lockedUntil,
      });
    }

    // Get user from database
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      recordFailedLogin(email);
      logSecurityEvent(SecurityEventTypes.LOGIN_FAILURE, {
        email,
        reason: 'User not found',
        ip: req.ip,
      });
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      recordFailedLogin(email);
      logSecurityEvent(SecurityEventTypes.LOGIN_FAILURE, {
        email,
        userId: user.id,
        reason: 'Invalid password',
        ip: req.ip,
      });
      return res.status(401).json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS',
      });
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled && !twoFactorToken) {
      return res.status(200).json({
        success: false,
        requires2FA: true,
        userId: user.id,
        message: 'Two-factor authentication required',
      });
    }

    // Verify 2FA token if provided
    if (user.twoFactorEnabled && twoFactorToken) {
      const { verify2FAToken } = require('./security-advanced');
      const isValid = verify2FAToken(user.twoFactorSecret, twoFactorToken);
      if (!isValid) {
        logSecurityEvent(SecurityEventTypes.TWO_FACTOR_FAILURE, {
          userId: user.id,
          ip: req.ip,
        });
        return res.status(401).json({
          error: 'Invalid 2FA token',
          code: 'INVALID_2FA_TOKEN',
        });
      }
    }

    // Clear failed login attempts on successful login
    clearFailedLogins(email);

    logSecurityEvent(SecurityEventTypes.LOGIN_SUCCESS, {
      userId: user.id,
      email: user.email,
      ip: req.ip,
      twoFactorUsed: !!user.twoFactorEnabled,
    });

    const accessToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
        orgId: user.org_id,
        teamId: user.team_id,
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

    sessions.push({
      id: uuidv4(),
      user_id: user.id,
      refresh_token_hash: refreshToken,
      created_at: new Date().toISOString(),
    });

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
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phone: user.phone || '',
          position: user.position || '',
          department: user.department || '',
          avatar: user.avatar || null,
          role: user.role,
          orgId: user.orgId,
          teamId: user.teamId,
          isActive: user.isActive,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Login failed',
      message: error.message,
    });
  }
});

// Refresh token
app.post('/api/v1/auth/refresh', (req, res) => {
  try {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token required',
      });
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET);

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
  } catch (error) {
    res.status(401).json({
      error: 'Token refresh failed',
      message: error.message,
    });
  }
});

// Get current user (both endpoints for compatibility)
app.get('/api/v1/auth/me', authMiddleware, (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get current user',
      message: error.message,
    });
  }
});

// Alias for /api/v1/users/me (used by security tests)
app.get('/api/v1/users/me', authMiddleware, (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    res.json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to get current user',
      message: error.message,
    });
  }
});

// Logout
app.post('/api/v1/auth/logout', authMiddleware, (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
      });
    }

    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Logout failed',
      message: error.message,
    });
  }
});

// Request password reset
app.post('/api/v1/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
      });
    }

    // Check if user exists
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({
        success: true,
        message: 'If an account exists with this email, a password reset link has been sent.',
      });
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token to database
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET resetToken = ?, resetTokenExpiry = ? WHERE id = ?',
        [resetToken, resetTokenExpiry.toISOString(), user.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Send password reset email
    try {
      const emailResult = await sendPasswordResetEmail(
        email,
        resetToken,
        user.firstName
      );

      if (emailResult.success) {
        console.log(`✅ Password reset email sent to: ${email}`);
      } else {
        console.error(`❌ Failed to send reset email to: ${email}`, emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
    }

    res.json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('❌ Error in forgot password:', error);
    res.status(500).json({
      error: 'Failed to process password reset request',
      message: error.message,
    });
  }
});

// Reset password with token
app.post('/api/v1/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Token and new password are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters long',
      });
    }

    // Find user with valid reset token
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE resetToken = ? AND resetTokenExpiry > ?',
        [token, new Date().toISOString()],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(400).json({
        error: 'Invalid or expired reset token',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset token
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET password_hash = ?, resetToken = NULL, resetTokenExpiry = NULL, updatedAt = ? WHERE id = ?',
        [hashedPassword, new Date().toISOString(), user.id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    console.log(`✅ Password reset successful for: ${user.email}`);

    res.json({
      success: true,
      message: 'Password has been reset successfully. You can now login with your new password.',
    });
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    res.status(500).json({
      error: 'Failed to reset password',
      message: error.message,
    });
  }
});

// Email verification
app.post('/api/v1/auth/verify-email', (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: 'Email and code required',
      });
    }

    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // In production, verify the code against stored verification code
    // For now, accept any 6-digit code
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        error: 'Invalid verification code',
      });
    }

    user.email_verified = true;

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: {
        email: user.email,
        verified: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Email verification failed',
      message: error.message,
    });
  }
});

// Resend verification email
app.post('/api/v1/auth/resend-verification', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email required',
      });
    }

    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // In production, send verification email
    // For now, just return success
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    res.json({
      success: true,
      message: 'Verification email sent',
      data: {
        email,
        // In production, don't return the code
        code: verificationCode,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Resend verification failed',
      message: error.message,
    });
  }
});

// Forgot password
app.post('/api/v1/auth/forgot-password', (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email required',
      });
    }

    const user = users.find((u) => u.email === email);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // In production, send password reset email
    // For now, just return success
    const resetToken = jwt.sign(
      {
        sub: user.id,
        email: user.email,
        type: 'password-reset',
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Password reset email sent',
      data: {
        email,
        // In production, don't return the token
        resetToken,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Forgot password failed',
      message: error.message,
    });
  }
});

// Reset password
app.post('/api/v1/auth/reset-password', async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        error: 'Reset token and new password required',
      });
    }

    const decoded = jwt.verify(resetToken, JWT_SECRET);

    if (decoded.type !== 'password-reset') {
      return res.status(401).json({
        error: 'Invalid reset token',
      });
    }

    const user = users.find((u) => u.id === decoded.sub);

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password_hash = hashedPassword;

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: {
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: 'Password reset failed',
      message: error.message,
    });
  }
});

// ==================== WEEK 3: USER MANAGEMENT ====================

// Get user profile
app.get('/api/v1/users/profile/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar || null,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile (comprehensive)
app.put('/api/v1/users/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, email, phone, position, department, avatar } = req.body;

    // First try to update in SQLite database
    const updateFields = [];
    const values = [];
    
    if (firstName !== undefined) { updateFields.push('firstName = ?'); values.push(firstName); }
    if (lastName !== undefined) { updateFields.push('lastName = ?'); values.push(lastName); }
    if (email !== undefined) { updateFields.push('email = ?'); values.push(email); }
    if (phone !== undefined) { updateFields.push('phone = ?'); values.push(phone); }
    if (position !== undefined) { updateFields.push('position = ?'); values.push(position); }
    if (department !== undefined) { updateFields.push('department = ?'); values.push(department); }
    if (avatar !== undefined) { updateFields.push('avatar = ?'); values.push(avatar); }
    
    updateFields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(userId);
    
    if (db && updateFields.length > 1) {
      db.run(
        `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) {
            console.error('Error updating user in DB:', err);
          }
        }
      );
    }

    // Also update in-memory user if exists
    const user = users.find((u) => u.id === userId);
    if (user) {
      if (firstName !== undefined) user.firstName = firstName;
      if (lastName !== undefined) user.lastName = lastName;
      if (email !== undefined) user.email = email;
      if (phone !== undefined) user.phone = phone;
      if (position !== undefined) user.position = position;
      if (department !== undefined) user.department = department;
      if (avatar !== undefined) user.avatar = avatar;
    }

    logActivity(userId, 'UPDATE', 'USER_PROFILE', { firstName, lastName, email });

    // Fetch updated user from DB
    if (db) {
      db.get('SELECT * FROM users WHERE id = ?', [userId], (err, dbUser) => {
        if (err || !dbUser) {
          return res.json({
            success: true,
            message: 'Profile updated successfully',
            data: user || { id: userId, firstName, lastName, email },
          });
        }
        res.json({
          success: true,
          message: 'Profile updated successfully',
          data: dbUser,
        });
      });
    } else {
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: user || { id: userId, firstName, lastName, email },
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user profile
app.get('/api/v1/users/profile/me', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (db) {
      db.get('SELECT id, email, firstName, lastName, phone, position, department, role, avatar, createdAt FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) {
          return res.status(404).json({ error: 'User not found' });
        }
        res.json({ success: true, data: user });
      });
    } else {
      const user = users.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ success: true, data: user });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user activity
app.get('/api/v1/users/activity/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const userActivities = activities.filter((a) => a.userId === userId);

    res.json({
      success: true,
      data: userActivities,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== WEEK 3: ORGANIZATION MANAGEMENT ====================

// Create organization
app.post('/api/v1/organizations', (req, res) => {
  try {
    const { name, description, ownerId } = req.body;

    if (!name || !ownerId) {
      return res.status(400).json({ error: 'Name and ownerId required' });
    }

    const organization = {
      id: uuidv4(),
      name,
      description,
      ownerId,
      members: [{ userId: ownerId, role: 'Admin' }],
      createdAt: new Date().toISOString(),
    };

    organizations.push(organization);
    logActivity(ownerId, 'CREATE', 'ORGANIZATION', { name });

    res.json({
      success: true,
      message: 'Organization created successfully',
      data: organization,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get organizations
app.get('/api/v1/organizations', (req, res) => {
  try {
    res.json({
      success: true,
      data: organizations,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get organization by ID
app.get('/api/v1/organizations/:orgId', (req, res) => {
  try {
    const { orgId } = req.params;
    const organization = organizations.find((o) => o.id === orgId);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({
      success: true,
      data: organization,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add member to organization
app.post('/api/v1/organizations/:orgId/members', (req, res) => {
  try {
    const { orgId } = req.params;
    const { userId, role, addedBy } = req.body;

    const organization = organizations.find((o) => o.id === orgId);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const memberExists = organization.members.find((m) => m.userId === userId);
    if (memberExists) {
      return res.status(400).json({ error: 'Member already exists' });
    }

    organization.members.push({ userId, role: role || 'Member' });
    logActivity(addedBy, 'ADD_MEMBER', 'ORGANIZATION', { userId, role });

    res.json({
      success: true,
      message: 'Member added successfully',
      data: organization,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== WEEK 3: TEAM MANAGEMENT ====================

// Create team
app.post('/api/v1/teams', async (req, res) => {
  try {
    const { name, description, organizationId, leaderId } = req.body;
    const userId = req.user?.id || 'user-001';

    if (!name) {
      return res.status(400).json({ error: 'Team name is required' });
    }

    const teamId = uuidv4();
    const team = {
      id: teamId,
      name,
      description: description || '',
      organizationId: organizationId || null,
      leaderId: leaderId || userId,
      createdAt: new Date().toISOString(),
    };

    // Save team to database
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO teams (id, name, description, organizationId, leaderId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [teamId, name, description || '', organizationId || null, leaderId || userId, new Date().toISOString(), new Date().toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Add leader as first member
    const memberId = uuidv4();
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO team_members (id, teamId, userId, role, addedBy, addedAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [memberId, teamId, leaderId || userId, 'Lead', userId, new Date().toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    logActivity(userId, 'CREATE', 'TEAM', { name });

    res.json({
      success: true,
      message: 'Team created successfully',
      data: team,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update team
app.put('/api/v1/teams/:teamId', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { name, description, leaderId } = req.body;
    const userId = req.user?.id || 'user-001';

    // Check if team exists
    const team = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM teams WHERE id = ?', [teamId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Build update query
    const updateFields = [];
    const values = [];
    
    if (name !== undefined) { updateFields.push('name = ?'); values.push(name); }
    if (description !== undefined) { updateFields.push('description = ?'); values.push(description); }
    if (leaderId !== undefined) { updateFields.push('leaderId = ?'); values.push(leaderId); }
    updateFields.push('updatedAt = CURRENT_TIMESTAMP');
    values.push(teamId);

    // Update team in database
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE teams SET ${updateFields.join(', ')} WHERE id = ?`,
        values,
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Fetch updated team
    const updatedTeam = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM teams WHERE id = ?', [teamId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    logActivity(userId, 'UPDATE', 'TEAM', { teamId, name, description });

    res.json({
      success: true,
      message: 'Team updated successfully',
      data: updatedTeam,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get teams
app.get('/api/v1/teams', async (req, res) => {
  try {
    // Get teams from database
    const teams = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM teams ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json({
      success: true,
      data: teams,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get team by ID
app.get('/api/v1/teams/:teamId', (req, res) => {
  try {
    const { teamId } = req.params;
    const team = teams.find((t) => t.id === teamId);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({
      success: true,
      data: team,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add member to team (with invite system)
app.post('/api/v1/teams/:teamId/members', async (req, res) => {
  try {
    const { teamId } = req.params;
    const { email, userId: providedUserId, role, addedBy } = req.body;
    const currentUserId = req.user?.id || 'user-001';

    if (!email) {
      return res.status(400).json({ 
        error: 'Email is required',
        message: 'Please provide an email address'
      });
    }

    // Check if team exists
    const team = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM teams WHERE id = ?', [teamId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Check if user exists
    let user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    let userId;
    let isNewUser = false;
    let generatedPassword = null;

    // If user doesn't exist, create account and send invitation
    if (!user) {
      isNewUser = true;
      userId = uuidv4();
      generatedPassword = generateRandomPassword();
      const hashedPassword = await bcrypt.hash(generatedPassword, 12);

      // Extract name from email
      const emailName = email.split('@')[0];
      const firstName = emailName.charAt(0).toUpperCase() + emailName.slice(1);

      // Create new user
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO users (id, email, password_hash, firstName, lastName, role, orgId, teamId, isActive, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, email, hashedPassword, firstName, '', 'member', null, null, 1, new Date().toISOString(), new Date().toISOString()],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });

      console.log(`✅ Created new user account for: ${email}`);
    } else {
      userId = user.id;
    }

    // Check if member already exists in team
    const memberExists = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM team_members WHERE teamId = ? AND userId = ?', [teamId, userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (memberExists) {
      return res.status(400).json({ 
        error: 'Member already exists',
        message: 'This user is already a member of this team'
      });
    }

    // Add member to team
    const memberId = uuidv4();
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO team_members (id, teamId, userId, role, addedBy, addedAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [memberId, teamId, userId, role || 'Member', addedBy || currentUserId, new Date().toISOString()],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    // Send invitation email
    try {
      const emailResult = await sendTeamInvitation(
        email,
        team.name,
        email,
        generatedPassword,
        isNewUser
      );

      if (emailResult.success) {
        console.log(`✅ Invitation email sent to: ${email}`);
      } else {
        console.error(`❌ Failed to send email to: ${email}`, emailResult.error);
      }
    } catch (emailError) {
      console.error('❌ Email sending error:', emailError);
      // Don't fail the request if email fails
    }

    // Get updated user details
    const updatedUser = await new Promise((resolve, reject) => {
      db.get('SELECT id, email, firstName, lastName, role as userRole FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    logActivity(addedBy || currentUserId, 'ADD_MEMBER', 'TEAM', { userId, role, isNewUser });

    res.json({
      success: true,
      message: isNewUser 
        ? 'User invited and account created. Invitation email sent.' 
        : 'Member added successfully. Notification email sent.',
      data: { 
        id: memberId, 
        teamId, 
        userId, 
        role: role || 'Member',
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        userRole: updatedUser.userRole,
        isNewUser
      },
    });
  } catch (error) {
    console.error('❌ Error adding member:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get team members
app.get('/api/v1/teams/:teamId/members', async (req, res) => {
  try {
    const { teamId } = req.params;

    // Check if team exists
    const team = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM teams WHERE id = ?', [teamId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    // Get members with user details
    const members = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          tm.id,
          tm.teamId,
          tm.userId,
          tm.role,
          tm.addedBy,
          tm.addedAt,
          u.email,
          u.firstName,
          u.lastName,
          u.role as userRole
        FROM team_members tm
        JOIN users u ON tm.userId = u.id
        WHERE tm.teamId = ?
        ORDER BY tm.addedAt DESC
      `, [teamId], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json({
      success: true,
      data: members,
      total: members.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove member from team
app.delete('/api/v1/teams/:teamId/members/:memberId', async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const currentUserId = req.user?.id || 'user-001';

    // Check if member exists
    const member = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM team_members WHERE id = ? AND teamId = ?', [memberId, teamId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Delete member
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM team_members WHERE id = ? AND teamId = ?', [memberId, teamId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    logActivity(currentUserId, 'REMOVE_MEMBER', 'TEAM', { memberId, teamId });

    res.json({
      success: true,
      message: 'Member removed successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update member role and details
app.put('/api/v1/teams/:teamId/members/:memberId', async (req, res) => {
  try {
    const { teamId, memberId } = req.params;
    const { role, firstName, lastName, email, phone, position, department } = req.body;
    const currentUserId = req.user?.id || 'user-001';

    // Check if member exists
    const member = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM team_members WHERE id = ? AND teamId = ?', [memberId, teamId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Update team_members role if provided
    if (role) {
      await new Promise((resolve, reject) => {
        db.run('UPDATE team_members SET role = ? WHERE id = ? AND teamId = ?', [role, memberId, teamId], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    // Update user details if provided
    if (member.userId && (firstName || lastName || email || phone || position || department)) {
      const updateFields = [];
      const values = [];
      
      if (firstName !== undefined) { updateFields.push('firstName = ?'); values.push(firstName); }
      if (lastName !== undefined) { updateFields.push('lastName = ?'); values.push(lastName); }
      if (email !== undefined) { updateFields.push('email = ?'); values.push(email); }
      if (phone !== undefined) { updateFields.push('phone = ?'); values.push(phone); }
      if (position !== undefined) { updateFields.push('position = ?'); values.push(position); }
      if (department !== undefined) { updateFields.push('department = ?'); values.push(department); }
      updateFields.push('updatedAt = CURRENT_TIMESTAMP');
      values.push(member.userId);

      if (updateFields.length > 1) {
        await new Promise((resolve, reject) => {
          db.run(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
            values,
            (err) => {
              if (err) reject(err);
              else resolve();
            }
          );
        });
      }
    }

    // Fetch updated member with user details
    const updatedMember = await new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          tm.id,
          tm.teamId,
          tm.userId,
          tm.role,
          u.email,
          u.firstName,
          u.lastName,
          u.phone,
          u.position,
          u.department
        FROM team_members tm
        JOIN users u ON tm.userId = u.id
        WHERE tm.id = ? AND tm.teamId = ?
      `, [memberId, teamId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    logActivity(currentUserId, 'UPDATE_MEMBER', 'TEAM', { memberId, teamId, role, firstName, lastName });

    res.json({
      success: true,
      message: 'Member updated successfully',
      data: updatedMember || { id: memberId, teamId, role }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== WEEK 3: RBAC MANAGEMENT ====================

// Get roles
app.get('/api/v1/roles', (req, res) => {
  try {
    res.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Assign role to user
app.post('/api/v1/roles/assign', (req, res) => {
  try {
    const { userId, organizationId, role, assignedBy } = req.body;

    if (!userId || !organizationId || !role) {
      return res.status(400).json({ error: 'userId, organizationId, and role required' });
    }

    const organization = organizations.find((o) => o.id === organizationId);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const member = organization.members.find((m) => m.userId === userId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    member.role = role;
    logActivity(assignedBy, 'ASSIGN_ROLE', 'USER', { userId, role });

    res.json({
      success: true,
      message: 'Role assigned successfully',
      data: member,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check permission
app.post('/api/v1/permissions/check', (req, res) => {
  try {
    const { userId, organizationId, action } = req.body;

    if (!userId || !organizationId || !action) {
      return res.status(400).json({ error: 'userId, organizationId, and action required' });
    }

    const organization = organizations.find((o) => o.id === organizationId);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const member = organization.members.find((m) => m.userId === userId);
    if (!member) {
      return res.json({ success: true, data: { hasPermission: false } });
    }

    const role = roles.find((r) => r.name === member.role);
    const hasPermission = role?.permissions.includes(action) || false;

    res.json({
      success: true,
      data: { hasPermission },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== WEEK 3: ACTIVITY LOGGING ====================

// Get all activities
app.get('/api/v1/activities', (req, res) => {
  try {
    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activities by resource
app.get('/api/v1/activities/:resource', (req, res) => {
  try {
    const { resource } = req.params;
    const resourceActivities = activities.filter((a) => a.resource === resource);

    res.json({
      success: true,
      data: resourceActivities,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user role (Admin only)
app.put('/api/v1/users/:userId/role', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Check if requester is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admins can update user roles',
      });
    }

    // Get user from database
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    if (!['admin', 'team_leader', 'member'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        message: 'Role must be admin, team_leader, or member',
      });
    }

    // Update role in database
    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET role = ?, updatedAt = ? WHERE id = ?',
        [role, new Date().toISOString(), userId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });

    logActivity(req.user.id, 'update', 'user', `Updated role for user ${userId} to ${role}`);

    res.json({
      success: true,
      message: 'User role updated',
      data: {
        id: userId,
        email: user.email,
        role: role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get users list for dropdowns (public - limited fields)
app.get('/api/v1/users/list', async (req, res) => {
  try {
    // Get users from database with limited fields for dropdown
    const userList = await new Promise((resolve, reject) => {
      db.all('SELECT id, email, firstName, lastName, role FROM users WHERE isActive = 1 OR isActive IS NULL ORDER BY firstName, lastName', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json({
      success: true,
      data: userList,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all users (Admin only)
app.get('/api/v1/users', authMiddleware, async (req, res) => {
  try {
    // Check if requester is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admins can view all users',
      });
    }

    // Get users from database
    const userList = await new Promise((resolve, reject) => {
      db.all('SELECT id, email, firstName, lastName, role, orgId, teamId, isActive, createdAt FROM users ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    res.json({
      success: true,
      data: userList,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register admin routes
adminRoutes(app);
adminPlansRoutes(app);
collectionsUserRoutes(app);
financeRoutes(app);
financePhase2Routes(app);
financePhase3Routes(app);
billingRoutes(app);
invoicingRoutes(app);
productsRoutes(app);
customersVendorsRoutes(app);
payablesRoutes(app);
complianceRoutes(app);
founderOSRoutes(app);

app.use("/api/v1", founderOSCommitmentsTimeBlocksRoutes);
founderOSExtendedRoutes(app);
calendarTasksRoutes(app);
founderOSPhase0Routes(app);
app.use('/api/v1', founderOSMeetingsRoutes);
app.use('/api/v1', founderOSFirewallRoutes);
app.use('/api/v1', founderOSDeepWorkGuardrailsRoutes);
app.use('/api/v1', founderOSAutoPlanHeatmapRoutes);
app.use('/api/v1', founderOSRecordingTranscriptionRoutes);
app.use('/api/v1', founderOSStartupShutdownRoutes);
app.use('/api/v1', founderOSAfterActionRoutes);
app.use('/api/v1', meetingOSEnhancedRoutes);
app.use('/api/v1', interruptionFirewallRoutes);
app.use('/api/v1', teamManagementRoutes);
app.use('/api/v1', featureControlRoutes);

// Start server with database initialization
initializeDatabase()
  .then(() => initializeDefaultAdmin())
  .then(() => initializeDefaultTeamsAndUsers())
  .then(() => {
    // Register security routes after database is initialized
    securityRoutes(app, db, authMiddleware);
    
    // 404 handler (must be after all routes)
    app.use((req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`,
      });
    });

    // Secure error handler (don't expose internal errors in production)
    app.use(secureErrorHandler);
    
    app.listen(PORT, () => {
      console.log(`🚀 Test Server running on http://localhost:${PORT}`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`💾 Database: SQLite (Persistent)`);
      console.log(`📁 DB Path: ${DB_PATH}`);
      console.log(`\n🔒 Security Features Enabled:`);
      console.log(`   ✅ Rate Limiting (100 req/15min general, 5 req/15min auth)`);
      console.log(`   ✅ Input Sanitization`);
      console.log(`   ✅ SQL Injection Prevention`);
      console.log(`   ✅ Security Headers (Helmet)`);
      console.log(`   ✅ CORS Protection`);
      console.log(`   ✅ Security Audit Logging`);
      console.log(`   ✅ Two-Factor Authentication (2FA)`);
      console.log(`   ✅ Account Lockout Protection`);
      console.log(`   ✅ IP Blocking`);
      console.log(`   ✅ Session Management`);
      console.log(`\n📁 Security Logs: ${path.join(__dirname, 'logs')}`);
      console.log(`\n⏳ Ready for testing...\n`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  });

// Export db for use in other modules
module.exports = { db: null };
// Update the export when db is initialized
const updateDbExport = () => {
  module.exports.db = db;
};
// Call after db is initialized
initializeDatabase().then(updateDbExport).catch(() => {});
