const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const router = express.Router();

// Use the main lapaas.db database
const DB_PATH = path.join(__dirname, 'lapaas.db');
const db = new sqlite3.Database(DB_PATH);

// ==================== OFFICE HOURS MANAGEMENT ====================

// Get office hours for a user
router.get('/office-hours/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all(
    'SELECT * FROM office_hours WHERE user_id = ? AND is_active = 1 ORDER BY day_of_week, start_time',
    [userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, data: rows });
    }
  );
});

// Create office hours
router.post('/office-hours', (req, res) => {
  const { user_id, day_of_week, start_time, end_time } = req.body;
  const id = uuidv4();
  
  db.run(
    `INSERT INTO office_hours (id, user_id, day_of_week, start_time, end_time)
     VALUES (?, ?, ?, ?, ?)`,
    [id, user_id, day_of_week, start_time, end_time],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        success: true, 
        data: { id, user_id, day_of_week, start_time, end_time }
      });
    }
  );
});

// Update office hours
router.put('/office-hours/:id', (req, res) => {
  const { id } = req.params;
  const { day_of_week, start_time, end_time, is_active } = req.body;
  
  db.run(
    `UPDATE office_hours 
     SET day_of_week = ?, start_time = ?, end_time = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [day_of_week, start_time, end_time, is_active, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'Office hours updated' });
    }
  );
});

// Delete office hours
router.delete('/office-hours/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM office_hours WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: 'Office hours deleted' });
  });
});

// ==================== ESCALATION RULES ====================

// Get escalation rules for org
router.get('/escalation-rules/:orgId', (req, res) => {
  const { orgId } = req.params;
  
  db.all(
    'SELECT * FROM escalation_rules WHERE org_id = ? ORDER BY priority',
    [orgId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, data: rows });
    }
  );
});

// Create escalation rule
router.post('/escalation-rules', (req, res) => {
  const { org_id, priority, route_to, sla_hours, requires_justification, auto_batch } = req.body;
  const id = uuidv4();
  
  db.run(
    `INSERT INTO escalation_rules (id, org_id, priority, route_to, sla_hours, requires_justification, auto_batch)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, org_id, priority, route_to, sla_hours, requires_justification || 0, auto_batch || 0],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        success: true, 
        data: { id, org_id, priority, route_to, sla_hours, requires_justification, auto_batch }
      });
    }
  );
});

// Update escalation rule
router.put('/escalation-rules/:id', (req, res) => {
  const { id } = req.params;
  const { priority, route_to, sla_hours, requires_justification, auto_batch } = req.body;
  
  db.run(
    `UPDATE escalation_rules 
     SET priority = ?, route_to = ?, sla_hours = ?, requires_justification = ?, auto_batch = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [priority, route_to, sla_hours, requires_justification, auto_batch, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'Escalation rule updated' });
    }
  );
});

// Delete escalation rule
router.delete('/escalation-rules/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM escalation_rules WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: 'Escalation rule deleted' });
  });
});

// ==================== KB ARTICLES ====================

// Get all KB articles
router.get('/kb-articles', (req, res) => {
  const { category, published } = req.query;
  let query = 'SELECT * FROM kb_articles WHERE 1=1';
  const params = [];
  
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  
  if (published !== undefined) {
    query += ' AND is_published = ?';
    params.push(published === 'true' ? 1 : 0);
  }
  
  query += ' ORDER BY created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, data: rows });
  });
});

// Get KB article by ID
router.get('/kb-articles/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM kb_articles WHERE id = ?', [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    // Increment view count
    db.run('UPDATE kb_articles SET view_count = view_count + 1 WHERE id = ?', [id]);
    
    res.json({ success: true, data: row });
  });
});

// Search KB articles
router.get('/kb-articles/search/:query', (req, res) => {
  const { query } = req.params;
  const searchTerm = `%${query}%`;
  
  db.all(
    `SELECT * FROM kb_articles 
     WHERE is_published = 1 AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)
     ORDER BY view_count DESC, helpful_count DESC
     LIMIT 10`,
    [searchTerm, searchTerm, searchTerm],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, data: rows });
    }
  );
});

// Create KB article
router.post('/kb-articles', (req, res) => {
  const { title, content, category, categoryId, category_id, tags, orgId, org_id } = req.body;
  const id = uuidv4();
  const catId = categoryId || category_id || category;
  const organizationId = orgId || org_id || 'org-001';
  
  db.run(
    `INSERT INTO kb_articles (id, org_id, title, content, category_id, tags)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, organizationId, title, content, catId, JSON.stringify(tags || [])],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        success: true, 
        data: { id, org_id: organizationId, title, content, category_id: catId, tags }
      });
    }
  );
});

