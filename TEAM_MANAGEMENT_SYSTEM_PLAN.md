# 🎯 TEAM MANAGEMENT SYSTEM - COMPREHENSIVE PLAN

**Date:** November 20, 2025, 8:30 PM UTC+05:30  
**Status:** 📋 **PLANNING PHASE**

---

## 🎯 OBJECTIVE

Build a comprehensive team management system where:
- **Admin (Owner)** has full control over the organization
- **Team Leaders** can manage their teams and assign tasks
- **Team Members** have their own Founder OS workspace
- Proper user authentication and role-based access control (RBAC)
- Task assignment and request escalation workflows

---

## 📊 CURRENT STATE ANALYSIS

### **✅ What Already Exists:**

1. **Basic Team Management UI** (`FounderOSMaster.tsx`)
   - Teams list
   - Team members list
   - Add/Delete teams
   - Add/Delete members

2. **Database Schema** (`database-schema.sql`)
   - `users` table
   - `organizations` table
   - `teams` table
   - `members` table
   - `roles` table

3. **Authentication System**
   - Login/Register pages
   - Token-based auth
   - Protected routes

4. **RBAC Foundation**
   - Roles table exists
   - Permissions structure

### **❌ What's Missing:**

1. **User Login System**
   - No proper login flow
   - No session management
   - No user context

2. **Role-Based Access Control**
   - No role enforcement
   - No permission checks
   - No UI based on roles

3. **Multi-User Founder OS**
   - All users see same data
   - No user-specific workspaces
   - No data isolation

4. **Task Assignment System**
   - Can't assign tasks to team members
   - No task ownership tracking
   - No assignment notifications

5. **Request Escalation**
   - Team Leaders can't raise requests to Admin
   - No approval workflow
   - No request routing

---

## 🏗️ SYSTEM ARCHITECTURE

### **User Hierarchy:**

```
┌─────────────────────────────────────┐
│         ADMIN (Owner)               │
│  - Full system access               │
│  - Manage all teams                 │
│  - Approve/reject requests          │
│  - View all data                    │
└──────────────┬──────────────────────┘
               │
               ├──────────────────────┐
               │                      │
    ┌──────────▼──────────┐  ┌───────▼──────────┐
    │   TEAM LEADER 1     │  │  TEAM LEADER 2   │
    │  - Manage team      │  │  - Manage team   │
    │  - Assign tasks     │  │  - Assign tasks  │
    │  - Raise requests   │  │  - Raise requests│
    └──────────┬──────────┘  └───────┬──────────┘
               │                     │
       ┌───────┴────────┐    ┌──────┴────────┐
       │                │    │               │
  ┌────▼────┐   ┌──────▼────┐  ┌────▼────┐
  │ Member  │   │  Member   │  │ Member  │
  │ 1.1     │   │  1.2      │  │  2.1    │
  └─────────┘   └───────────┘  └─────────┘
```

### **Data Isolation:**

Each user has their own:
- **Tasks** - filtered by `user_id`
- **Meetings** - filtered by `user_id` or attendees
- **Commitments** - filtered by `user_id`
- **Time Blocks** - filtered by `user_id`
- **Requests** - filtered by `user_id` (created by) or assigned to

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### **1. User Login Flow:**

```
User enters credentials
    ↓
Backend validates
    ↓
Generate JWT token
    ↓
Store user info + role in token
    ↓
Frontend stores token
    ↓
Every API call includes token
    ↓
Backend validates token + permissions
```

### **2. Role Definitions:**

| Role | ID | Permissions |
|------|-----|-------------|
| **Admin** | `admin` | All permissions |
| **Team Leader** | `team_leader` | Manage team, assign tasks, raise requests |
| **Member** | `member` | View own data, complete tasks |

### **3. Permission Matrix:**

| Action | Admin | Team Leader | Member |
|--------|-------|-------------|--------|
| Create Team | ✅ | ❌ | ❌ |
| Delete Team | ✅ | ❌ | ❌ |
| Add Team Member | ✅ | ✅ (own team) | ❌ |
| Remove Team Member | ✅ | ✅ (own team) | ❌ |
| Assign Task to Anyone | ✅ | ✅ (team only) | ❌ |
| View All Tasks | ✅ | ✅ (team only) | ❌ (own only) |
| Approve Requests | ✅ | ❌ | ❌ |
| Raise Request | ✅ | ✅ | ✅ |
| View All Meetings | ✅ | ✅ (team only) | ❌ (own only) |
| Create Meeting | ✅ | ✅ | ✅ |

