/**
 * Feature Control Migration Script
 * Creates tables for features, roles, permissions, and their relationships
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'lapaas.db');
const db = new sqlite3.Database(dbPath);

const runMigration = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🚀 Starting Feature Control Migration...\n');

      // 1. Features table
      db.run(`
        CREATE TABLE IF NOT EXISTS features (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          display_name TEXT,
          description TEXT,
          category TEXT,
          icon TEXT,
          is_active BOOLEAN DEFAULT 1,
          sort_order INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating features table:', err);
        else console.log('✅ Created features table');
      });

      // 2. Roles table
      db.run(`
        CREATE TABLE IF NOT EXISTS roles (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          display_name TEXT,
          description TEXT,
          level INTEGER DEFAULT 0,
          color TEXT,
          is_system BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) console.error('Error creating roles table:', err);
        else console.log('✅ Created roles table');
      });

      // 3. Permissions table
      db.run(`
        CREATE TABLE IF NOT EXISTS permissions (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          display_name TEXT,
          description TEXT,
          feature_id TEXT,
          FOREIGN KEY (feature_id) REFERENCES features(id)
        )
      `, (err) => {
        if (err) console.error('Error creating permissions table:', err);
        else console.log('✅ Created permissions table');
      });

      // 4. Role-Permission mapping
      db.run(`
        CREATE TABLE IF NOT EXISTS role_permissions (
          id TEXT PRIMARY KEY,
          role_id TEXT NOT NULL,
          permission_id TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
          FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
          UNIQUE(role_id, permission_id)
        )
      `, (err) => {
        if (err) console.error('Error creating role_permissions table:', err);
        else console.log('✅ Created role_permissions table');
      });

      // 5. Team features (enable/disable features per team)
      db.run(`
        CREATE TABLE IF NOT EXISTS team_features (
          id TEXT PRIMARY KEY,
          team_id TEXT NOT NULL,
          feature_id TEXT NOT NULL,
          is_enabled BOOLEAN DEFAULT 1,
          enabled_by TEXT,
          enabled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
          FOREIGN KEY (feature_id) REFERENCES features(id) ON DELETE CASCADE,
          UNIQUE(team_id, feature_id)
        )
      `, (err) => {
        if (err) console.error('Error creating team_features table:', err);
        else console.log('✅ Created team_features table');
      });

      // 6. User roles assignment
      db.run(`
        CREATE TABLE IF NOT EXISTS user_roles (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          role_id TEXT NOT NULL,
          team_id TEXT,
          assigned_by TEXT,
          assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
          FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
          UNIQUE(user_id, role_id, team_id)
        )
      `, (err) => {
        if (err) console.error('Error creating user_roles table:', err);
        else console.log('✅ Created user_roles table');
      });

      // Create indexes
      db.run(`CREATE INDEX IF NOT EXISTS idx_permissions_feature ON permissions(feature_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON role_permissions(role_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_role_permissions_perm ON role_permissions(permission_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_team_features_team ON team_features(team_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_team_features_feature ON team_features(feature_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_user_roles_team ON user_roles(team_id)`, (err) => {
        console.log('✅ Created indexes');
        console.log('\n✅ Feature Control Migration Complete!\n');
        resolve();
      });
    });
  });
};

const seedData = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      console.log('🌱 Seeding Feature Control Data...\n');

      // Seed Features
      const features = [
        ['feat-001', 'meetings', 'Meeting OS', 'Agenda builder, decisions, and action tracking', 'collaboration', 'Users', 1, 1],
        ['feat-002', 'tasks', 'Task Management', 'Create and manage tasks with priorities', 'productivity', 'CheckSquare', 1, 2],
        ['feat-003', 'requests', 'Request Queue', 'Structured request intake and routing', 'collaboration', 'Inbox', 1, 3],
        ['feat-004', 'timeblocks', 'Time Blocks', 'Plan your week with time blocking', 'productivity', 'Clock', 1, 4],
        ['feat-005', 'commitments', 'Commitments', 'Daily top-3 commitments tracking', 'productivity', 'Target', 1, 5],
        ['feat-006', 'kb', 'Knowledge Base', 'SOPs, FAQs, and documentation', 'collaboration', 'Book', 1, 6],
        ['feat-007', 'teams', 'Team Management', 'Manage teams and members', 'admin', 'Users', 1, 7],
        ['feat-008', 'analytics', 'Analytics', 'Reports and insights', 'reporting', 'BarChart', 1, 8],
        ['feat-009', 'calendar', 'Calendar', 'Calendar view and events', 'productivity', 'Calendar', 1, 9],
      ];

      const featureStmt = db.prepare(`INSERT OR IGNORE INTO features (id, name, display_name, description, category, icon, is_active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
      features.forEach(f => featureStmt.run(f));
      featureStmt.finalize();
      console.log('✅ Seeded 9 features');

      // Seed Roles
      const roles = [
        ['role-001', 'owner', 'Owner', 'Full access to all features', 40, '#8B5CF6', 1],
        ['role-002', 'admin', 'Admin', 'Administrative access', 30, '#EF4444', 1],
        ['role-003', 'team_leader', 'Team Leader', 'Manage team and members', 20, '#F59E0B', 1],
        ['role-004', 'member', 'Member', 'Standard team member', 10, '#10B981', 1],
        ['role-005', 'viewer', 'Viewer', 'Read-only access', 0, '#6B7280', 1],
      ];

      const roleStmt = db.prepare(`INSERT OR IGNORE INTO roles (id, name, display_name, description, level, color, is_system) VALUES (?, ?, ?, ?, ?, ?, ?)`);
      roles.forEach(r => roleStmt.run(r));
      roleStmt.finalize();
      console.log('✅ Seeded 5 roles');

      // Seed Permissions
      const permissions = [
        // Meetings
        ['perm-001', 'meetings.view', 'View Meetings', 'View meeting list and details', 'feat-001'],
        ['perm-002', 'meetings.create', 'Create Meetings', 'Create new meetings', 'feat-001'],
        ['perm-003', 'meetings.edit', 'Edit Meetings', 'Edit meeting details', 'feat-001'],
        ['perm-004', 'meetings.delete', 'Delete Meetings', 'Delete meetings', 'feat-001'],
        ['perm-005', 'meetings.start', 'Start Meetings', 'Start meeting timer', 'feat-001'],
        ['perm-006', 'meetings.add_decision', 'Add Decisions', 'Add decisions to meetings', 'feat-001'],
        ['perm-007', 'meetings.add_action', 'Add Actions', 'Add action items to meetings', 'feat-001'],
        
        // Tasks
        ['perm-010', 'tasks.view', 'View Tasks', 'View task list and details', 'feat-002'],
        ['perm-011', 'tasks.create', 'Create Tasks', 'Create new tasks', 'feat-002'],
        ['perm-012', 'tasks.edit', 'Edit Tasks', 'Edit task details', 'feat-002'],
        ['perm-013', 'tasks.delete', 'Delete Tasks', 'Delete tasks', 'feat-002'],
        ['perm-014', 'tasks.assign', 'Assign Tasks', 'Assign tasks to others', 'feat-002'],
        ['perm-015', 'tasks.complete', 'Complete Tasks', 'Mark tasks as complete', 'feat-002'],
        
        // Requests
        ['perm-020', 'requests.view', 'View Requests', 'View request queue', 'feat-003'],
        ['perm-021', 'requests.create', 'Create Requests', 'Submit new requests', 'feat-003'],
        ['perm-022', 'requests.approve', 'Approve Requests', 'Approve requests', 'feat-003'],
        ['perm-023', 'requests.reject', 'Reject Requests', 'Reject requests', 'feat-003'],
        ['perm-024', 'requests.route', 'Route Requests', 'Route requests to others', 'feat-003'],
        
        // Time Blocks
        ['perm-030', 'timeblocks.view', 'View Time Blocks', 'View time blocks', 'feat-004'],
        ['perm-031', 'timeblocks.create', 'Create Time Blocks', 'Create time blocks', 'feat-004'],
        ['perm-032', 'timeblocks.edit', 'Edit Time Blocks', 'Edit time blocks', 'feat-004'],
        ['perm-033', 'timeblocks.delete', 'Delete Time Blocks', 'Delete time blocks', 'feat-004'],
        
        // Commitments
        ['perm-040', 'commitments.view', 'View Commitments', 'View commitments', 'feat-005'],
        ['perm-041', 'commitments.create', 'Create Commitments', 'Create commitments', 'feat-005'],
        ['perm-042', 'commitments.edit', 'Edit Commitments', 'Edit commitments', 'feat-005'],
        ['perm-043', 'commitments.delete', 'Delete Commitments', 'Delete commitments', 'feat-005'],
        ['perm-044', 'commitments.complete', 'Complete Commitments', 'Mark as complete', 'feat-005'],
        
        // Knowledge Base
        ['perm-050', 'kb.view', 'View KB', 'View knowledge base articles', 'feat-006'],
        ['perm-051', 'kb.create', 'Create KB Articles', 'Create new articles', 'feat-006'],
        ['perm-052', 'kb.edit', 'Edit KB Articles', 'Edit articles', 'feat-006'],
        ['perm-053', 'kb.delete', 'Delete KB Articles', 'Delete articles', 'feat-006'],
        ['perm-054', 'kb.publish', 'Publish KB Articles', 'Publish articles', 'feat-006'],
        
        // Teams
        ['perm-060', 'teams.view', 'View Teams', 'View teams and members', 'feat-007'],
        ['perm-061', 'teams.create', 'Create Teams', 'Create new teams', 'feat-007'],
        ['perm-062', 'teams.edit', 'Edit Teams', 'Edit team details', 'feat-007'],
        ['perm-063', 'teams.delete', 'Delete Teams', 'Delete teams', 'feat-007'],
        ['perm-064', 'teams.add_member', 'Add Members', 'Add members to teams', 'feat-007'],
        ['perm-065', 'teams.remove_member', 'Remove Members', 'Remove members from teams', 'feat-007'],
        ['perm-066', 'teams.manage_features', 'Manage Team Features', 'Enable/disable features for team', 'feat-007'],
        
        // Analytics
        ['perm-070', 'analytics.view_own', 'View Own Analytics', 'View personal analytics', 'feat-008'],
        ['perm-071', 'analytics.view_team', 'View Team Analytics', 'View team analytics', 'feat-008'],
        ['perm-072', 'analytics.view_all', 'View All Analytics', 'View organization analytics', 'feat-008'],
        ['perm-073', 'analytics.export', 'Export Analytics', 'Export reports', 'feat-008'],
        
        // Calendar
        ['perm-080', 'calendar.view', 'View Calendar', 'View calendar', 'feat-009'],
        ['perm-081', 'calendar.create', 'Create Events', 'Create calendar events', 'feat-009'],
        ['perm-082', 'calendar.edit', 'Edit Events', 'Edit calendar events', 'feat-009'],
        ['perm-083', 'calendar.delete', 'Delete Events', 'Delete calendar events', 'feat-009'],
      ];

      const permStmt = db.prepare(`INSERT OR IGNORE INTO permissions (id, name, display_name, description, feature_id) VALUES (?, ?, ?, ?, ?)`);
      permissions.forEach(p => permStmt.run(p));
      permStmt.finalize();
      console.log(`✅ Seeded ${permissions.length} permissions`);

      // Seed Role-Permission mappings
      // Owner gets all permissions
      const ownerPerms = permissions.map((p, i) => [`rp-owner-${i}`, 'role-001', p[0]]);
      
      // Admin gets all except some owner-only
      const adminPerms = permissions
        .filter(p => !['teams.delete'].includes(p[1]))
        .map((p, i) => [`rp-admin-${i}`, 'role-002', p[0]]);
      
      // Team Leader gets team-relevant permissions
      const teamLeaderPerms = permissions
        .filter(p => !['teams.create', 'teams.delete', 'analytics.view_all', 'analytics.export'].includes(p[1]))
        .map((p, i) => [`rp-tl-${i}`, 'role-003', p[0]]);
      
      // Member gets basic permissions
      const memberPerms = permissions
        .filter(p => p[1].includes('.view') || p[1].includes('.create') || p[1].includes('.complete') || 
                     ['tasks.edit', 'commitments.edit', 'timeblocks.edit'].includes(p[1]))
        .map((p, i) => [`rp-member-${i}`, 'role-004', p[0]]);
      
      // Viewer gets only view permissions
      const viewerPerms = permissions
        .filter(p => p[1].includes('.view'))
        .map((p, i) => [`rp-viewer-${i}`, 'role-005', p[0]]);

      const allRolePerms = [...ownerPerms, ...adminPerms, ...teamLeaderPerms, ...memberPerms, ...viewerPerms];
      
      const rpStmt = db.prepare(`INSERT OR IGNORE INTO role_permissions (id, role_id, permission_id) VALUES (?, ?, ?)`);
      allRolePerms.forEach(rp => rpStmt.run(rp));
      rpStmt.finalize();
      console.log(`✅ Seeded ${allRolePerms.length} role-permission mappings`);

      // Seed Team Features (enable all features for all teams)
      db.all(`SELECT id FROM teams`, [], (err, teams) => {
        if (err || !teams) {
          console.log('⚠️ No teams found, skipping team features');
          return;
        }
        
        const tfStmt = db.prepare(`INSERT OR IGNORE INTO team_features (id, team_id, feature_id, is_enabled, enabled_by) VALUES (?, ?, ?, ?, ?)`);
        let tfCount = 0;
        teams.forEach((team, ti) => {
          features.forEach((feat, fi) => {
            tfStmt.run([`tf-${ti}-${fi}`, team.id, feat[0], 1, 'user-001']);
            tfCount++;
          });
        });
        tfStmt.finalize();
        console.log(`✅ Seeded ${tfCount} team-feature mappings`);
      });

      // Seed User Roles
      const userRoles = [
        ['ur-001', 'user-001', 'role-001', null, 'system'],  // Sahil = Owner
        ['ur-002', 'user-002', 'role-003', 'team-001', 'user-001'],  // John = Team Leader (Engineering)
        ['ur-003', 'user-003', 'role-004', 'team-001', 'user-001'],  // Sarah = Member (Engineering)
        ['ur-004', 'user-004', 'role-004', 'team-002', 'user-001'],  // Mike = Member (Marketing)
        ['ur-005', 'user-005', 'role-003', 'team-003', 'user-001'],  // Emily = Team Leader (Sales)
      ];

      const urStmt = db.prepare(`INSERT OR IGNORE INTO user_roles (id, user_id, role_id, team_id, assigned_by) VALUES (?, ?, ?, ?, ?)`);
      userRoles.forEach(ur => urStmt.run(ur));
      urStmt.finalize((err) => {
        console.log('✅ Seeded 5 user-role assignments');
        console.log('\n✅ Feature Control Seeding Complete!\n');
        resolve();
      });
    });
  });
};

// Run migration and seeding
runMigration()
  .then(() => seedData())
  .then(() => {
    db.close();
    console.log('🎉 All done! Database closed.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Migration failed:', err);
    db.close();
    process.exit(1);
  });
