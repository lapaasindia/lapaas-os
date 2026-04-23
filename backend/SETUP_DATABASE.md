# Quick Database Setup Guide

## 1. Initialize Database (One-Time Setup)

```bash
cd backend
node init-db.js
```

**Output:**
```
✅ Database connection established at /path/to/lapaas.db
✅ All 10 database statements executed successfully
✅ Default roles inserted
🎉 Database initialization complete!
```

## 2. Verify Database Creation

```bash
# Check if database file exists
ls -lh lapaas.db

# View database structure (optional)
sqlite3 lapaas.db ".tables"
```

## 3. Enable Database Integration in Routes

Update `founder-os-commitments-timeblocks-routes.js` to use the database service:

```javascript
// At the top of the file
const db = require('../src/services/database').default;

// Replace the in-memory array with database calls
router.get('/daily-commitments', async (req, res) => {
  try {
    const { org_id } = req.query;
    if (!org_id) {
      return res.status(400).json({
        success: false,
        error: 'org_id is required'
      });
    }
    
    // Use database instead of in-memory
    const data = await db.getDailyCommitmentsByOrgId(org_id);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching daily commitments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily commitments'
    });
  }
});

// Similar updates for POST, PUT, DELETE endpoints
```

## 4. Initialize Database on Server Startup

Update `test-server.js`:

```javascript
// Add at the top
const db = require('./src/services/database').default;

// Modify the app.listen section
app.listen(PORT, async () => {
  try {
    // Initialize database
    await db.initialize();
    console.log('✅ Database initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
  
  console.log(`🚀 Test Server running on http://localhost:${PORT}`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});
```

## 5. Test Database Operations

### Create a Daily Commitment
```bash
curl -X POST http://localhost:3000/api/v1/daily-commitments \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Morning Standup",
    "start_time": "09:00",
    "end_time": "10:00",
    "start_date": "2025-11-15",
    "effort_minutes": 60,
    "recurring": true,
    "status": "active",
    "org_id": "org-001",
    "user_id": "user-001"
  }'
```

### Fetch Daily Commitments
```bash
curl http://localhost:3000/api/v1/daily-commitments?org_id=org-001
```

### Update a Commitment
```bash
curl -X PUT http://localhost:3000/api/v1/daily-commitments/daily-comm-123 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Standup",
    "status": "inactive"
  }'
```

### Delete a Commitment
```bash
curl -X DELETE http://localhost:3000/api/v1/daily-commitments/daily-comm-123
```

## 6. Database Backup

```bash
# Create backup
cp lapaas.db lapaas.db.backup

# Restore from backup
cp lapaas.db.backup lapaas.db
```

## 7. Troubleshooting

### Issue: "Cannot find module 'sqlite3'"
**Solution:**
```bash
npm install sqlite3
```

### Issue: "Database locked"
**Solution:** Close other connections to the database and try again.

### Issue: "Foreign key constraint failed"
**Solution:** Ensure the organization and user exist before creating commitments.

## 8. Database Structure

### Tables Created
- `users` - User accounts
- `organizations` - Organizations
- `teams` - Teams
- `members` - Team members
- `roles` - User roles
- `activities` - Activity logs
- `sessions` - User sessions
- `daily_commitments` - Daily recurring commitments ⭐ NEW

### Indexes Created
- `idx_daily_commitments_org_id` - For org filtering
- `idx_daily_commitments_user_id` - For user filtering
- `idx_daily_commitments_start_date` - For date range queries

## 9. Production Deployment

For production, consider:
1. Using PostgreSQL instead of SQLite
2. Implementing connection pooling
3. Adding automated backups
4. Setting up monitoring and alerts
5. Using environment variables for database path

## 10. Next Steps

- ✅ Database schema created
- ✅ Database service implemented
- ⏳ Update routes to use database
- ⏳ Initialize database with `node init-db.js`
- ⏳ Test all endpoints
- ⏳ Deploy to production

---

**For detailed documentation**, see `DATABASE_INTEGRATION.md`