// Update KB article
router.put('/kb-articles/:id', (req, res) => {
  const { id } = req.params;
  const { title, content, category, tags, is_published } = req.body;
  
  db.run(
    `UPDATE kb_articles 
     SET title = ?, content = ?, category = ?, tags = ?, is_published = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [title, content, category, JSON.stringify(tags || []), is_published, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'Article updated' });
    }
  );
});

// Mark article as helpful
router.post('/kb-articles/:id/helpful', (req, res) => {
  const { id } = req.params;
  
  db.run(
    'UPDATE kb_articles SET helpful_count = helpful_count + 1 WHERE id = ?',
    [id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'Marked as helpful' });
    }
  );
});

// Delete KB article
router.delete('/kb-articles/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM kb_articles WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: 'Article deleted' });
  });
});

// ==================== REQUEST DEFLECTION ====================

// Track deflection attempt
router.post('/deflections', (req, res) => {
  const { request_id, kb_article_id, was_deflected, user_feedback } = req.body;
  const id = uuidv4();
  
  db.run(
    `INSERT INTO request_deflections (id, request_id, kb_article_id, was_deflected, user_feedback)
     VALUES (?, ?, ?, ?, ?)`,
    [id, request_id, kb_article_id, was_deflected, user_feedback],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, data: { id, was_deflected } });
    }
  );
});

// Get deflection stats - return meaningful defaults if no data
router.get('/deflections/stats', (req, res) => {
  db.get(
    `SELECT 
       COUNT(*) as total_attempts,
       SUM(CASE WHEN was_deflected = 1 THEN 1 ELSE 0 END) as successful_deflections,
       CASE 
         WHEN COUNT(*) > 0 THEN ROUND(CAST(SUM(CASE WHEN was_deflected = 1 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) * 100, 2)
         ELSE 0 
       END as deflection_rate
     FROM request_deflections`,
    (err, row) => {
      if (err) {
        // Return default values if table doesn't exist or other error
        return res.json({ success: true, data: { total_attempts: 0, successful_deflections: 0, deflection_rate: 0 } });
      }
      res.json({ success: true, data: row || { total_attempts: 0, successful_deflections: 0, deflection_rate: 0 } });
    }
  );
});

// ==================== REQUEST BATCHING ====================

// Get batches
router.get('/batches', (req, res) => {
  const { status } = req.query;
  let query = 'SELECT * FROM request_batches WHERE 1=1';
  const params = [];
  
  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  
  query += ' ORDER BY batch_date DESC, batch_time DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, data: rows });
  });
});

// Create batch
router.post('/batches', (req, res) => {
  const { batch_date, batch_time } = req.body;
  const id = uuidv4();
  
  db.run(
    `INSERT INTO request_batches (id, batch_date, batch_time)
     VALUES (?, ?, ?)`,
    [id, batch_date, batch_time],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, data: { id, batch_date, batch_time } });
    }
  );
});

// Add request to batch
router.post('/batches/:batchId/requests', (req, res) => {
  const { batchId } = req.params;
  const { request_id } = req.body;
  const id = uuidv4();
  
  db.run(
    `INSERT INTO request_batch_items (id, batch_id, request_id)
     VALUES (?, ?, ?)`,
    [id, batchId, request_id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Update batch request count
      db.run(
        'UPDATE request_batches SET request_count = request_count + 1 WHERE id = ?',
        [batchId]
      );
      
      res.json({ success: true, data: { id, batch_id: batchId, request_id } });
    }
  );
});

// Get batch items
router.get('/batches/:batchId/requests', (req, res) => {
  const { batchId } = req.params;
  
  db.all(
    `SELECT rbi.*, r.title, r.urgency, r.category, r.created_at as request_created_at
     FROM request_batch_items rbi
     LEFT JOIN requests r ON rbi.request_id = r.id
     WHERE rbi.batch_id = ?
     ORDER BY rbi.added_at`,
    [batchId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, data: rows });
    }
  );
});

// Process batch
router.post('/batches/:batchId/process', (req, res) => {
  const { batchId } = req.params;
  
  db.run(
    `UPDATE request_batches 
     SET status = 'completed', processed_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [batchId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'Batch processed' });
    }
  );
});

