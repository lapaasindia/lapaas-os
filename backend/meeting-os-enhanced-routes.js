// MEETING OS - ENHANCED ROUTES
// Date: November 20, 2025
// Full implementation of Meeting OS features

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db.sqlite');

// ============================================
// AGENDA MANAGEMENT ROUTES
// ============================================

// Update agenda item
router.put('/meetings/:meetingId/agenda/:agendaId', (req, res) => {
  const { meetingId, agendaId } = req.params;
  const { title, duration, owner, status, notes } = req.body;
  
  const sql = `
    UPDATE meeting_agenda 
    SET title = ?, duration = ?, owner = ?, status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND meeting_id = ?
  `;
  
  db.run(sql, [title, duration, owner, status, notes, agendaId, meetingId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    db.get('SELECT * FROM meeting_agenda WHERE id = ?', [agendaId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, data: row });
    });
  });
});

// Reorder agenda items
router.put('/meetings/:meetingId/agenda/reorder', (req, res) => {
  const { meetingId } = req.params;
  const { items } = req.body; // Array of {id, order_index}
  
  const stmt = db.prepare('UPDATE meeting_agenda SET order_index = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND meeting_id = ?');
  
  items.forEach(item => {
    stmt.run([item.order_index, item.id, meetingId]);
  });
  
  stmt.finalize((err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    db.all('SELECT * FROM meeting_agenda WHERE meeting_id = ? ORDER BY order_index', [meetingId], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, data: rows });
    });
  });
});

// Get all agenda items for a meeting
router.get('/meetings/:meetingId/agenda', (req, res) => {
  const { meetingId } = req.params;
  
  db.all('SELECT * FROM meeting_agenda WHERE meeting_id = ? ORDER BY order_index', [meetingId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, data: rows || [] });
  });
});

// ============================================
// DECISION MANAGEMENT ROUTES
// ============================================

// Create decision
router.post('/meetings/:meetingId/decisions', (req, res) => {
  const { meetingId } = req.params;
  const { title, rationale, owner_id, review_at, create_task } = req.body;
  const decisionId = `dec-${Date.now()}`;
  
  const sql = `
    INSERT INTO meeting_decisions (id, meeting_id, title, rationale, owner_id, review_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;
  
  db.run(sql, [decisionId, meetingId, title, rationale, owner_id, review_at], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    // If create_task is true, auto-create a task from this decision
    if (create_task) {
      const taskId = `task-${Date.now()}`;
      const taskSql = `
        INSERT INTO tasks (id, title, description, priority, status, due_at, org_id, created_at)
        VALUES (?, ?, ?, 'P2', 'pending', ?, 'org-001', CURRENT_TIMESTAMP)
      `;
      
      db.run(taskSql, [taskId, title, rationale, review_at], (taskErr) => {
        if (taskErr) {
          console.error('Error creating task from decision:', taskErr);
        }
        
        // Link task to decision
        const actionSql = `
          INSERT INTO meeting_actions (id, meeting_id, task_id, created_at)
          VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `;
        
        db.run(actionSql, [`action-${Date.now()}`, meetingId, taskId], (actionErr) => {
          if (actionErr) {
            console.error('Error linking task to meeting:', actionErr);
          }
        });
      });
    }
    
    db.get('SELECT * FROM meeting_decisions WHERE id = ?', [decisionId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, data: row });
    });
  });
});

// Update decision
router.put('/meetings/:meetingId/decisions/:decisionId', (req, res) => {
  const { decisionId } = req.params;
  const { title, rationale, owner_id, review_at } = req.body;
  
  const sql = `
    UPDATE meeting_decisions 
    SET title = ?, rationale = ?, owner_id = ?, review_at = ?
    WHERE id = ?
  `;
  
  db.run(sql, [title, rationale, owner_id, review_at, decisionId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    db.get('SELECT * FROM meeting_decisions WHERE id = ?', [decisionId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, data: row });
    });
  });
});

// Get all decisions (for Decision Log tab)
router.get('/decisions', (req, res) => {
  db.all('SELECT * FROM meeting_decisions ORDER BY created_at DESC', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, data: rows || [] });
  });
});

// Get decisions for a specific meeting
router.get('/meetings/:meetingId/decisions', (req, res) => {
  const { meetingId } = req.params;
  
  db.all('SELECT * FROM meeting_decisions WHERE meeting_id = ? ORDER BY created_at DESC', [meetingId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, data: rows || [] });
  });
});

// Delete decision
router.delete('/meetings/:meetingId/decisions/:decisionId', (req, res) => {
  const { decisionId } = req.params;
  
  db.run('DELETE FROM meeting_decisions WHERE id = ?', [decisionId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, message: 'Decision deleted' });
  });
});

// ============================================
// ROLE MANAGEMENT ROUTES
// ============================================

// Update meeting roles
router.post('/meetings/:meetingId/roles', (req, res) => {
  const { meetingId } = req.params;
  const { facilitator, scribe, decision_maker } = req.body;
  
  // Check if roles exist
  db.get('SELECT * FROM meeting_roles WHERE meeting_id = ?', [meetingId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (row) {
      // Update existing roles
      const sql = `
        UPDATE meeting_roles 
        SET facilitator = ?, scribe = ?, decision_maker = ?, updated_at = CURRENT_TIMESTAMP
        WHERE meeting_id = ?
      `;
      
      db.run(sql, [facilitator, scribe, decision_maker, meetingId], function(updateErr) {
        if (updateErr) {
          return res.status(500).json({ error: updateErr.message });
        }
        
        db.get('SELECT * FROM meeting_roles WHERE meeting_id = ?', [meetingId], (err, updatedRow) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ success: true, data: updatedRow });
        });
      });
    } else {
      // Create new roles
      const roleId = `role-${Date.now()}`;
      const sql = `
        INSERT INTO meeting_roles (id, meeting_id, facilitator, scribe, decision_maker, created_at)
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      db.run(sql, [roleId, meetingId, facilitator, scribe, decision_maker], function(insertErr) {
        if (insertErr) {
          return res.status(500).json({ error: insertErr.message });
        }
        
        db.get('SELECT * FROM meeting_roles WHERE id = ?', [roleId], (err, newRow) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ success: true, data: newRow });
        });
      });
    }
  });
});

