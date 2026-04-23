-- Lapaas OS Database Schema
-- SQLite Database for Production

-- ==================== USERS TABLE ====================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  firstName TEXT,
  lastName TEXT,
  avatar TEXT,
  emailVerified BOOLEAN DEFAULT 0,
  verificationCode TEXT,
  verificationCodeExpiry DATETIME,
  resetToken TEXT,
  resetTokenExpiry DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==================== ORGANIZATIONS TABLE ====================
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  ownerId TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerId) REFERENCES users(id)
);

-- ==================== TEAMS TABLE ====================
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  organizationId TEXT NOT NULL,
  leaderId TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizationId) REFERENCES organizations(id),
  FOREIGN KEY (leaderId) REFERENCES users(id)
);

-- ==================== MEMBERS TABLE ====================
CREATE TABLE IF NOT EXISTS members (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  organizationId TEXT,
  teamId TEXT,
  role TEXT NOT NULL,
  joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (organizationId) REFERENCES organizations(id),
  FOREIGN KEY (teamId) REFERENCES teams(id),
  UNIQUE(userId, organizationId),
  UNIQUE(userId, teamId)
);

-- ==================== ROLES TABLE ====================
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  permissions TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==================== ACTIVITIES TABLE ====================
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- ==================== SESSIONS TABLE ====================
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  accessToken TEXT NOT NULL,
  refreshToken TEXT NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- ==================== INDEXES ====================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_createdAt ON users(createdAt);

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_ownerId ON organizations(ownerId);
CREATE INDEX IF NOT EXISTS idx_organizations_createdAt ON organizations(createdAt);

-- Teams indexes
CREATE INDEX IF NOT EXISTS idx_teams_organizationId ON teams(organizationId);
CREATE INDEX IF NOT EXISTS idx_teams_leaderId ON teams(leaderId);
CREATE INDEX IF NOT EXISTS idx_teams_createdAt ON teams(createdAt);

-- Members indexes
CREATE INDEX IF NOT EXISTS idx_members_userId ON members(userId);
CREATE INDEX IF NOT EXISTS idx_members_organizationId ON members(organizationId);
CREATE INDEX IF NOT EXISTS idx_members_teamId ON members(teamId);

-- Activities indexes
CREATE INDEX IF NOT EXISTS idx_activities_userId ON activities(userId);
CREATE INDEX IF NOT EXISTS idx_activities_resource ON activities(resource);
CREATE INDEX IF NOT EXISTS idx_activities_timestamp ON activities(timestamp);

-- Sessions indexes
CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);
CREATE INDEX IF NOT EXISTS idx_sessions_accessToken ON sessions(accessToken);

-- ==================== DAILY COMMITMENTS TABLE ====================
CREATE TABLE IF NOT EXISTS daily_commitments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  effort_minutes INTEGER DEFAULT 60,
  recurring BOOLEAN DEFAULT 1,
  status TEXT DEFAULT 'active',
  org_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (org_id) REFERENCES organizations(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Daily Commitments indexes
CREATE INDEX IF NOT EXISTS idx_daily_commitments_org_id ON daily_commitments(org_id);
CREATE INDEX IF NOT EXISTS idx_daily_commitments_user_id ON daily_commitments(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_commitments_start_date ON daily_commitments(start_date);

-- ==================== INITIAL DATA ====================

-- Insert default roles
INSERT OR IGNORE INTO roles (id, name, permissions) VALUES
  ('role-admin', 'Admin', '["create","read","update","delete"]'),
  ('role-manager', 'Manager', '["create","read","update"]'),
  ('role-member', 'Member', '["read","update"]'),
  ('role-viewer', 'Viewer', '["read"]');
