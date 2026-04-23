/**
 * Database Service - SQLite Integration
 * Handles all database operations for Lapaas OS
 */

import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

// Type definitions for sqlite3
type Database = any;
type Error = any;
type Row = any;
type Rows = any;

const DB_PATH = path.join(__dirname, '../../lapaas.db');

class DatabaseService {
  private db: sqlite3.Database | null = null;

  /**
   * Initialize database connection
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err: Error) => {
        if (err) {
          console.error('Database connection error:', err);
          reject(err);
        } else {
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
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

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

      // Daily Commitments table
      `CREATE TABLE IF NOT EXISTS daily_commitments (
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
      'CREATE INDEX IF NOT EXISTS idx_daily_commitments_org_id ON daily_commitments(org_id)',
      'CREATE INDEX IF NOT EXISTS idx_daily_commitments_user_id ON daily_commitments(user_id)',
      'CREATE INDEX IF NOT EXISTS idx_daily_commitments_start_date ON daily_commitments(start_date)',
    ];

    for (const index of indexes) {
      await this.run(index);
    }

    console.log('✅ Database tables created');
  }

  /**
   * Run a query
   */
  async run(sql: string, params: any[] = []): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(sql, params, (err: Error) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  /**
   * Get a single row
   */
  async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.get(sql, params, (err: Error, row: Row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * Get all rows
   */
  async all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.all(sql, params, (err: Error, rows: Rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve();
        return;
      }

      this.db.close((err: Error) => {
        if (err) reject(err);
        else {
          console.log('✅ Database connection closed');
          resolve();
        }
      });
    });
  }

  // ==================== USER OPERATIONS ====================

  async createUser(user: any): Promise<void> {
    await this.run(
      `INSERT INTO users (id, email, password_hash, firstName, lastName, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [user.id, user.email, user.password_hash, user.firstName, user.lastName, new Date().toISOString(), new Date().toISOString()]
    );
  }

  async getUserByEmail(email: string): Promise<any> {
    return this.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  async getUserById(id: string): Promise<any> {
    return this.get('SELECT * FROM users WHERE id = ?', [id]);
  }

  async updateUser(id: string, updates: any): Promise<void> {
    const fields = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = Object.values(updates);
    await this.run(`UPDATE users SET ${fields}, updatedAt = ? WHERE id = ?`, [...values, new Date().toISOString(), id]);
  }

  // ==================== ORGANIZATION OPERATIONS ====================

  async createOrganization(org: any): Promise<void> {
    await this.run(
      `INSERT INTO organizations (id, name, description, ownerId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [org.id, org.name, org.description, org.ownerId, new Date().toISOString(), new Date().toISOString()]
    );
  }

  async getOrganizationById(id: string): Promise<any> {
    return this.get('SELECT * FROM organizations WHERE id = ?', [id]);
  }

  async getOrganizationsByOwnerId(ownerId: string): Promise<any[]> {
    return this.all('SELECT * FROM organizations WHERE ownerId = ? ORDER BY createdAt DESC', [ownerId]);
  }

  async getAllOrganizations(limit: number = 50, offset: number = 0): Promise<any[]> {
    return this.all('SELECT * FROM organizations ORDER BY createdAt DESC LIMIT ? OFFSET ?', [limit, offset]);
  }

  async searchOrganizations(query: string, limit: number = 50): Promise<any[]> {
    return this.all(
      'SELECT * FROM organizations WHERE name LIKE ? OR description LIKE ? ORDER BY createdAt DESC LIMIT ?',
      [`%${query}%`, `%${query}%`, limit]
    );
  }

  // ==================== TEAM OPERATIONS ====================

  async createTeam(team: any): Promise<void> {
    await this.run(
      `INSERT INTO teams (id, name, description, organizationId, leaderId, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [team.id, team.name, team.description, team.organizationId, team.leaderId, new Date().toISOString(), new Date().toISOString()]
    );
  }

  async getTeamById(id: string): Promise<any> {
    return this.get('SELECT * FROM teams WHERE id = ?', [id]);
  }

  async getTeamsByOrganizationId(orgId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    return this.all('SELECT * FROM teams WHERE organizationId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?', [orgId, limit, offset]);
  }

  async searchTeams(query: string, limit: number = 50): Promise<any[]> {
    return this.all(
      'SELECT * FROM teams WHERE name LIKE ? OR description LIKE ? ORDER BY createdAt DESC LIMIT ?',
      [`%${query}%`, `%${query}%`, limit]
    );
  }

  // ==================== ACTIVITY OPERATIONS ====================

  async createActivity(activity: any): Promise<void> {
    await this.run(
      `INSERT INTO activities (id, userId, action, resource, details, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [activity.id, activity.userId, activity.action, activity.resource, JSON.stringify(activity.details), new Date().toISOString()]
    );
  }

  async getActivitiesByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    return this.all('SELECT * FROM activities WHERE userId = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?', [userId, limit, offset]);
  }

  async getActivitiesByResource(resource: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    return this.all('SELECT * FROM activities WHERE resource = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?', [resource, limit, offset]);
  }

  async getAllActivities(limit: number = 50, offset: number = 0): Promise<any[]> {
    return this.all('SELECT * FROM activities ORDER BY timestamp DESC LIMIT ? OFFSET ?', [limit, offset]);
  }

  // ==================== MEMBER OPERATIONS ====================

  async addMember(member: any): Promise<void> {
    await this.run(
      `INSERT INTO members (id, userId, organizationId, teamId, role, joinedAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [member.id, member.userId, member.organizationId, member.teamId, member.role, new Date().toISOString()]
    );
  }

  async getMembersByOrganizationId(orgId: string): Promise<any[]> {
    return this.all('SELECT * FROM members WHERE organizationId = ?', [orgId]);
  }

  async getMembersByTeamId(teamId: string): Promise<any[]> {
    return this.all('SELECT * FROM members WHERE teamId = ?', [teamId]);
  }

  async updateMemberRole(userId: string, orgId: string, role: string): Promise<void> {
    await this.run(
      'UPDATE members SET role = ? WHERE userId = ? AND organizationId = ?',
      [role, userId, orgId]
    );
  }

  // ==================== DAILY COMMITMENTS OPERATIONS ====================

  async createDailyCommitment(commitment: any): Promise<void> {
    await this.run(
      `INSERT INTO daily_commitments (id, title, start_time, end_time, start_date, end_date, effort_minutes, recurring, status, org_id, user_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        commitment.id,
        commitment.title,
        commitment.start_time,
        commitment.end_time,
        commitment.start_date,
        commitment.end_date || null,
        commitment.effort_minutes || 60,
        commitment.recurring !== false ? 1 : 0,
        commitment.status || 'active',
        commitment.org_id,
        commitment.user_id,
        new Date().toISOString(),
        new Date().toISOString(),
      ]
    );
  }

  async getDailyCommitmentById(id: string): Promise<any> {
    return this.get('SELECT * FROM daily_commitments WHERE id = ?', [id]);
  }

  async getDailyCommitmentsByOrgId(orgId: string): Promise<any[]> {
    return this.all(
      'SELECT * FROM daily_commitments WHERE org_id = ? ORDER BY start_date DESC, start_time ASC',
      [orgId]
    );
  }

  async getDailyCommitmentsByUserId(userId: string): Promise<any[]> {
    return this.all(
      'SELECT * FROM daily_commitments WHERE user_id = ? ORDER BY start_date DESC, start_time ASC',
      [userId]
    );
  }

  async getDailyCommitmentsByOrgAndUser(orgId: string, userId: string): Promise<any[]> {
    return this.all(
      'SELECT * FROM daily_commitments WHERE org_id = ? AND user_id = ? ORDER BY start_date DESC, start_time ASC',
      [orgId, userId]
    );
  }

  async getDailyCommitmentsByDateRange(orgId: string, startDate: string, endDate: string): Promise<any[]> {
    return this.all(
      'SELECT * FROM daily_commitments WHERE org_id = ? AND start_date >= ? AND start_date <= ? ORDER BY start_date ASC, start_time ASC',
      [orgId, startDate, endDate]
    );
  }

  async updateDailyCommitment(id: string, updates: any): Promise<void> {
    const fields = Object.keys(updates)
      .filter(k => k !== 'id')
      .map(k => `${k} = ?`)
      .join(', ');
    const values = Object.values(updates).filter((v, i) => Object.keys(updates)[i] !== 'id');
    await this.run(
      `UPDATE daily_commitments SET ${fields}, updated_at = ? WHERE id = ?`,
      [...values, new Date().toISOString(), id]
    );
  }

  async deleteDailyCommitment(id: string): Promise<void> {
    await this.run('DELETE FROM daily_commitments WHERE id = ?', [id]);
  }

  async deleteDailyCommitmentsByOrgId(orgId: string): Promise<void> {
    await this.run('DELETE FROM daily_commitments WHERE org_id = ?', [orgId]);
  }
}

export default new DatabaseService();
