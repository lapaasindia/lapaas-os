/**
 * Simple Database Initialization Script
 * Run this script to initialize the SQLite database
 * Usage: node init-db-simple.js
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'lapaas.db');

// Remove old database if exists
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('Removed old database');
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err);
    process.exit(1);
  }
  console.log(`✅ Database connection established at ${DB_PATH}`);
});

// Enable foreign keys
db.run('PRAGMA foreign_keys = ON');

// Create tables one by one
const tables = [
  // Users table
  `CREATE TABLE users (
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
  )`,

  // Organizations table
  `CREATE TABLE organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    ownerId TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ownerId) REFERENCES users(id)
  )`,

  // Teams table
  `CREATE TABLE teams (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    organizationId TEXT NOT NULL,
    leaderId TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organizationId) REFERENCES organizations(id),
    FOREIGN KEY (leaderId) REFERENCES users(id)
  )`,

  // Members table
  `CREATE TABLE members (
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
  )`,

  // Roles table
  `CREATE TABLE roles (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    permissions TEXT NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  // Activities table
  `CREATE TABLE activities (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    details TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`,

  // Sessions table
  `CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    accessToken TEXT NOT NULL,
    refreshToken TEXT NOT NULL,
    expiresAt DATETIME NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  )`,

  // Daily Commitments table
  `CREATE TABLE daily_commitments (
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
  )`
];

// Create indexes
const indexes = [
  'CREATE INDEX idx_users_email ON users(email)',
  'CREATE INDEX idx_organizations_ownerId ON organizations(ownerId)',
  'CREATE INDEX idx_teams_organizationId ON teams(organizationId)',
  'CREATE INDEX idx_members_userId ON members(userId)',
  'CREATE INDEX idx_activities_userId ON activities(userId)',
  'CREATE INDEX idx_activities_resource ON activities(resource)',
  'CREATE INDEX idx_daily_commitments_org_id ON daily_commitments(org_id)',
  'CREATE INDEX idx_daily_commitments_user_id ON daily_commitments(user_id)',
  'CREATE INDEX idx_daily_commitments_start_date ON daily_commitments(start_date)'
];

let completed = 0;
const total = tables.length + indexes.length + 1; // +1 for roles insert

// Execute tables
tables.forEach((sql, idx) => {
  db.run(sql, (err) => {
    if (err) {
      console.error(`❌ Error creating table ${idx + 1}:`, err.message);
    } else {
      console.log(`✅ Table ${idx + 1} created`);
    }
    completed++;
    if (completed === total) finalize();
  });
});

// Execute indexes
indexes.forEach((sql, idx) => {
  db.run(sql, (err) => {
    if (err) {
      console.error(`❌ Error creating index ${idx + 1}:`, err.message);
    } else {
      console.log(`✅ Index ${idx + 1} created`);
    }
    completed++;
    if (completed === total) finalize();
  });
});

// Insert default roles
db.run(
  `INSERT INTO roles (id, name, permissions) VALUES 
   ('role-admin', 'Admin', '["create","read","update","delete"]'),
   ('role-manager', 'Manager', '["create","read","update"]'),
   ('role-member', 'Member', '["read","update"]'),
   ('role-viewer', 'Viewer', '["read"]')`,
  (err) => {
    if (err) {
      console.error('❌ Error inserting default roles:', err.message);
    } else {
      console.log('✅ Default roles inserted');
    }
    completed++;
    if (completed === total) finalize();
  }
);

function finalize() {
  console.log('🎉 Database initialization complete!');
  db.close();
}

// Handle errors
db.on('error', (err) => {
  console.error('❌ Database error:', err);
});
