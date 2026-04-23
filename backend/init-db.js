/**
 * Database Initialization Script
 * Run this script to initialize the SQLite database with all required tables
 * Usage: node init-db.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'lapaas.db');

// Check if database already exists
const dbExists = fs.existsSync(DB_PATH);

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  }
  console.log(`✅ Database connection established at ${DB_PATH}`);
  
  // Enable foreign keys
  db.run('PRAGMA foreign_keys = ON', (err) => {
    if (err) console.error('Error enabling foreign keys:', err);
  });
});

// SQL statements for creating tables
const createTablesSQL = `
-- Users table
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

-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  ownerId TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ownerId) REFERENCES users(id)
);

-- Teams table
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

-- Members table
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

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  permissions TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  action TEXT NOT NULL,
  resource TEXT NOT NULL,
  details TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  accessToken TEXT NOT NULL,
  refreshToken TEXT NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id)
);

-- Daily Commitments table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_organizations_ownerId ON organizations(ownerId);
CREATE INDEX IF NOT EXISTS idx_teams_organizationId ON teams(organizationId);
CREATE INDEX IF NOT EXISTS idx_members_userId ON members(userId);
CREATE INDEX IF NOT EXISTS idx_activities_userId ON activities(userId);
CREATE INDEX IF NOT EXISTS idx_activities_resource ON activities(resource);
CREATE INDEX IF NOT EXISTS idx_daily_commitments_org_id ON daily_commitments(org_id);
CREATE INDEX IF NOT EXISTS idx_daily_commitments_user_id ON daily_commitments(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_commitments_start_date ON daily_commitments(start_date);
`;

// Split SQL into individual statements
const statements = createTablesSQL
  .split(';')
  .map(s => s.trim())
  .filter(s => s.length > 0 && !s.startsWith('--'));

// Execute statements sequentially
let currentIndex = 0;

const executeNextStatement = () => {
  if (currentIndex >= statements.length) {
    console.log(`✅ All ${statements.length} database statements executed successfully`);
    
    // Insert default roles
    const roles = [
      { id: 'role-admin', name: 'Admin', permissions: '["create","read","update","delete"]' },
      { id: 'role-manager', name: 'Manager', permissions: '["create","read","update"]' },
      { id: 'role-member', name: 'Member', permissions: '["read","update"]' },
      { id: 'role-viewer', name: 'Viewer', permissions: '["read"]' }
    ];

    let rolesInserted = 0;
    roles.forEach(role => {
      db.run(
        'INSERT OR IGNORE INTO roles (id, name, permissions) VALUES (?, ?, ?)',
        [role.id, role.name, role.permissions],
        (err) => {
          if (err) console.error('Error inserting role:', err);
          rolesInserted++;
          if (rolesInserted === roles.length) {
            console.log('✅ Default roles inserted');
            console.log('🎉 Database initialization complete!');
            db.close();
          }
        }
      );
    });
    return;
  }

  const statement = statements[currentIndex];
  db.run(statement, (err) => {
    if (err) {
      console.error(`❌ Error executing statement ${currentIndex + 1}:`, err.message);
    } else {
      console.log(`✅ Statement ${currentIndex + 1} executed`);
    }
    currentIndex++;
    executeNextStatement();
  });
};

executeNextStatement();

// Handle errors
db.on('error', (err) => {
  console.error('❌ Database error:', err);
});
