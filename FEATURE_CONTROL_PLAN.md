# Feature Control System - Implementation Plan

## Overview
Single-organization app with team-level feature control and role-based permissions.

## Architecture
```
Organization (single - org-001)
    └── Teams (4 teams)
            ├── Team Features (what features this team can access)
            └── Members
                    └── User Roles → Permissions
```

---

## Database Schema

### New Tables

```sql
-- 1. Features available in the system
CREATE TABLE features (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT,
    description TEXT,
    category TEXT,
    icon TEXT,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Roles
CREATE TABLE roles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT,
    description TEXT,
    level INTEGER DEFAULT 0,  -- hierarchy: 0=viewer, 10=member, 20=team_leader, 30=admin, 40=owner
    is_system BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Permissions (granular actions per feature)
CREATE TABLE permissions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT,
    description TEXT,
    feature_id TEXT,
    FOREIGN KEY (feature_id) REFERENCES features(id)
);

-- 4. Role-Permission mapping
CREATE TABLE role_permissions (
    id TEXT PRIMARY KEY,
    role_id TEXT NOT NULL,
    permission_id TEXT NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (permission_id) REFERENCES permissions(id),
    UNIQUE(role_id, permission_id)
);

-- 5. Team feature access (enable/disable features per team)
CREATE TABLE team_features (
    id TEXT PRIMARY KEY,
    team_id TEXT NOT NULL,
    feature_id TEXT NOT NULL,
    is_enabled BOOLEAN DEFAULT 1,
    enabled_by TEXT,
    enabled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id),
    FOREIGN KEY (feature_id) REFERENCES features(id),
    UNIQUE(team_id, feature_id)
);

-- 6. User roles assignment
CREATE TABLE user_roles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    role_id TEXT NOT NULL,
    team_id TEXT,  -- NULL = organization-wide role
    assigned_by TEXT,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (role_id) REFERENCES roles(id),
    FOREIGN KEY (team_id) REFERENCES teams(id),
    UNIQUE(user_id, role_id, team_id)
);
```

---

## Default Data

### Features
| ID | Name | Display Name | Category |
|----|------|--------------|----------|
| feat-001 | meetings | Meeting OS | collaboration |
| feat-002 | tasks | Task Management | productivity |
| feat-003 | requests | Request Queue | collaboration |
| feat-004 | timeblocks | Time Blocks | productivity |
| feat-005 | commitments | Commitments | productivity |
| feat-006 | kb | Knowledge Base | collaboration |
| feat-007 | teams | Team Management | admin |
| feat-008 | analytics | Analytics | reporting |
| feat-009 | calendar | Calendar | productivity |

### Roles
| ID | Name | Display Name | Level |
|----|------|--------------|-------|
| role-001 | owner | Owner | 40 |
| role-002 | admin | Admin | 30 |
| role-003 | team_leader | Team Leader | 20 |
| role-004 | member | Member | 10 |
| role-005 | viewer | Viewer | 0 |

### Permissions per Feature
| Feature | Permissions |
|---------|-------------|
| meetings | view, create, edit, delete, start, end, add_decision, add_action |
| tasks | view, create, edit, delete, assign, complete |
| requests | view, create, approve, reject, route |
| timeblocks | view, create, edit, delete |
| commitments | view, create, edit, delete, complete |
| kb | view, create, edit, delete, publish |
| teams | view, create, edit, delete, add_member, remove_member |
| analytics | view_own, view_team, view_all, export |
| calendar | view, create, edit, delete |

### Role-Permission Matrix
| Permission | Owner | Admin | Team Leader | Member | Viewer |
|------------|-------|-------|-------------|--------|--------|
| *.view | ✅ | ✅ | ✅ | ✅ | ✅ |
| *.create | ✅ | ✅ | ✅ | ✅ | ❌ |
| *.edit | ✅ | ✅ | ✅ | Own only | ❌ |
| *.delete | ✅ | ✅ | Team only | Own only | ❌ |
| teams.* | ✅ | ✅ | Own team | ❌ | ❌ |
| analytics.view_all | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## API Endpoints

### Features
```
GET    /api/v1/features              # List all features
GET    /api/v1/features/:id          # Get feature details
PUT    /api/v1/features/:id          # Update feature (admin)
```

### Roles
```
GET    /api/v1/roles                 # List all roles
GET    /api/v1/roles/:id             # Get role with permissions
POST   /api/v1/roles                 # Create custom role (admin)
PUT    /api/v1/roles/:id             # Update role (admin)
DELETE /api/v1/roles/:id             # Delete custom role (admin)
```

### Permissions
```
GET    /api/v1/permissions           # List all permissions
GET    /api/v1/roles/:id/permissions # Get role permissions
PUT    /api/v1/roles/:id/permissions # Update role permissions (admin)
```

### Team Features
```
GET    /api/v1/teams/:id/features    # Get team's enabled features
PUT    /api/v1/teams/:id/features    # Update team features (admin)
```

### User Roles
```
GET    /api/v1/users/:id/roles       # Get user's roles
POST   /api/v1/users/:id/roles       # Assign role to user
DELETE /api/v1/users/:id/roles/:rid  # Remove role from user
```

### Permission Check
```
GET    /api/v1/auth/permissions      # Get current user's permissions
POST   /api/v1/auth/can              # Check if user can perform action
```

---

## UI Components

### 1. Team Settings → Features Tab
- Toggle features on/off for the team
- Show which features are enabled
- Only visible to Team Leaders and above

### 2. Settings → Roles & Permissions
- View all roles
- Create custom roles
- Edit role permissions (matrix view)
- Only visible to Admins

### 3. Team Management → Member Role
- Assign/change role when adding member
- Show role badge on member card

### 4. User Profile → My Permissions
- View assigned roles
- View effective permissions

---

## Implementation Steps

### Phase 1: Database (Day 1)
- [x] Plan schema
- [ ] Create migration script
- [ ] Run migration
- [ ] Seed default data

### Phase 2: Backend API (Day 1-2)
- [ ] Create db-helper functions
- [ ] Create feature routes
- [ ] Create role routes
- [ ] Create permission routes
- [ ] Create team-features routes
- [ ] Create user-roles routes
- [ ] Add permission middleware

### Phase 3: Frontend UI (Day 2-3)
- [ ] Team Features toggle UI
- [ ] Role management UI
- [ ] Permission matrix editor
- [ ] User role assignment UI

### Phase 4: Integration (Day 3)
- [ ] Add permission checks to existing routes
- [ ] Hide UI elements based on permissions
- [ ] Testing

---

## Current Users & Roles

| User | Current Role | New Role |
|------|--------------|----------|
| Sahil Khanna (user-001) | admin | owner |
| John Smith (user-002) | team_leader | team_leader |
| Sarah Johnson (user-003) | member | member |
| Mike Wilson (user-004) | member | member |
| Emily Davis (user-005) | team_leader | team_leader |

---

## Status: READY TO IMPLEMENT
