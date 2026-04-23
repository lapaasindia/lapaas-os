# Lapaas OS - Complete Database Schema

## Core Tables

### 1. Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url VARCHAR(500),
  email_verified BOOLEAN DEFAULT FALSE,
  email_verified_at TIMESTAMP,
  last_login_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
);
```

### 2. Organizations Table
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  logo_url VARCHAR(500),
  description TEXT,
  website VARCHAR(255),
  industry VARCHAR(100),
  company_size VARCHAR(50),
  timezone VARCHAR(50),
  language VARCHAR(10),
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  
  INDEX idx_slug (slug),
  INDEX idx_created_at (created_at)
);
```

### 3. Organization Members Table
```sql
CREATE TABLE organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, user_id),
  INDEX idx_organization_id (organization_id),
  INDEX idx_user_id (user_id)
);
```

### 4. Teams Table
```sql
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  avatar_url VARCHAR(500),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_organization_id (organization_id),
  INDEX idx_created_at (created_at)
);
```

### 5. Team Members Table
```sql
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(team_id, user_id),
  INDEX idx_team_id (team_id),
  INDEX idx_user_id (user_id)
);
```

### 6. Roles Table
```sql
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(organization_id, name),
  INDEX idx_organization_id (organization_id)
);
```

### 7. Permissions Table
```sql
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  resource VARCHAR(100),
  action VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_resource_action (resource, action)
);
```

### 8. Role Permissions Table
```sql
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(role_id, permission_id),
  INDEX idx_role_id (role_id)
);
```

### 9. User Roles Table
```sql
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, role_id, organization_id),
  INDEX idx_user_id (user_id),
  INDEX idx_organization_id (organization_id)
);
```

---

## Authentication Tables

### 10. User Sessions Table
```sql
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  access_token_hash VARCHAR(255),
  refresh_token_hash VARCHAR(255),
  device_info JSONB,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);
```

### 11. API Keys Table
```sql
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  key_hash VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_organization_id (organization_id),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at)
);
```

### 12. User MFA Table
```sql
CREATE TABLE user_mfa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50),
  enabled BOOLEAN DEFAULT FALSE,
  secret VARCHAR(255),
  phone_number VARCHAR(20),
  backup_codes TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, type),
  INDEX idx_user_id (user_id)
);
```

---

## Billing Tables

### 13. Plans Table
```sql
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  billing_period VARCHAR(50),
  trial_days INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  stripe_product_id VARCHAR(255),
  stripe_price_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_organization_id (organization_id),
  INDEX idx_stripe_product_id (stripe_product_id)
);
```

### 14. Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  status VARCHAR(50) DEFAULT 'active',
  current_period_start DATE,
  current_period_end DATE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  cancelled_at TIMESTAMP,
  
  UNIQUE(organization_id),
  INDEX idx_organization_id (organization_id),
  INDEX idx_status (status),
  INDEX idx_stripe_subscription_id (stripe_subscription_id)
);
```

### 15. Payment Methods Table
```sql
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  type VARCHAR(50),
  stripe_payment_method_id VARCHAR(255),
  is_default BOOLEAN DEFAULT FALSE,
  card_last_four VARCHAR(4),
  card_brand VARCHAR(50),
  card_exp_month INT,
  card_exp_year INT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_organization_id (organization_id),
  INDEX idx_stripe_payment_method_id (stripe_payment_method_id)
);
```

### 16. Payments Table
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  amount DECIMAL(10, 2),
  currency VARCHAR(3),
  status VARCHAR(50),
  stripe_payment_intent_id VARCHAR(255),
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_organization_id (organization_id),
  INDEX idx_subscription_id (subscription_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

### 17. Invoices Table
```sql
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  invoice_number VARCHAR(50) UNIQUE,
  status VARCHAR(50),
  amount_due DECIMAL(10, 2),
  amount_paid DECIMAL(10, 2),
  currency VARCHAR(3),
  issue_date DATE,
  due_date DATE,
  paid_date DATE,
  stripe_invoice_id VARCHAR(255),
  pdf_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_organization_id (organization_id),
  INDEX idx_subscription_id (subscription_id),
  INDEX idx_status (status),
  INDEX idx_issue_date (issue_date)
);
```

---

## Analytics Tables

### 18. Analytics Events Table
```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  event_name VARCHAR(100),
  event_properties JSONB,
  timestamp TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_organization_id_timestamp (organization_id, timestamp),
  INDEX idx_event_name (event_name),
  INDEX idx_timestamp (timestamp)
);
```

### 19. Analytics Sessions Table
```sql
CREATE TABLE analytics_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  session_start TIMESTAMP,
  session_end TIMESTAMP,
  page_views INT,
  events_count INT,
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_organization_id (organization_id),
  INDEX idx_session_start (session_start)
);
```

---

## Integration Tables

### 20. Integrations Table
```sql
CREATE TABLE integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  integration_type VARCHAR(100),
  name VARCHAR(100),
  status VARCHAR(50),
  config JSONB,
  last_sync_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_organization_id (organization_id),
  INDEX idx_integration_type (integration_type)
);
```

### 21. Webhooks Table
```sql
CREATE TABLE webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
  event_type VARCHAR(100),
  url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_organization_id (organization_id),
  INDEX idx_integration_id (integration_id)
);
```

---

## Audit & Compliance Tables

### 22. Audit Logs Table
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100),
  resource_type VARCHAR(100),
  resource_id VARCHAR(255),
  changes JSONB,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW(),
  
  INDEX idx_organization_id (organization_id),
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_created_at (created_at)
);
```

---

## Relationships Diagram

```
users
  ├── organization_members → organizations
  ├── user_sessions
  ├── api_keys
  ├── user_mfa
  ├── user_roles → roles
  ├── team_members → teams
  └── audit_logs

organizations
  ├── organization_members ← users
  ├── teams
  ├── plans
  ├── subscriptions
  ├── payment_methods
  ├── payments
  ├── invoices
  ├── integrations
  ├── analytics_events
  └── audit_logs

roles
  ├── role_permissions → permissions
  └── user_roles ← users

subscriptions
  ├── payments
  └── invoices

integrations
  └── webhooks
```

---

## Indexing Strategy

### Primary Indexes
- All UUID primary keys
- Foreign key relationships

### Performance Indexes
- `users(email)` - Fast email lookup
- `organizations(slug)` - Fast organization lookup
- `subscriptions(organization_id, status)` - Subscription queries
- `payments(organization_id, created_at)` - Payment history
- `analytics_events(organization_id, timestamp)` - Analytics queries
- `audit_logs(organization_id, created_at)` - Audit trail queries

### Composite Indexes
- `(organization_id, created_at)` - Time-based queries
- `(user_id, organization_id)` - User-org queries
- `(resource_type, resource_id)` - Resource queries

---

## Data Retention Policies

- **Active Data** - Indefinite retention
- **Deleted Records** - 90 days soft delete
- **Analytics Events** - 2 years
- **Audit Logs** - 7 years (compliance)
- **Payment Records** - 7 years (tax)
- **Session Data** - 30 days
- **Backups** - 30 days retention

---

## Backup Strategy

- Daily automated backups
- Point-in-time recovery
- Geo-redundant storage
- Monthly full backups
- Weekly incremental backups
- Backup testing monthly
