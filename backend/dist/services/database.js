"use strict";
/**
 * Database Service - SQLite Integration
 * Handles all database operations for Lapaas OS
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const DB_PATH = path_1.default.join(__dirname, '../../lapaas.db');
class DatabaseService {
    constructor() {
        this.db = null;
    }
    /**
     * Initialize database connection
     */
    async initialize() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3_1.default.Database(DB_PATH, (err) => {
                if (err) {
                    console.error('Database connection error:', err);
                    reject(err);
                }
                else {
                    console.log('✅ Database connected:', DB_PATH);
                    this.createTables()
                        .then(() => resolve())
                        .catch(reject);
                }
            });
        });
    }
    /**
     * Create database tables
     */
    async createTables() {
        if (!this.db)
            throw new Error('Database not initialized');
        const tables = [
            // Users table
            `CREATE TABLE IF NOT EXISTS users (
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
            `CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        ownerId TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (ownerId) REFERENCES users(id)
      )`,
            // Teams table
            `CREATE TABLE IF NOT EXISTS teams (
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
            `CREATE TABLE IF NOT EXISTS members (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        organizationId TEXT,
        teamId TEXT,
        role TEXT NOT NULL,
        joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (organizationId) REFERENCES organizations(id),
        FOREIGN KEY (teamId) REFERENCES teams(id)
      )`,
            // Roles table
            `CREATE TABLE IF NOT EXISTS roles (
        id TEXT PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        permissions TEXT NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
            // Activities table
            `CREATE TABLE IF NOT EXISTS activities (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        action TEXT NOT NULL,
        resource TEXT NOT NULL,
        details TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )`,
            // Sessions table
            `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        accessToken TEXT NOT NULL,
        refreshToken TEXT NOT NULL,
        expiresAt DATETIME NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id)
      )`,
        ];
        for (const table of tables) {
            await this.run(table);
        }
        // Create indexes
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
            'CREATE INDEX IF NOT EXISTS idx_organizations_ownerId ON organizations(ownerId)',
            'CREATE INDEX IF NOT EXISTS idx_teams_organizationId ON teams(organizationId)',
            'CREATE INDEX IF NOT EXISTS idx_members_userId ON members(userId)',
            'CREATE INDEX IF NOT EXISTS idx_activities_userId ON activities(userId)',
            'CREATE INDEX IF NOT EXISTS idx_activities_resource ON activities(resource)',
        ];
        for (const index of indexes) {
            await this.run(index);
        }
        console.log('✅ Database tables created');
    }
    /**
     * Run a query
     */
    async run(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            this.db.run(sql, params, (err) => {
                if (err)
                    reject(err);
                else
                    resolve();
            });
        });
    }
    /**
     * Get a single row
     */
    async get(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            this.db.get(sql, params, (err, row) => {
                if (err)
                    reject(err);
                else
                    resolve(row);
            });
        });
    }
    /**
     * Get all rows
     */
    async all(sql, params = []) {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                reject(new Error('Database not initialized'));
                return;
            }
            this.db.all(sql, params, (err, rows) => {
                if (err)
                    reject(err);
                else
                    resolve(rows || []);
            });
        });
    }
    /**
     * Close database connection
     */
    async close() {
        return new Promise((resolve, reject) => {
            if (!this.db) {
                resolve();
                return;
            }
            this.db.close((err) => {
                if (err)
                    reject(err);
                else {
                    console.log('✅ Database connection closed');
                    resolve();
                }
            });
        });
    }
    // ==================== USER OPERATIONS ====================
    async createUser(user) {
        await this.run(`INSERT INTO users (id, email, password_hash, firstName, lastName, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [user.id, user.email, user.password_hash, user.firstName, user.lastName, new Date().toISOString(), new Date().toISOString()]);
    }
    async getUserByEmail(email) {
        return this.get('SELECT * FROM users WHERE email = ?', [email]);
    }
    async getUserById(id) {
        return this.get('SELECT * FROM users WHERE id = ?', [id]);
    }
    async updateUser(id, updates) {
        const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
        const values = Object.values(updates);
        await this.run(`UPDATE users SET ${fields}, updatedAt = ? WHERE id = ?`, [...values, new Date().toISOString(), id]);
    }
    // ==================== ORGANIZATION OPERATIONS ====================
    async createOrganization(org) {
        await this.run(`INSERT INTO organizations (id, name, description, ownerId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`, [org.id, org.name, org.description, org.ownerId, new Date().toISOString(), new Date().toISOString()]);
    }
    async getOrganizationById(id) {
        return this.get('SELECT * FROM organizations WHERE id = ?', [id]);
    }
    async getOrganizationsByOwnerId(ownerId) {
        return this.all('SELECT * FROM organizations WHERE ownerId = ? ORDER BY createdAt DESC', [ownerId]);
    }
    async getAllOrganizations(limit = 50, offset = 0) {
        return this.all('SELECT * FROM organizations ORDER BY createdAt DESC LIMIT ? OFFSET ?', [limit, offset]);
    }
    async searchOrganizations(query, limit = 50) {
        return this.all('SELECT * FROM organizations WHERE name LIKE ? OR description LIKE ? ORDER BY createdAt DESC LIMIT ?', [`%${query}%`, `%${query}%`, limit]);
    }
    // ==================== TEAM OPERATIONS ====================
    async createTeam(team) {
        await this.run(`INSERT INTO teams (id, name, description, organizationId, leaderId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`, [team.id, team.name, team.description, team.organizationId, team.leaderId, new Date().toISOString(), new Date().toISOString()]);
    }
    async getTeamById(id) {
        return this.get('SELECT * FROM teams WHERE id = ?', [id]);
    }
    async getTeamsByOrganizationId(orgId, limit = 50, offset = 0) {
        return this.all('SELECT * FROM teams WHERE organizationId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?', [orgId, limit, offset]);
    }
    async searchTeams(query, limit = 50) {
        return this.all('SELECT * FROM teams WHERE name LIKE ? OR description LIKE ? ORDER BY createdAt DESC LIMIT ?', [`%${query}%`, `%${query}%`, limit]);
    }
    // ==================== ACTIVITY OPERATIONS ====================
    async createActivity(activity) {
        await this.run(`INSERT INTO activities (id, userId, action, resource, details, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`, [activity.id, activity.userId, activity.action, activity.resource, JSON.stringify(activity.details), new Date().toISOString()]);
    }
    async getActivitiesByUserId(userId, limit = 50, offset = 0) {
        return this.all('SELECT * FROM activities WHERE userId = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?', [userId, limit, offset]);
    }
    async getActivitiesByResource(resource, limit = 50, offset = 0) {
        return this.all('SELECT * FROM activities WHERE resource = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?', [resource, limit, offset]);
    }
    async getAllActivities(limit = 50, offset = 0) {
        return this.all('SELECT * FROM activities ORDER BY timestamp DESC LIMIT ? OFFSET ?', [limit, offset]);
    }
    // ==================== MEMBER OPERATIONS ====================
    async addMember(member) {
        await this.run(`INSERT INTO members (id, userId, organizationId, teamId, role, joinedAt)
       VALUES (?, ?, ?, ?, ?, ?)`, [member.id, member.userId, member.organizationId, member.teamId, member.role, new Date().toISOString()]);
    }
    async getMembersByOrganizationId(orgId) {
        return this.all('SELECT * FROM members WHERE organizationId = ?', [orgId]);
    }
    async getMembersByTeamId(teamId) {
        return this.all('SELECT * FROM members WHERE teamId = ?', [teamId]);
    }
    async updateMemberRole(userId, orgId, role) {
        await this.run('UPDATE members SET role = ? WHERE userId = ? AND organizationId = ?', [role, userId, orgId]);
    }
}
exports.default = new DatabaseService();
//# sourceMappingURL=database.js.map