// ==================== SLA TRACKING ====================

// Create SLA tracking
router.post('/sla-tracking', (req, res) => {
  const { request_id, priority, sla_hours } = req.body;
  const id = uuidv4();
  
  // Calculate deadline
  const deadline = new Date();
  deadline.setHours(deadline.getHours() + sla_hours);
  
  db.run(
    `INSERT INTO request_sla_tracking (id, request_id, priority, sla_deadline)
     VALUES (?, ?, ?, ?)`,
    [id, request_id, priority, deadline.toISOString()],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ 
        success: true, 
        data: { id, request_id, priority, sla_deadline: deadline.toISOString() }
      });
    }
  );
});

// Update SLA tracking
router.put('/sla-tracking/:requestId', (req, res) => {
  const { requestId } = req.params;
  const { first_response_at, resolution_at } = req.body;
  
  db.run(
    `UPDATE request_sla_tracking 
     SET first_response_at = ?, resolution_at = ?, updated_at = CURRENT_TIMESTAMP
     WHERE request_id = ?`,
    [first_response_at, resolution_at, requestId],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, message: 'SLA tracking updated' });
    }
  );
});

// Check for SLA breaches
router.get('/sla-tracking/breaches', (req, res) => {
  const now = new Date().toISOString();
  
  db.all(
    `SELECT st.*, r.title, r.urgency, r.category
     FROM request_sla_tracking st
     LEFT JOIN requests r ON st.request_id = r.id
     WHERE st.sla_deadline < ? AND st.resolution_at IS NULL
     ORDER BY st.sla_deadline`,
    [now],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      // Mark as breached
      rows.forEach(row => {
        db.run(
          'UPDATE request_sla_tracking SET is_breached = 1 WHERE id = ?',
          [row.id]
        );
      });
      
      res.json({ success: true, data: rows });
    }
  );
});

// Get SLA stats - using requests table
router.get('/sla-tracking/stats', (req, res) => {
  db.get(
    `SELECT 
       COUNT(*) as total_requests,
       SUM(CASE WHEN status = 'completed' OR status = 'resolved' THEN 1 ELSE 0 END) as resolved,
       SUM(CASE WHEN sla_breached = 1 OR (datetime(sla_at) < datetime('now') AND status = 'pending') THEN 1 ELSE 0 END) as breached,
       CASE 
         WHEN COUNT(*) > 0 THEN ROUND(
           CAST(SUM(CASE WHEN status = 'completed' OR status = 'resolved' THEN 1 ELSE 0 END) AS FLOAT) / 
           CAST(COUNT(*) AS FLOAT) * 100, 0)
         ELSE 0 
       END as sla_compliance_rate
     FROM requests`,
    (err, row) => {
      if (err) {
        console.error('SLA stats error:', err);
        return res.json({ success: true, data: { total_requests: 0, resolved: 0, breached: 0, sla_compliance_rate: 0 } });
      }
      res.json({ success: true, data: row || { total_requests: 0, resolved: 0, breached: 0, sla_compliance_rate: 0 } });
    }
  );
});

module.exports = router;
