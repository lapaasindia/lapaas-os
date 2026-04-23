# Module 1: Authentication & Authorization

**Status:** Core | **Priority:** Critical | **Phase:** 1 (Weeks 1-3)

## Quick Links
- [User Management Module](./M2_USER_MANAGEMENT.md)
- [Settings Module](./M6_SETTINGS.md)
- [Compliance Module](./M8_COMPLIANCE.md)

---

## 1.1 Email/Password Authentication

### Endpoints
```
POST   /auth/register          - Register user
POST   /auth/login             - Login user
POST   /auth/verify-email      - Verify email
POST   /auth/forgot-password   - Request reset
POST   /auth/reset-password    - Reset password
```

### Database
```sql
users (id, email, password_hash, email_verified, created_at)
email_verifications (id, user_id, token, expires_at)
password_resets (id, user_id, token, expires_at)
```

### Security
- Bcrypt hashing (salt: 12)
- Rate limit: 5 attempts/15min
- Lockout: 30 min after 5 failures
- Password: Min 8 chars, uppercase, lowercase, number, special char

---

## 1.2 Social Authentication

### Supported Providers
- Google OAuth
- GitHub OAuth
- Microsoft (future)

### Endpoints
```
GET    /auth/google            - Google OAuth
GET    /auth/google/callback   - Google callback
GET    /auth/github            - GitHub OAuth
GET    /auth/github/callback   - GitHub callback
```

### Configuration
```
Google:
  Client ID: [from Google Console]
  Redirect: https://app.lapaas.io/auth/google/callback
  Scopes: email, profile, openid

GitHub:
  Client ID: [from GitHub]
  Redirect: https://app.lapaas.io/auth/github/callback
  Scopes: user:email, read:user
```

---

## 1.3 Multi-Factor Authentication (MFA)

### Endpoints
```
POST   /auth/mfa/setup         - Setup TOTP
POST   /auth/mfa/verify        - Verify code
POST   /auth/mfa/disable       - Disable MFA
POST   /auth/mfa/backup-code   - Use backup code
```

### Database
```sql
user_mfa (id, user_id, type, secret, backup_codes)
mfa_sessions (id, user_id, session_token, expires_at)
```

### Features
- TOTP with QR code
- 8 backup codes (single use)
- Code validity: 30 seconds
- Attempt limit: 3 per 5 min

---

## 1.4 API Key Management

### Endpoints
```
POST   /api-keys               - Create key
GET    /api-keys               - List keys
GET    /api-keys/:id           - Get key
PUT    /api-keys/:id           - Update key
DELETE /api-keys/:id           - Delete key
```

### Database
```sql
api_keys (id, user_id, key_hash, name, expires_at)
api_key_scopes (id, api_key_id, scope)
```

### Key Format
- Prefix: `sk_live_` or `sk_test_`
- Length: 32 characters
- Encoding: Base62

### Scopes
```
read:users, write:users
read:subscriptions, write:subscriptions
read:analytics, write:analytics
read:integrations, write:integrations
read:settings, write:settings
admin
```

---

## 1.5 Session Management

### Endpoints
```
POST   /auth/refresh           - Refresh token
POST   /auth/logout            - Logout
GET    /auth/sessions          - List sessions
DELETE /auth/sessions/:id      - Revoke session
```

### Database
```sql
user_sessions (id, user_id, access_token_hash, refresh_token_hash, expires_at)
```

### Token Structure

**Access Token (15 min):**
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "roles": ["admin"],
  "permissions": ["read:profile"],
  "exp": 1705316100
}
```

**Refresh Token (7 days):**
```json
{
  "sub": "user_id",
  "type": "refresh",
  "exp": 1705920000
}
```

---

## 1.6 Role-Based Access Control (RBAC)

### Endpoints
```
GET    /roles                  - List roles
POST   /roles                  - Create role
PUT    /roles/:id              - Update role
DELETE /roles/:id              - Delete role
POST   /users/:id/roles        - Assign role
DELETE /users/:id/roles/:rid   - Remove role
```

### Database
```sql
roles (id, organization_id, name, is_system)
permissions (id, name, resource, action)
role_permissions (role_id, permission_id)
user_roles (user_id, role_id, organization_id)
```

### Default Roles

| Role | Permissions | Use Case |
|------|-------------|----------|
| Admin | All | Full access |
| Manager | Users, Analytics, Integrations | Team lead |
| User | Own data, API | Regular user |
| Viewer | Read-only | Stakeholder |

---

## Frontend Components

### Pages
- `/auth/login` - Login page
- `/auth/register` - Registration page
- `/auth/forgot-password` - Password reset request
- `/auth/reset-password` - Password reset form
- `/settings/security/mfa` - MFA setup
- `/settings/security/sessions` - Active sessions
- `/settings/api-keys` - API key management
- `/settings/roles` - Role management

### Components
- `ProtectedRoute` - Authentication guard
- `PermissionGuard` - Permission-based rendering
- `LoginForm` - Login form
- `RegisterForm` - Registration form
- `MFAInput` - MFA code input
- `SessionList` - Sessions list
- `APIKeyList` - API keys list
- `RoleSelector` - Role dropdown

---

## Security Checklist

- [ ] HTTPS/TLS encryption
- [ ] JWT token validation
- [ ] CORS configuration
- [ ] Rate limiting
- [ ] Input validation
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens
- [ ] Secure password hashing
- [ ] Session timeout
- [ ] API key rotation
- [ ] Audit logging

---

## Error Codes

| Code | Status | Message |
|------|--------|---------|
| INVALID_CREDENTIALS | 401 | Invalid email or password |
| EMAIL_EXISTS | 400 | Email already registered |
| INVALID_TOKEN | 400 | Invalid or expired token |
| INVALID_MFA_CODE | 401 | Invalid MFA code |
| ACCOUNT_LOCKED | 429 | Account locked due to failed attempts |
| INVALID_API_KEY | 401 | Invalid API key |
| PERMISSION_DENIED | 403 | Insufficient permissions |

---

## Testing Strategy

### Unit Tests
- Password validation
- Token generation/validation
- Permission checking
- Role assignment

### Integration Tests
- Complete login flow
- MFA setup and verification
- API key creation and usage
- Session management

### E2E Tests
- User registration to dashboard
- Social login flow
- MFA recovery with backup codes
- API key authentication

---

## Related Documentation
- [Architecture Overview](../ARCHITECTURE.md)
- [Database Schema](../DATABASE_SCHEMA.md)
- [UI/UX Guide](../UI_UX_GUIDE.md)
- [Implementation Roadmap](../IMPLEMENTATION_ROADMAP.md)
