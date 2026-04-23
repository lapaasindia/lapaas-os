# Module 2: User Management

**Status:** Core | **Priority:** Critical | **Phase:** 1 (Weeks 2-4)

## Quick Links
- [Authentication Module](./M1_AUTHENTICATION.md)
- [Settings Module](./M6_SETTINGS.md)
- [Compliance Module](./M8_COMPLIANCE.md)

---

## 2.1 User Profiles

### Endpoints
```
GET    /users/me               - Get current user
PUT    /users/me               - Update profile
GET    /users/:id              - Get user
POST   /users/me/avatar        - Upload avatar
```

### Database
```sql
users (id, email, first_name, last_name, avatar_url)
user_profiles (id, user_id, bio, company, job_title, timezone, language)
```

### Profile Fields
- Bio (max 500 chars)
- Company (max 100 chars)
- Job Title (max 100 chars)
- Location (max 100 chars)
- Website (URL format)
- Timezone (IANA format)
- Language (ISO 639-1)

---

## 2.2 Organization Management

### Endpoints
```
GET    /organizations          - List organizations
POST   /organizations          - Create organization
GET    /organizations/:id      - Get organization
PUT    /organizations/:id      - Update organization
DELETE /organizations/:id      - Delete organization
```

### Database
```sql
organizations (id, name, slug, logo_url, created_by)
organization_members (id, organization_id, user_id, role)
```

### Organization Fields
- Name (required, 1-255 chars)
- Slug (unique, lowercase, alphanumeric + hyphen)
- Logo URL
- Description
- Website
- Industry
- Company Size
- Timezone

---

## 2.3 Team Management

### Endpoints
```
GET    /teams                  - List teams
POST   /teams                  - Create team
GET    /teams/:id              - Get team
PUT    /teams/:id              - Update team
DELETE /teams/:id              - Delete team
GET    /teams/:id/members      - List members
POST   /teams/:id/members      - Add member
DELETE /teams/:id/members/:uid - Remove member
```

### Database
```sql
teams (id, organization_id, name, description)
team_members (id, team_id, user_id, role)
```

### Team Roles
- Admin - Full team access
- Lead - Manage team members
- Member - Regular member
- Viewer - Read-only access

---

## 2.4 User Invitations

### Endpoints
```
POST   /invitations            - Send invitation
GET    /invitations            - List invitations
POST   /invitations/:id/resend - Resend invitation
DELETE /invitations/:id        - Cancel invitation
POST   /invitations/:id/accept - Accept invitation
```

### Database
```sql
user_invitations (id, organization_id, email, token, expires_at, accepted_at)
```

### Invitation Flow
1. Admin sends invitation
2. Email sent with acceptance link
3. User clicks link
4. User registers or logs in
5. Automatically added to organization

### Email Template
```
Subject: You're invited to [Organization]

Hi [Email],

[Inviter Name] invited you to join [Organization] on Lapaas OS.

[Accept Invitation Button]

This invitation expires in 7 days.
```

---

## 2.5 Activity Logging

### Endpoints
```
GET    /activity-logs          - List activities
GET    /activity-logs/:id      - Get activity
```

### Database
```sql
activity_logs (id, user_id, organization_id, action, resource_type, resource_id, changes, ip_address, created_at)
```

### Logged Actions
- user.created
- user.updated
- user.deleted
- organization.created
- organization.updated
- team.created
- team.updated
- member.added
- member.removed
- role.assigned
- role.removed

### Activity Fields
- User (who performed action)
- Action (what was done)
- Resource (what was affected)
- Changes (before/after values)
- IP Address
- Timestamp

---

## Frontend Components

### Pages
- `/dashboard` - Main dashboard
- `/settings/profile` - Profile settings
- `/settings/organization` - Organization settings
- `/settings/team` - Team management
- `/settings/members` - Member management
- `/settings/invitations` - Invitation management
- `/activity-logs` - Activity history

### Components
- `UserProfile` - User profile card
- `OrganizationForm` - Organization form
- `TeamForm` - Team form
- `MemberList` - Members list
- `InvitationForm` - Invitation form
- `ActivityLog` - Activity log table

---

## Data Relationships

```
User
  ├── Organization (many-to-many via organization_members)
  ├── Team (many-to-many via team_members)
  ├── Invitations (sent/received)
  └── Activity Logs

Organization
  ├── Members (users)
  ├── Teams
  └── Activity Logs

Team
  ├── Members (users)
  └── Organization
```

---

## Permissions

| Action | Admin | Manager | User | Viewer |
|--------|-------|---------|------|--------|
| View members | ✓ | ✓ | ✓ | ✓ |
| Add member | ✓ | ✓ | ✗ | ✗ |
| Remove member | ✓ | ✓ | ✗ | ✗ |
| Create team | ✓ | ✓ | ✗ | ✗ |
| Manage team | ✓ | ✓ | ✗ | ✗ |
| View activity | ✓ | ✓ | ✓ | ✓ |
| Edit organization | ✓ | ✗ | ✗ | ✗ |

---

## Error Codes

| Code | Status | Message |
|------|--------|---------|
| ORG_NOT_FOUND | 404 | Organization not found |
| TEAM_NOT_FOUND | 404 | Team not found |
| USER_NOT_FOUND | 404 | User not found |
| MEMBER_EXISTS | 400 | User already member |
| INVALID_ROLE | 400 | Invalid role |
| PERMISSION_DENIED | 403 | Insufficient permissions |
| INVITATION_EXPIRED | 400 | Invitation expired |

---

## Validation Rules

### Organization
- Name: 1-255 chars, required
- Slug: 3-50 chars, unique, lowercase
- Website: Valid URL format

### Team
- Name: 1-100 chars, required
- Description: 0-500 chars

### Invitation
- Email: Valid email format
- Expiration: 7 days default

---

## Testing Strategy

### Unit Tests
- Profile update validation
- Organization creation
- Team member management
- Invitation generation

### Integration Tests
- Complete user onboarding
- Organization setup
- Team creation and management
- Invitation acceptance flow

### E2E Tests
- User registration to team assignment
- Invitation email delivery
- Activity log tracking

---

## Related Documentation
- [Authentication Module](./M1_AUTHENTICATION.md)
- [Compliance Module](./M8_COMPLIANCE.md)
- [Architecture Overview](../ARCHITECTURE.md)