---

## 📋 DATABASE SCHEMA UPDATES

### **1. Update Users Table:**

```sql
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'member';
ALTER TABLE users ADD COLUMN org_id TEXT;
ALTER TABLE users ADD COLUMN team_id TEXT;
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT 1;
ALTER TABLE users ADD COLUMN last_login DATETIME;
```

### **2. Update Tasks Table:**

```sql
ALTER TABLE tasks ADD COLUMN assigned_to TEXT;
ALTER TABLE tasks ADD COLUMN assigned_by TEXT;
ALTER TABLE tasks ADD COLUMN assigned_at DATETIME;
```

### **3. Update Meetings Table:**

```sql
ALTER TABLE meetings ADD COLUMN attendees_json TEXT;
-- Store as JSON array: ["user-001", "user-002"]
```

### **4. Update Requests Table:**

```sql
ALTER TABLE requests ADD COLUMN assigned_to TEXT;
ALTER TABLE requests ADD COLUMN approved_by TEXT;
ALTER TABLE requests ADD COLUMN approved_at DATETIME;
ALTER TABLE requests ADD COLUMN approval_status TEXT DEFAULT 'pending';
-- Status: pending, approved, rejected
```

---

## 🎨 UI/UX DESIGN

### **1. Login Page Enhancements:**

- Email + Password
- "Remember Me" checkbox
- Forgot Password link
- Role-based redirect after login

### **2. Dashboard Personalization:**

**Admin Dashboard:**
- Overview of all teams
- Pending requests (from all users)
- System-wide metrics
- Team performance

**Team Leader Dashboard:**
- Team overview
- Team member tasks
- Team meetings
- Pending requests from team

**Member Dashboard:**
- Personal tasks
- Personal meetings
- Personal commitments
- My requests

### **3. Navigation Updates:**

Show/hide menu items based on role:
- Admin: All tabs visible
- Team Leader: All except system settings
- Member: Personal tabs only

### **4. Team Management Page:**

**Admin View:**
```
┌─────────────────────────────────────────┐
│  Teams                                  │
│  ┌─────────────┐  ┌─────────────┐      │
│  │ Engineering │  │ Marketing   │      │
│  │ 5 members   │  │ 3 members   │      │
│  └─────────────┘  └─────────────┘      │
│                                         │
│  Team Members (Engineering)             │
│  ┌─────────────────────────────────┐   │
│  │ John Doe (Team Leader)          │   │
│  │ jane@example.com (Member)       │   │
│  │ bob@example.com (Member)        │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Team Leader View:**
```
┌─────────────────────────────────────────┐
│  My Team (Engineering)                  │
│  ┌─────────────────────────────────┐   │
│  │ jane@example.com (Member)       │   │
│  │ Tasks: 5 | Completed: 3         │   │
│  │ [Assign Task] [View Profile]    │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │ bob@example.com (Member)        │   │
│  │ Tasks: 3 | Completed: 2         │   │
│  │ [Assign Task] [View Profile]    │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 🔧 IMPLEMENTATION PLAN

### **PHASE 1: Authentication & User Context** (2-3 hours)

1. **Update Login System**
   - Add role to JWT token
   - Store user context in React Context
   - Add user info to localStorage

2. **Create User Context Provider**
   ```typescript
   interface UserContext {
     user: User | null;
     role: 'admin' | 'team_leader' | 'member';
     orgId: string;
     teamId: string;
     login: (email, password) => Promise<void>;
     logout: () => void;
   }
   ```

3. **Update API Calls**
   - Add user_id filter to all queries
   - Add role-based permission checks

### **PHASE 2: Role-Based Access Control** (2-3 hours)

1. **Create Permission Middleware**
   ```typescript
   const requireRole = (allowedRoles: string[]) => {
     // Check if user has required role
   }
   ```

2. **Update UI Components**
   - Show/hide based on role
   - Disable actions based on permissions

3. **Backend Permission Checks**
   - Validate role on every API call
   - Return 403 if unauthorized

### **PHASE 3: Multi-User Data Isolation** (3-4 hours)