// Get meeting roles
router.get('/meetings/:meetingId/roles', (req, res) => {
  const { meetingId } = req.params;
  
  db.get('SELECT * FROM meeting_roles WHERE meeting_id = ?', [meetingId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, data: row || { facilitator: null, scribe: null, decision_maker: null } });
  });
});

// ============================================
// TIMER MANAGEMENT ROUTES
// ============================================

// Start meeting timer
router.post('/meetings/:meetingId/timer/start', (req, res) => {
  const { meetingId } = req.params;
  const { agenda_item_id } = req.body;
  const sessionId = `session-${Date.now()}`;
  
  const sql = `
    INSERT INTO meeting_timer_sessions (id, meeting_id, agenda_item_id, start_time, status, created_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'running', CURRENT_TIMESTAMP)
  `;
  
  db.run(sql, [sessionId, meetingId, agenda_item_id || null], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    db.get('SELECT * FROM meeting_timer_sessions WHERE id = ?', [sessionId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, data: row });
    });
  });
});

// Pause/Stop meeting timer
router.post('/meetings/:meetingId/timer/stop', (req, res) => {
  const { meetingId } = req.params;
  const { session_id, agenda_item_id } = req.body;
  
  // Find the running session
  let query = 'SELECT * FROM meeting_timer_sessions WHERE meeting_id = ? AND status = \'running\'';
  const params = [meetingId];
  
  if (session_id) {
    query += ' AND id = ?';
    params.push(session_id);
  } else if (agenda_item_id) {
    query += ' AND agenda_item_id = ?';
    params.push(agenda_item_id);
  }
  
  db.get(query, params, (err, session) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    if (!session) {
      return res.status(404).json({ error: 'No running timer session found' });
    }
    
    // Calculate duration
    const startTime = new Date(session.start_time);
    const endTime = new Date();
    const duration = Math.floor((endTime - startTime) / 1000); // Duration in seconds
    
    const sql = `
      UPDATE meeting_timer_sessions 
      SET end_time = CURRENT_TIMESTAMP, duration = ?, status = 'stopped'
      WHERE id = ?
    `;
    
    db.run(sql, [duration, session.id], function(updateErr) {
      if (updateErr) {
        return res.status(500).json({ error: updateErr.message });
      }
      
      // Update agenda item time_spent if applicable
      if (session.agenda_item_id) {
        db.run(
          'UPDATE meeting_agenda SET time_spent = time_spent + ? WHERE id = ?',
          [duration, session.agenda_item_id],
          (agendaErr) => {
            if (agendaErr) {
              console.error('Error updating agenda time:', agendaErr);
            }
          }
        );
      }
      
      db.get('SELECT * FROM meeting_timer_sessions WHERE id = ?', [session.id], (err, updatedRow) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ success: true, data: updatedRow });
      });
    });
  });
});

// Get timer sessions for a meeting
router.get('/meetings/:meetingId/timer/sessions', (req, res) => {
  const { meetingId } = req.params;
  
  db.all('SELECT * FROM meeting_timer_sessions WHERE meeting_id = ? ORDER BY created_at DESC', [meetingId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, data: rows || [] });
  });
});

// ============================================
// RECORDING & TRANSCRIPTION ROUTES
// ============================================

// Upload recording
router.post('/meetings/:meetingId/recording', (req, res) => {
  const { meetingId } = req.params;
  const { audio_url, duration, file_size, format } = req.body;
  const recordingId = `rec-${Date.now()}`;
  
  const sql = `
    INSERT INTO meeting_recordings (id, meeting_id, audio_url, duration, file_size, format, created_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `;
  
  db.run(sql, [recordingId, meetingId, audio_url, duration, file_size, format || 'webm'], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    db.get('SELECT * FROM meeting_recordings WHERE id = ?', [recordingId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, data: row });
    });
  });
});

