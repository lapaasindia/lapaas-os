/**
 * Database Helper Module
 * Provides database access functions for all route files
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'lapaas.db');
let db = null;

// Initialize database connection
const initDb = () => {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Database connection error:', err);
      }
    });
  }
  return db;
};

// Get database instance
const getDb = () => {
  if (!db) {
    initDb();
  }
  return db;
};

// Promise wrapper for db.all
const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    getDb().all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

// Promise wrapper for db.get
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    getDb().get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

// Promise wrapper for db.run
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    getDb().run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

// ==================== MEETINGS ====================

const getMeetings = async (orgId, filters = {}) => {
  let sql = 'SELECT * FROM meetings WHERE org_id = ?';
  const params = [orgId];
  
  if (filters.user_id) {
    sql += ' AND (organizer_id = ? OR facilitator_id = ?)';
    params.push(filters.user_id, filters.user_id);
  }
  if (filters.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters.startDate) {
    sql += ' AND start_time >= ?';
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    sql += ' AND start_time <= ?';
    params.push(filters.endDate);
  }
  
  sql += ' ORDER BY start_time DESC';
  
  const meetings = await dbAll(sql, params);
  
  // Load related data for each meeting and map field names
  for (const meeting of meetings) {
    // Map database field names to API field names
    meeting.start_at = meeting.start_time;
    meeting.end_at = meeting.end_time;
    meeting.agendaItems = await dbAll(
      'SELECT * FROM meeting_agenda_items WHERE meeting_id = ? ORDER BY order_index',
      [meeting.id]
    );
    meeting.decisions = await dbAll(
      'SELECT * FROM meeting_decisions WHERE meeting_id = ?',
      [meeting.id]
    );
    meeting.actionItems = await dbAll(
      'SELECT * FROM meeting_action_items WHERE meeting_id = ?',
      [meeting.id]
    );
    meeting.attendees_list = await dbAll(
      'SELECT * FROM meeting_attendees WHERE meeting_id = ?',
      [meeting.id]
    );
    // Parse JSON fields
    if (meeting.attendees) {
      try { meeting.attendees = JSON.parse(meeting.attendees); } catch(e) { meeting.attendees = []; }
    }
  }
  
  return meetings;
};

const getMeetingById = async (meetingId) => {
  const meeting = await dbGet('SELECT * FROM meetings WHERE id = ?', [meetingId]);
  if (!meeting) return null;
  
  // Map database field names to API field names
  meeting.start_at = meeting.start_time;
  meeting.end_at = meeting.end_time;
  
  meeting.agendaItems = await dbAll(
    'SELECT * FROM meeting_agenda_items WHERE meeting_id = ? ORDER BY order_index',
    [meetingId]
  );
  meeting.decisions = await dbAll(
    'SELECT * FROM meeting_decisions WHERE meeting_id = ?',
    [meetingId]
  );
  meeting.actionItems = await dbAll(
    'SELECT * FROM meeting_action_items WHERE meeting_id = ?',
    [meetingId]
  );
  meeting.attendees_list = await dbAll(
    'SELECT * FROM meeting_attendees WHERE meeting_id = ?',
    [meetingId]
  );
  if (meeting.attendees) {
    try { meeting.attendees = JSON.parse(meeting.attendees); } catch(e) { meeting.attendees = []; }
  }
  
  return meeting;
};

const createMeeting = async (meeting) => {
  const id = meeting.id || `mtg-${Date.now()}`;
  const now = new Date().toISOString();
  
  await dbRun(`
    INSERT INTO meetings (id, org_id, title, description, purpose, expected_outcomes, location, 
      meeting_type, status, start_time, end_time, duration_minutes, organizer_id, organizer_name,
      facilitator_id, scribe_id, decision_maker_id, attendees, is_recurring, recurrence_rule,
      notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id, meeting.org_id, meeting.title, meeting.description || '', meeting.purpose || '',
    meeting.expected_outcomes || '', meeting.location || '', meeting.meeting_type || 'internal',
    meeting.status || 'scheduled', meeting.start_time, meeting.end_time, meeting.duration_minutes || 30,
    meeting.organizer_id, meeting.organizer_name, meeting.facilitator_id, meeting.scribe_id,
    meeting.decision_maker_id, JSON.stringify(meeting.attendees || []), meeting.is_recurring ? 1 : 0,
    meeting.recurrence_rule, meeting.notes || '', now, now
  ]);
  
  // Insert agenda items
  if (meeting.agendaItems && meeting.agendaItems.length > 0) {
    for (let i = 0; i < meeting.agendaItems.length; i++) {
      const item = meeting.agendaItems[i];
      await dbRun(`
        INSERT INTO meeting_agenda_items (id, meeting_id, title, description, duration_minutes, 
          presenter_id, presenter_name, order_index, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        item.id || `agenda-${Date.now()}-${i}`, id, item.title, item.description || '',
        item.duration_minutes || item.duration || 5, item.presenter_id, item.presenter_name,
        i, item.status || 'pending'
      ]);
    }
  }
  
  return getMeetingById(id);
};

const updateMeeting = async (meetingId, updates) => {
  const fields = [];
  const values = [];
  
  const allowedFields = ['title', 'description', 'purpose', 'expected_outcomes', 'location',
    'meeting_type', 'status', 'start_time', 'end_time', 'duration_minutes', 'notes'];
  
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(updates[field]);
    }
  }
  
  if (fields.length > 0) {
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(meetingId);
    
    await dbRun(`UPDATE meetings SET ${fields.join(', ')} WHERE id = ?`, values);
  }
  
  return getMeetingById(meetingId);
};

const deleteMeeting = async (meetingId) => {
  await dbRun('DELETE FROM meeting_agenda_items WHERE meeting_id = ?', [meetingId]);
  await dbRun('DELETE FROM meeting_decisions WHERE meeting_id = ?', [meetingId]);
  await dbRun('DELETE FROM meeting_action_items WHERE meeting_id = ?', [meetingId]);
  await dbRun('DELETE FROM meeting_attendees WHERE meeting_id = ?', [meetingId]);
  await dbRun('DELETE FROM meetings WHERE id = ?', [meetingId]);
};

// Meeting Decisions
const addMeetingDecision = async (meetingId, decision) => {
  const id = decision.id || `dec-${Date.now()}`;
  await dbRun(`
    INSERT INTO meeting_decisions (id, meeting_id, decision, rationale, owner_id, owner_name, review_date, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, meetingId, decision.decision, decision.rationale || '', decision.owner_id,
      decision.owner_name, decision.review_date, decision.status || 'approved']);
  return dbGet('SELECT * FROM meeting_decisions WHERE id = ?', [id]);
};

const deleteMeetingDecision = async (decisionId) => {
  await dbRun('DELETE FROM meeting_decisions WHERE id = ?', [decisionId]);
};

// Meeting Action Items
const addMeetingActionItem = async (meetingId, actionItem) => {
  const id = actionItem.id || `action-${Date.now()}`;
  await dbRun(`
    INSERT INTO meeting_action_items (id, meeting_id, decision_id, title, description, 
      assignee_id, assignee_name, due_date, priority, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, meetingId, actionItem.decision_id, actionItem.title, actionItem.description || '',
      actionItem.assignee_id, actionItem.assignee_name, actionItem.due_date,
      actionItem.priority || 'medium', actionItem.status || 'pending']);
  return dbGet('SELECT * FROM meeting_action_items WHERE id = ?', [id]);
};

const updateMeetingActionItem = async (actionId, updates) => {
  const fields = [];
  const values = [];
  
  if (updates.status !== undefined) { fields.push('status = ?'); values.push(updates.status); }
  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
  if (updates.assignee_id !== undefined) { fields.push('assignee_id = ?'); values.push(updates.assignee_id); }
  if (updates.assignee_name !== undefined) { fields.push('assignee_name = ?'); values.push(updates.assignee_name); }
  if (updates.due_date !== undefined) { fields.push('due_date = ?'); values.push(updates.due_date); }
  if (updates.completed_at !== undefined) { fields.push('completed_at = ?'); values.push(updates.completed_at); }
  
  if (fields.length > 0) {
    values.push(actionId);
    await dbRun(`UPDATE meeting_action_items SET ${fields.join(', ')} WHERE id = ?`, values);
  }
  
  return dbGet('SELECT * FROM meeting_action_items WHERE id = ?', [actionId]);
};

const deleteMeetingActionItem = async (actionId) => {
  await dbRun('DELETE FROM meeting_action_items WHERE id = ?', [actionId]);
};

// Meeting Agenda Items
const addAgendaItem = async (meetingId, item) => {
  const id = item.id || `agenda-${Date.now()}`;
  const maxOrder = await dbGet(
    'SELECT MAX(order_index) as max FROM meeting_agenda_items WHERE meeting_id = ?',
    [meetingId]
  );
  const orderIndex = (maxOrder?.max || 0) + 1;
  
  await dbRun(`
    INSERT INTO meeting_agenda_items (id, meeting_id, title, description, duration_minutes, 
      presenter_id, presenter_name, order_index, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [id, meetingId, item.title, item.description || '', item.duration_minutes || item.duration || 5,
      item.presenter_id, item.presenter_name, orderIndex, item.status || 'pending']);
  
  return dbGet('SELECT * FROM meeting_agenda_items WHERE id = ?', [id]);
};

const deleteAgendaItem = async (agendaId) => {
  await dbRun('DELETE FROM meeting_agenda_items WHERE id = ?', [agendaId]);
};

// ==================== REQUESTS ====================

const getRequests = async (orgId, filters = {}) => {
  let sql = 'SELECT * FROM requests WHERE org_id = ?';
  const params = [orgId];
  
  // user_id filter - show requests where user is requester OR routed_to
  if (filters.user_id) {
    sql += ' AND (requester_id = ? OR routed_to_id = ?)';
    params.push(filters.user_id, filters.user_id);
  }
  if (filters.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters.requester_id) {
    sql += ' AND requester_id = ?';
    params.push(filters.requester_id);
  }
  if (filters.routed_to_id) {
    sql += ' AND routed_to_id = ?';
    params.push(filters.routed_to_id);
  }
  
  sql += ' ORDER BY created_at DESC';
  
  const requests = await dbAll(sql, params);
  
  // Parse JSON fields
  for (const req of requests) {
    if (req.attachments) {
      try { req.attachments = JSON.parse(req.attachments); } catch(e) { req.attachments = []; }
    }
  }
  
  return requests;
};

const getRequestById = async (requestId) => {
  const request = await dbGet('SELECT * FROM requests WHERE id = ?', [requestId]);
  if (request && request.attachments) {
    try { request.attachments = JSON.parse(request.attachments); } catch(e) { request.attachments = []; }
  }
  return request;
};

const createRequest = async (request) => {
  const id = request.id || `req-${Date.now()}`;
  const now = new Date().toISOString();
  
  // Calculate SLA based on urgency
  const slaHours = { P1: 1, P2: 4, P3: 24, P4: 72 };
  const hours = slaHours[request.urgency] || 24;
  const slaAt = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
  
  await dbRun(`
    INSERT INTO requests (id, org_id, requester_id, requester_name, requester_email, category,
      urgency, description, what_tried, impact, deadline, attachments, status, routed_to_id,
      routed_to_name, routed_to_email, request_type, sla_at, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id, request.org_id, request.requester_id, request.requester_name, request.requester_email,
    request.category, request.urgency || 'P3', request.description, request.what_tried || '',
    request.impact || '', request.deadline, JSON.stringify(request.attachments || []),
    request.status || 'pending', request.routed_to_id, request.routed_to_name, request.routed_to_email,
    request.request_type || 'to_founder', slaAt, now, now
  ]);
  
  return getRequestById(id);
};

const updateRequest = async (requestId, updates) => {
  const fields = [];
  const values = [];
  
  const allowedFields = ['status', 'response', 'responded_at', 'routed_to_id', 'routed_to_name',
    'routed_to_email', 'delegated_to_id', 'delegated_at', 'sla_breached'];
  
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(updates[field]);
    }
  }
  
  if (fields.length > 0) {
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(requestId);
    
    await dbRun(`UPDATE requests SET ${fields.join(', ')} WHERE id = ?`, values);
  }
  
  return getRequestById(requestId);
};

const deleteRequest = async (requestId) => {
  await dbRun('DELETE FROM requests WHERE id = ?', [requestId]);
};

// ==================== TASKS ====================

const getTasks = async (orgId, filters = {}) => {
  let sql = 'SELECT * FROM tasks WHERE org_id = ?';
  const params = [orgId];
  
  if (filters.user_id) {
    sql += ' AND user_id = ?';
    params.push(filters.user_id);
  }
  if (filters.status) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters.due_date) {
    sql += ' AND due_date = ?';
    params.push(filters.due_date);
  }
  
  sql += ' ORDER BY due_date ASC, priority DESC';
  
  const tasks = await dbAll(sql, params);
  
  // Load subtasks for each task
  for (const task of tasks) {
    task.subtasks = await dbAll(
      'SELECT * FROM task_subtasks WHERE task_id = ? ORDER BY order_index',
      [task.id]
    );
    if (task.tags) {
      try { task.tags = JSON.parse(task.tags); } catch(e) { task.tags = []; }
    }
  }
  
  return tasks;
};

const getTaskById = async (taskId) => {
  const task = await dbGet('SELECT * FROM tasks WHERE id = ?', [taskId]);
  if (!task) return null;
  
  task.subtasks = await dbAll(
    'SELECT * FROM task_subtasks WHERE task_id = ? ORDER BY order_index',
    [taskId]
  );
  if (task.tags) {
    try { task.tags = JSON.parse(task.tags); } catch(e) { task.tags = []; }
  }
  
  return task;
};

const createTask = async (task) => {
  const id = task.id || `task-${Date.now()}`;
  const now = new Date().toISOString();
  
  await dbRun(`
    INSERT INTO tasks (id, org_id, user_id, title, description, priority, status, due_date,
      due_time, estimated_minutes, is_recurring, recurrence_rule, is_blocked, blocked_reason,
      parent_task_id, project_id, assignee_id, assignee_name, tags, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id, task.org_id, task.user_id, task.title, task.description || '', task.priority || 'medium',
    task.status || 'pending', task.due_date, task.due_time, task.estimated_minutes || 30,
    task.is_recurring ? 1 : 0, task.recurrence_rule, task.is_blocked ? 1 : 0, task.blocked_reason,
    task.parent_task_id, task.project_id, task.assignee_id, task.assignee_name,
    JSON.stringify(task.tags || []), now, now
  ]);
  
  // Insert subtasks
  if (task.subtasks && task.subtasks.length > 0) {
    for (let i = 0; i < task.subtasks.length; i++) {
      const subtask = task.subtasks[i];
      await dbRun(`
        INSERT INTO task_subtasks (id, task_id, title, completed, order_index)
        VALUES (?, ?, ?, ?, ?)
      `, [subtask.id || `subtask-${Date.now()}-${i}`, id, subtask.title, subtask.completed ? 1 : 0, i]);
    }
  }
  
  return getTaskById(id);
};

const updateTask = async (taskId, updates) => {
  const fields = [];
  const values = [];
  
  const allowedFields = ['title', 'description', 'priority', 'status', 'due_date', 'due_time',
    'estimated_minutes', 'actual_minutes', 'is_recurring', 'is_blocked', 'blocked_reason',
    'assignee_id', 'assignee_name', 'completed_at', 'scheduled_start_time', 'scheduled_end_time'];
  
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(updates[field]);
    }
  }
  
  if (updates.tags !== undefined) {
    fields.push('tags = ?');
    values.push(JSON.stringify(updates.tags));
  }
  
  if (fields.length > 0) {
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(taskId);
    
    await dbRun(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`, values);
  }
  
  return getTaskById(taskId);
};

const deleteTask = async (taskId) => {
  await dbRun('DELETE FROM task_subtasks WHERE task_id = ?', [taskId]);
  await dbRun('DELETE FROM tasks WHERE id = ?', [taskId]);
};

// Task Subtasks
const addTaskSubtask = async (taskId, subtask) => {
  const id = subtask.id || `subtask-${Date.now()}`;
  const maxOrder = await dbGet(
    'SELECT MAX(order_index) as max FROM task_subtasks WHERE task_id = ?',
    [taskId]
  );
  const orderIndex = (maxOrder?.max || 0) + 1;
  
  await dbRun(`
    INSERT INTO task_subtasks (id, task_id, title, completed, order_index)
    VALUES (?, ?, ?, ?, ?)
  `, [id, taskId, subtask.title, subtask.completed ? 1 : 0, orderIndex]);
  
  return dbGet('SELECT * FROM task_subtasks WHERE id = ?', [id]);
};

const updateTaskSubtask = async (subtaskId, updates) => {
  const fields = [];
  const values = [];
  
  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
  if (updates.completed !== undefined) { fields.push('completed = ?'); values.push(updates.completed ? 1 : 0); }
  
  if (fields.length > 0) {
    values.push(subtaskId);
    await dbRun(`UPDATE task_subtasks SET ${fields.join(', ')} WHERE id = ?`, values);
  }
  
  return dbGet('SELECT * FROM task_subtasks WHERE id = ?', [subtaskId]);
};

const deleteTaskSubtask = async (subtaskId) => {
  await dbRun('DELETE FROM task_subtasks WHERE id = ?', [subtaskId]);
};

// ==================== COMMITMENTS ====================

const getCommitments = async (orgId, filters = {}) => {
  let sql = 'SELECT * FROM commitments WHERE org_id = ?';
  const params = [orgId];
  
  if (filters.user_id) {
    sql += ' AND user_id = ?';
    params.push(filters.user_id);
  }
  if (filters.date) {
    sql += ' AND date = ?';
    params.push(filters.date);
  }
  
  sql += ' ORDER BY priority ASC, created_at ASC';
  
  const commitments = await dbAll(sql, params);
  
  // Load subtasks for each commitment
  for (const commitment of commitments) {
    commitment.subtasks = await dbAll(
      'SELECT * FROM commitment_subtasks WHERE commitment_id = ? ORDER BY order_index',
      [commitment.id]
    );
  }
  
  return commitments;
};

const getCommitmentById = async (commitmentId) => {
  const commitment = await dbGet('SELECT * FROM commitments WHERE id = ?', [commitmentId]);
  if (!commitment) return null;
  
  commitment.subtasks = await dbAll(
    'SELECT * FROM commitment_subtasks WHERE commitment_id = ? ORDER BY order_index',
    [commitmentId]
  );
  
  return commitment;
};

const createCommitment = async (commitment) => {
  const id = commitment.id || `comm-${Date.now()}`;
  const now = new Date().toISOString();
  
  await dbRun(`
    INSERT INTO commitments (id, org_id, user_id, title, description, date, effort_minutes,
      priority, status, linked_task_id, linked_project_id, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id, commitment.org_id, commitment.user_id, commitment.title, commitment.description || '',
    commitment.date, commitment.effort_minutes || 30, commitment.priority || 1,
    commitment.status || 'pending', commitment.linked_task_id, commitment.linked_project_id,
    commitment.notes || '', now, now
  ]);
  
  // Insert subtasks
  if (commitment.subtasks && commitment.subtasks.length > 0) {
    for (let i = 0; i < commitment.subtasks.length; i++) {
      const subtask = commitment.subtasks[i];
      await dbRun(`
        INSERT INTO commitment_subtasks (id, commitment_id, title, completed, order_index)
        VALUES (?, ?, ?, ?, ?)
      `, [subtask.id || `csubtask-${Date.now()}-${i}`, id, subtask.title, subtask.completed ? 1 : 0, i]);
    }
  }
  
  return getCommitmentById(id);
};

const updateCommitment = async (commitmentId, updates) => {
  const fields = [];
  const values = [];
  
  const allowedFields = ['title', 'description', 'date', 'effort_minutes', 'actual_minutes',
    'priority', 'status', 'notes', 'score', 'completed_at'];
  
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(updates[field]);
    }
  }
  
  if (fields.length > 0) {
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(commitmentId);
    
    await dbRun(`UPDATE commitments SET ${fields.join(', ')} WHERE id = ?`, values);
  }
  
  return getCommitmentById(commitmentId);
};

const deleteCommitment = async (commitmentId) => {
  await dbRun('DELETE FROM commitment_subtasks WHERE commitment_id = ?', [commitmentId]);
  await dbRun('DELETE FROM commitments WHERE id = ?', [commitmentId]);
};

// ==================== TIME BLOCKS ====================

const getTimeBlocks = async (orgId, filters = {}) => {
  let sql = 'SELECT * FROM time_blocks WHERE org_id = ?';
  const params = [orgId];
  
  if (filters.user_id) {
    sql += ' AND user_id = ?';
    params.push(filters.user_id);
  }
  if (filters.date) {
    sql += ' AND date = ?';
    params.push(filters.date);
  }
  
  sql += ' ORDER BY date ASC, start_time ASC';
  
  return dbAll(sql, params);
};

const createTimeBlock = async (block) => {
  const id = block.id || `tb-${Date.now()}`;
  const now = new Date().toISOString();
  
  await dbRun(`
    INSERT INTO time_blocks (id, org_id, user_id, title, block_type, date, start_time, end_time,
      duration_minutes, target_minutes, color, is_recurring, recurrence_rule, status, notes, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id, block.org_id, block.user_id, block.title || block.block_type, block.block_type || 'deep_work',
    block.date, block.start_time, block.end_time, block.duration_minutes, block.target_minutes,
    block.color, block.is_recurring ? 1 : 0, block.recurrence_rule, block.status || 'scheduled',
    block.notes || '', now, now
  ]);
  
  return dbGet('SELECT * FROM time_blocks WHERE id = ?', [id]);
};

const updateTimeBlock = async (blockId, updates) => {
  const fields = [];
  const values = [];
  
  const allowedFields = ['title', 'block_type', 'date', 'start_time', 'end_time', 'duration_minutes',
    'target_minutes', 'actual_minutes', 'color', 'status', 'notes'];
  
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(updates[field]);
    }
  }
  
  if (fields.length > 0) {
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(blockId);
    
    await dbRun(`UPDATE time_blocks SET ${fields.join(', ')} WHERE id = ?`, values);
  }
  
  return dbGet('SELECT * FROM time_blocks WHERE id = ?', [blockId]);
};

const deleteTimeBlock = async (blockId) => {
  await dbRun('DELETE FROM time_blocks WHERE id = ?', [blockId]);
};

// ==================== KNOWLEDGE BASE ====================

const getKBCategories = async (orgId) => {
  const categories = await dbAll(
    'SELECT * FROM kb_categories WHERE org_id = ? ORDER BY order_index',
    [orgId]
  );
  
  // Add article count
  for (const cat of categories) {
    const count = await dbGet(
      'SELECT COUNT(*) as count FROM kb_articles WHERE category_id = ?',
      [cat.id]
    );
    cat.articleCount = count?.count || 0;
  }
  
  return categories;
};

const createKBCategory = async (category) => {
  const id = category.id || `cat-${Date.now()}`;
  const maxOrder = await dbGet(
    'SELECT MAX(order_index) as max FROM kb_categories WHERE org_id = ?',
    [category.org_id]
  );
  
  await dbRun(`
    INSERT INTO kb_categories (id, org_id, name, description, icon, order_index)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [id, category.org_id, category.name, category.description || '', category.icon || '📄',
      (maxOrder?.max || 0) + 1]);
  
  return dbGet('SELECT * FROM kb_categories WHERE id = ?', [id]);
};

const updateKBCategory = async (categoryId, updates) => {
  const fields = [];
  const values = [];
  
  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.description !== undefined) { fields.push('description = ?'); values.push(updates.description); }
  if (updates.icon !== undefined) { fields.push('icon = ?'); values.push(updates.icon); }
  if (updates.order_index !== undefined) { fields.push('order_index = ?'); values.push(updates.order_index); }
  
  if (fields.length > 0) {
    values.push(categoryId);
    await dbRun(`UPDATE kb_categories SET ${fields.join(', ')} WHERE id = ?`, values);
  }
  
  return dbGet('SELECT * FROM kb_categories WHERE id = ?', [categoryId]);
};

const deleteKBCategory = async (categoryId) => {
  // Check if category has articles
  const count = await dbGet(
    'SELECT COUNT(*) as count FROM kb_articles WHERE category_id = ?',
    [categoryId]
  );
  if (count?.count > 0) {
    throw new Error('Cannot delete category with articles');
  }
  await dbRun('DELETE FROM kb_categories WHERE id = ?', [categoryId]);
};

const getKBArticles = async (orgId, filters = {}) => {
  let sql = 'SELECT * FROM kb_articles WHERE org_id = ?';
  const params = [orgId];
  
  if (filters.category_id) {
    sql += ' AND category_id = ?';
    params.push(filters.category_id);
  }
  if (filters.search) {
    sql += ' AND (title LIKE ? OR content LIKE ? OR tags LIKE ?)';
    const searchTerm = `%${filters.search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  sql += ' ORDER BY view_count DESC';
  
  const articles = await dbAll(sql, params);
  
  // Parse tags
  for (const article of articles) {
    if (article.tags) {
      try { article.tags = JSON.parse(article.tags); } catch(e) { article.tags = []; }
    }
    // Get category name
    if (article.category_id) {
      const cat = await dbGet('SELECT name FROM kb_categories WHERE id = ?', [article.category_id]);
      article.category = cat?.name || '';
    }
  }
  
  return articles;
};

const getKBArticleById = async (articleId, incrementView = false) => {
  if (incrementView) {
    await dbRun('UPDATE kb_articles SET view_count = view_count + 1 WHERE id = ?', [articleId]);
  }
  
  const article = await dbGet('SELECT * FROM kb_articles WHERE id = ?', [articleId]);
  if (article) {
    if (article.tags) {
      try { article.tags = JSON.parse(article.tags); } catch(e) { article.tags = []; }
    }
    if (article.category_id) {
      const cat = await dbGet('SELECT name FROM kb_categories WHERE id = ?', [article.category_id]);
      article.category = cat?.name || '';
    }
  }
  return article;
};

const createKBArticle = async (article) => {
  const id = article.id || `kb-${Date.now()}`;
  const now = new Date().toISOString();
  
  await dbRun(`
    INSERT INTO kb_articles (id, org_id, category_id, title, content, tags, view_count, 
      helpful_count, created_by, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id, article.org_id, article.category_id, article.title, article.content,
    JSON.stringify(article.tags || []), 0, 0, article.created_by, now, now
  ]);
  
  return getKBArticleById(id);
};

const updateKBArticle = async (articleId, updates) => {
  const fields = [];
  const values = [];
  
  if (updates.title !== undefined) { fields.push('title = ?'); values.push(updates.title); }
  if (updates.content !== undefined) { fields.push('content = ?'); values.push(updates.content); }
  if (updates.category_id !== undefined) { fields.push('category_id = ?'); values.push(updates.category_id); }
  if (updates.tags !== undefined) { fields.push('tags = ?'); values.push(JSON.stringify(updates.tags)); }
  
  if (fields.length > 0) {
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(articleId);
    
    await dbRun(`UPDATE kb_articles SET ${fields.join(', ')} WHERE id = ?`, values);
  }
  
  return getKBArticleById(articleId);
};

const deleteKBArticle = async (articleId) => {
  await dbRun('DELETE FROM kb_articles WHERE id = ?', [articleId]);
};

const markKBArticleHelpful = async (articleId) => {
  await dbRun('UPDATE kb_articles SET helpful_count = helpful_count + 1 WHERE id = ?', [articleId]);
  return getKBArticleById(articleId);
};

// ==================== CALENDAR EVENTS ====================

const getCalendarEvents = async (orgId, filters = {}) => {
  let sql = 'SELECT * FROM calendar_events WHERE org_id = ?';
  const params = [orgId];
  
  if (filters.user_id) {
    sql += ' AND user_id = ?';
    params.push(filters.user_id);
  }
  if (filters.start_date) {
    sql += ' AND start_time >= ?';
    params.push(filters.start_date);
  }
  if (filters.end_date) {
    sql += ' AND start_time <= ?';
    params.push(filters.end_date);
  }
  
  sql += ' ORDER BY start_time ASC';
  
  return dbAll(sql, params);
};

const createCalendarEvent = async (event) => {
  const id = event.id || `event-${Date.now()}`;
  const now = new Date().toISOString();
  
  await dbRun(`
    INSERT INTO calendar_events (id, org_id, user_id, title, description, event_type, start_time,
      end_time, all_day, location, color, is_recurring, recurrence_rule, reminder_minutes,
      linked_meeting_id, linked_task_id, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    id, event.org_id, event.user_id, event.title, event.description || '', event.event_type || 'event',
    event.start_time, event.end_time, event.all_day ? 1 : 0, event.location || '', event.color,
    event.is_recurring ? 1 : 0, event.recurrence_rule, event.reminder_minutes,
    event.linked_meeting_id, event.linked_task_id, event.status || 'confirmed', now, now
  ]);
  
  return dbGet('SELECT * FROM calendar_events WHERE id = ?', [id]);
};

const updateCalendarEvent = async (eventId, updates) => {
  const fields = [];
  const values = [];
  
  const allowedFields = ['title', 'description', 'event_type', 'start_time', 'end_time',
    'all_day', 'location', 'color', 'status'];
  
  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      fields.push(`${field} = ?`);
      values.push(updates[field]);
    }
  }
  
  if (fields.length > 0) {
    fields.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(eventId);
    
    await dbRun(`UPDATE calendar_events SET ${fields.join(', ')} WHERE id = ?`, values);
  }
  
  return dbGet('SELECT * FROM calendar_events WHERE id = ?', [eventId]);
};

const deleteCalendarEvent = async (eventId) => {
  await dbRun('DELETE FROM calendar_events WHERE id = ?', [eventId]);
};

module.exports = {
  initDb,
  getDb,
  dbAll,
  dbGet,
  dbRun,
  
  // Meetings
  getMeetings,
  getMeetingById,
  createMeeting,
  updateMeeting,
  deleteMeeting,
  addMeetingDecision,
  deleteMeetingDecision,
  addMeetingActionItem,
  updateMeetingActionItem,
  deleteMeetingActionItem,
  addAgendaItem,
  deleteAgendaItem,
  
  // Requests
  getRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
  
  // Tasks
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  addTaskSubtask,
  updateTaskSubtask,
  deleteTaskSubtask,
  
  // Commitments
  getCommitments,
  getCommitmentById,
  createCommitment,
  updateCommitment,
  deleteCommitment,
  
  // Time Blocks
  getTimeBlocks,
  createTimeBlock,
  updateTimeBlock,
  deleteTimeBlock,
  
  // Knowledge Base
  getKBCategories,
  createKBCategory,
  updateKBCategory,
  deleteKBCategory,
  getKBArticles,
  getKBArticleById,
  createKBArticle,
  updateKBArticle,
  deleteKBArticle,
  markKBArticleHelpful,
  
  // Calendar Events
  getCalendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent
};