1. **Update All Queries**
   - Tasks: `WHERE user_id = ? OR assigned_to = ?`
   - Meetings: `WHERE user_id = ? OR attendees LIKE ?`
   - Commitments: `WHERE user_id = ?`

2. **Add User Filter to Frontend**
   - Filter data by current user
   - Show assigned tasks separately

3. **Test Data Isolation**
   - Login as different users
   - Verify data separation

### **PHASE 4: Task Assignment System** (2-3 hours)

1. **Add "Assign To" Field**
   - Dropdown with team members
   - Only show if Team Leader/Admin

2. **Create Assignment API**
   ```typescript
   POST /api/v1/tasks/:taskId/assign
   {
     assigned_to: "user-002",
     due_at: "2025-11-25"
   }
   ```

3. **Show Assigned Tasks**
   - "Assigned to Me" section
   - "Assigned by Me" section

### **PHASE 5: Request Escalation** (2-3 hours)

1. **Add Request Approval Workflow**
   ```typescript
   POST /api/v1/requests/:requestId/approve
   {
     status: "approved" | "rejected",
     notes: "Approval notes"
   }
   ```

2. **Admin Approval Page**
   - List pending requests
   - Approve/Reject buttons
   - Add notes

3. **Notification System**
   - Email on request approval
   - In-app notification

### **PHASE 6: Team Leader Features** (2-3 hours)

1. **Team Dashboard**
   - Team member list
   - Team tasks overview
   - Team meetings

2. **Assign Tasks to Team**
   - Select team member
   - Set due date
   - Add notes

3. **Raise Request to Admin**
   - Request form
   - Escalation to admin
   - Track status

### **PHASE 7: Testing & Polish** (2-3 hours)

1. **End-to-End Testing**
   - Test as Admin
   - Test as Team Leader
   - Test as Member

2. **Bug Fixes**
   - Fix data leaks
   - Fix permission issues

3. **UI Polish**
   - Improve error messages
   - Add loading states
   - Add success toasts

---

## 🧪 TESTING SCENARIOS

### **Scenario 1: Admin Creates Team**
```
1. Login as Admin
2. Go to Team Management
3. Click "Add Team"
4. Enter team name "Engineering"
5. Add members
6. Verify team created
```

### **Scenario 2: Team Leader Assigns Task**
```
1. Login as Team Leader
2. Go to Personal Productivity
3. Create new task
4. Assign to team member
5. Verify member sees task
```

### **Scenario 3: Member Completes Task**
```
1. Login as Member
2. Go to Personal Productivity
3. See assigned task
4. Mark as complete
5. Verify Team Leader sees completion
```

### **Scenario 4: Team Leader Raises Request**
```
1. Login as Team Leader
2. Go to Interruption Firewall
3. Create request
4. Escalate to Admin
5. Login as Admin
6. Approve request
7. Verify Team Leader notified
```

---

## 📊 ESTIMATED TIMELINE

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1: Auth & Context | 2-3 hours | HIGH |
| Phase 2: RBAC | 2-3 hours | HIGH |
| Phase 3: Data Isolation | 3-4 hours | HIGH |
| Phase 4: Task Assignment | 2-3 hours | MEDIUM |
| Phase 5: Request Escalation | 2-3 hours | MEDIUM |
| Phase 6: Team Leader Features | 2-3 hours | MEDIUM |
| Phase 7: Testing & Polish | 2-3 hours | HIGH |

**Total: 15-21 hours (2-3 days)**

---

## 🎯 SUCCESS CRITERIA

- ✅ Users can login with email/password
- ✅ Each user has their own Founder OS workspace
- ✅ Admin can manage all teams and users
- ✅ Team Leaders can manage their team
- ✅ Team Leaders can assign tasks to members
- ✅ Members can see only their own data
- ✅ Request escalation works (Member → Team Leader → Admin)
- ✅ All data is properly isolated by user
- ✅ No data leaks between users
- ✅ UI adapts based on user role

---

## 📝 NEXT STEPS

1. **Immediate:** Start Phase 1 - Authentication & User Context
2. **Then:** Implement RBAC (Phase 2)
3. **Then:** Data isolation (Phase 3)
4. **Finally:** Task assignment and request escalation

---

**Plan Created:** November 20, 2025, 8:30 PM UTC+05:30  
**Status:** 📋 **READY TO IMPLEMENT**