// Update transcription
router.post('/meetings/:meetingId/transcribe', (req, res) => {
  const { meetingId } = req.params;
  const { recording_id, transcription, summary } = req.body;
  
  const sql = `
    UPDATE meeting_recordings 
    SET transcription = ?, summary = ?
    WHERE id = ? AND meeting_id = ?
  `;
  
  db.run(sql, [transcription, summary, recording_id, meetingId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    db.get('SELECT * FROM meeting_recordings WHERE id = ?', [recording_id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, data: row });
    });
  });
});

// Get recordings for a meeting
router.get('/meetings/:meetingId/recordings', (req, res) => {
  const { meetingId } = req.params;
  
  db.all('SELECT * FROM meeting_recordings WHERE meeting_id = ? ORDER BY created_at DESC', [meetingId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, data: rows || [] });
  });
});

// ============================================
// AFTER-ACTION PACKET ROUTES
// ============================================

// Generate after-action packet
router.post('/meetings/:meetingId/after-action', (req, res) => {
  const { meetingId } = req.params;
  const { summary, nps_score, nps_feedback } = req.body;
  const packetId = `packet-${Date.now()}`;
  
  // Get decisions and actions count
  db.get('SELECT COUNT(*) as count FROM meeting_decisions WHERE meeting_id = ?', [meetingId], (err, decisionsRow) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    const decisionsCount = decisionsRow.count;
    
    db.get('SELECT COUNT(*) as count FROM meeting_actions WHERE meeting_id = ?', [meetingId], (err, actionsRow) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      const actionsCount = actionsRow.count;
      
      const sql = `
        INSERT INTO meeting_after_action (id, meeting_id, summary, decisions_count, actions_count, nps_score, nps_feedback, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `;
      
      db.run(sql, [packetId, meetingId, summary, decisionsCount, actionsCount, nps_score, nps_feedback], function(insertErr) {
        if (insertErr) {
          return res.status(500).json({ error: insertErr.message });
        }
        
        db.get('SELECT * FROM meeting_after_action WHERE id = ?', [packetId], (err, row) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.json({ success: true, data: row });
        });
      });
    });
  });
});

// Get after-action packet
router.get('/meetings/:meetingId/after-action', (req, res) => {
  const { meetingId } = req.params;
  
  db.get('SELECT * FROM meeting_after_action WHERE meeting_id = ?', [meetingId], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ success: true, data: row });
  });
});

// Mark after-action packet as sent
router.post('/meetings/:meetingId/after-action/send', (req, res) => {
  const { meetingId } = req.params;
  
  const sql = `
    UPDATE meeting_after_action 
    SET email_sent = 1, sent_at = CURRENT_TIMESTAMP
    WHERE meeting_id = ?
  `;
  
  db.run(sql, [meetingId], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    
    db.get('SELECT * FROM meeting_after_action WHERE meeting_id = ?', [meetingId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, data: row });
    });
  });
});

// ============================================
// MEETING UPDATE WITH LINKS
// ============================================

// Update meeting (including links)
router.put('/meetings/:meetingId', (req, res) => {
  const { meetingId } = req.params;
  const { 
    title, 
    start_at, 
    end_at, 
    location, 
    status, 
    transcription_link, 
    recording_link,
    notes 
  } = req.body;
  
  // Build dynamic SQL based on provided fields
  const updates = [];
  const values = [];
  
  if (title !== undefined) {
    updates.push('title = ?');
    values.push(title);
  }
  if (start_at !== undefined) {
    updates.push('start_at = ?');
    values.push(start_at);
  }
  if (end_at !== undefined) {
    updates.push('end_at = ?');
    values.push(end_at);
  }
  if (location !== undefined) {
    updates.push('location = ?');
    values.push(location);
  }
  if (status !== undefined) {
    updates.push('status = ?');
    values.push(status);
  }
  if (transcription_link !== undefined) {
    updates.push('transcription_link = ?');
    values.push(transcription_link);
  }
  if (recording_link !== undefined) {
    updates.push('recording_link = ?');
    values.push(recording_link);
  }
  if (notes !== undefined) {
    updates.push('notes = ?');
    values.push(notes);
  }
  
  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }
  
  updates.push('updated_at = CURRENT_TIMESTAMP');
  values.push(meetingId);
  
  const sql = `UPDATE meetings SET ${updates.join(', ')} WHERE id = ?`;
  
  db.run(sql, values, function(err) {
    if (err) {
      console.error('Error updating meeting:', err);
      return res.status(500).json({ error: err.message });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    
    // Fetch updated meeting
    db.get('SELECT * FROM meetings WHERE id = ?', [meetingId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, data: row });
    });
  });
});

module.exports = router;
