# Database Integration Guide

## Overview
This guide explains the database integration for the Lapaas OS backend, including the new Daily Commitments feature.

## Database Setup

### SQLite Database
- **Location**: `/backend/lapaas.db`
- **Type**: SQLite3
- **Schema**: Defined in `database-schema.sql`

### Initialization

#### Option 1: Using the Init Script (Recommended)
```bash
cd backend
node init-db.js
```

This will:
1. Create all required tables
2. Create indexes for performance
3. Insert default roles
4. Display completion status

#### Option 2: Manual SQL Execution
```bash
sqlite3 lapaas.db < database-schema.sql
```

## Database Service

### Location
`/backend/src/services/database.ts`

### Features
- Promise-based API
- Connection pooling
- Type-safe operations
- Automatic table creation

### Usage Example
```typescript
import db from './services/database';

// Initialize database
await db.initialize();

// Create a daily commitment
await db.createDailyCommitment({
  id: 'daily-comm-123',
  title: 'Morning Standup',
  start_time: '09:00',
  end_time: '10:00',
  start_date: '2025-11-15',
  end_date: null,
  effort_minutes: 60,
  recurring: true,
  status: 'active',
  org_id: 'org-001',
  user_id: 'user-001'
});

// Fetch commitments
const commitments = await db.getDailyCommitmentsByOrgId('org-001');

// Update commitment
await db.updateDailyCommitment('daily-comm-123', {
  title: 'Updated Standup',
  status: 'inactive'
});

// Delete commitment
await db.deleteDailyCommitment('daily-comm-123');
```

## Daily Commitments Table

### Schema
```sql
CREATE TABLE daily_commitments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  start_time TEXT NOT NULL,          -- HH:MM format
  end_time TEXT NOT NULL,            -- HH:MM format
  start_date TEXT NOT NULL,          -- YYYY-MM-DD format
  end_date TEXT,                     -- YYYY-MM-DD format (optional)
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
```

### Indexes
- `idx_daily_commitments_org_id` - For org-based queries
- `idx_daily_commitments_user_id` - For user-based queries
- `idx_daily_commitments_start_date` - For date range queries

## API Endpoints

### Get Daily Commitments
```
GET /api/v1/daily-commitments?org_id=org-001
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "daily-comm-123",
      "title": "Morning Standup",
      "start_time": "09:00",
      "end_time": "10:00",
      "start_date": "2025-11-15",
      "end_date": null,
      "effort_minutes": 60,
      "recurring": true,
      "status": "active",
      "org_id": "org-001",
      "user_id": "user-001",
      "created_at": "2025-11-15T10:00:00Z",
      "updated_at": "2025-11-15T10:00:00Z"
    }
  ]
}
```

### Create Daily Commitment
```
POST /api/v1/daily-commitments
Content-Type: application/json

{
  "title": "Morning Standup",
  "start_time": "09:00",
  "end_time": "10:00",
  "start_date": "2025-11-15",
  "end_date": null,
  "effort_minutes": 60,
  "recurring": true,
  "status": "active",
  "org_id": "org-001",
  "user_id": "user-001"
}
```

### Update Daily Commitment
```
PUT /api/v1/daily-commitments/:id
Content-Type: application/json

{
  "title": "Updated Standup",
  "status": "inactive"
}
```

### Delete Daily Commitment
```
DELETE /api/v1/daily-commitments/:id
```

## Database Methods

### Daily Commitments Operations

#### `createDailyCommitment(commitment)`
Creates a new daily commitment in the database.

#### `getDailyCommitmentById(id)`
Retrieves a single commitment by ID.

#### `getDailyCommitmentsByOrgId(orgId)`
Retrieves all commitments for an organization.

#### `getDailyCommitmentsByUserId(userId)`
Retrieves all commitments for a user.

#### `getDailyCommitmentsByOrgAndUser(orgId, userId)`
Retrieves commitments for a specific user in an organization.

#### `getDailyCommitmentsByDateRange(orgId, startDate, endDate)`
Retrieves commitments within a date range.

#### `updateDailyCommitment(id, updates)`
Updates a commitment with partial data.

#### `deleteDailyCommitment(id)`
Deletes a single commitment.

#### `deleteDailyCommitmentsByOrgId(orgId)`
Deletes all commitments for an organization.

## Migration Path

### Current State
- In-memory storage in `founder-os-commitments-timeblocks-routes.js`
- Database service ready in `src/services/database.ts`

### To Enable Database Integration

1. **Update the routes file** to use the database service:
```javascript
// Replace in-memory array with database calls
router.get('/daily-commitments', async (req, res) => {
  try {
    const { org_id } = req.query;
    if (!org_id) {
      return res.status(400).json({ error: 'org_id required' });
    }
    const data = await db.getDailyCommitmentsByOrgId(org_id);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

2. **Initialize database** on server startup:
```javascript
// In test-server.js or main server file
import db from './src/services/database';

app.listen(PORT, async () => {
  await db.initialize();
  console.log(`Server running on port ${PORT}`);
});
```

3. **Run migrations** if needed:
```bash
node init-db.js
```

## Performance Considerations

### Indexes
All frequently queried fields have indexes:
- Organization ID (for filtering by org)
- User ID (for filtering by user)
- Start Date (for date range queries)

### Query Optimization
- Use `getDailyCommitmentsByDateRange()` for date-based queries
- Use `getDailyCommitmentsByOrgAndUser()` for specific user queries
- Avoid full table scans with proper filtering

## Backup & Recovery

### Backup Database
```bash
cp lapaas.db lapaas.db.backup
```

### Restore Database
```bash
cp lapaas.db.backup lapaas.db
```

## Troubleshooting

### Database Connection Error
```
Error: Cannot find module 'sqlite3'
```
**Solution**: Install dependencies
```bash
npm install sqlite3
```

### Table Already Exists
The schema uses `CREATE TABLE IF NOT EXISTS`, so it's safe to run multiple times.

### Foreign Key Constraint Error
Ensure organizations and users exist before creating daily commitments.

## Next Steps

1. ✅ Database schema created
2. ✅ Database service implemented
3. ✅ API endpoints defined
4. ⏳ Integrate database service into routes
5. ⏳ Run init-db.js to create tables
6. ⏳ Test with sample data
7. ⏳ Deploy to production

## Support

For issues or questions, refer to:
- `database-schema.sql` - Full schema definition
- `src/services/database.ts` - Database service implementation
- `init-db.js` - Database initialization script
