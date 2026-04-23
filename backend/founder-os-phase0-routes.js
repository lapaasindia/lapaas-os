// Founder OS Phase 0 - Complete Backend Routes (Part 1)
// Personal Productivity + Meeting OS endpoints

const sampleData = require('./founder-os-sample-data');
const dbHelper = require('./db-helper');

const db = {
  calendar_events: [],
  time_blocks: sampleData.time_blocks,
  commitments: sampleData.commitments,
  tasks: sampleData.tasks,
  recurring_tasks: [],
  focus_sessions: [],
  meetings: sampleData.meetings,
  recurring_meetings: [],
  meeting_decisions: [],
  meeting_actions: [],
  audio_records: [],
  requests: sampleData.requests,
  escalation_rules: [],
  office_hours: sampleData.office_hours,
  notes: [],
  wiki_pages: [],
  threads: [],
  messages: [],
  emails_outbox: [],
  emails_inbox: [],
  notifications: [],
  audit_logs: []
};

module.exports = (app) => {
  // ============ PERSONAL PRODUCTIVITY (15 endpoints) ============

  app.get(['/api/v1/calendar/events', '/api/v1/calendar'], (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    const events = db.calendar_events.filter(e => e.org_id === org_id);
    res.json({ success: true, data: events, total: events.length });
  });

  app.post(['/api/v1/calendar/events', '/api/v1/calendar'], (req, res) => {
    const event = { id: `cal-${Date.now()}`, org_id: 'org-001', ...req.body, created_at: new Date().toISOString() };
    db.calendar_events.push(event);
    res.status(201).json({ success: true, data: event });
  });

  app.put(['/api/v1/calendar/events/:id', '/api/v1/calendar/:id'], (req, res) => {
    const event = db.calendar_events.find(e => e.id === req.params.id);
    if (!event) return res.status(404).json({ error: 'Not found' });
    Object.assign(event, req.body);
    res.json({ success: true, data: event });
  });

  app.delete(['/api/v1/calendar/events/:id', '/api/v1/calendar/:id'], (req, res) => {
    const idx = db.calendar_events.findIndex(e => e.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const event = db.calendar_events.splice(idx, 1)[0];
    res.json({ success: true, data: event });
  });

  // Time Blocks
  app.get('/api/v1/time-blocks', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    const blocks = db.time_blocks.filter(b => b.org_id === org_id);
    res.json({ success: true, data: blocks, total: blocks.length });
  });

  app.post('/api/v1/time-blocks', (req, res) => {
    const block = { id: `tb-${Date.now()}`, org_id: 'org-001', ...req.body, created_at: new Date().toISOString() };
    db.time_blocks.push(block);
    res.status(201).json({ success: true, data: block });
  });

  app.put('/api/v1/time-blocks/:id', (req, res) => {
    const block = db.time_blocks.find(b => b.id === req.params.id);
    if (!block) return res.status(404).json({ error: 'Not found' });
    Object.assign(block, req.body);
    res.json({ success: true, data: block });
  });

  app.delete('/api/v1/time-blocks/:id', (req, res) => {
    const idx = db.time_blocks.findIndex(b => b.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const block = db.time_blocks.splice(idx, 1)[0];
    res.json({ success: true, data: block });
  });

  // Commitments
  app.get('/api/v1/commitments', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    const commitments = db.commitments.filter(c => c.org_id === org_id);
    res.json({ success: true, data: commitments, total: commitments.length });
  });

  app.post('/api/v1/commitments', (req, res) => {
    const commitment = { id: `com-${Date.now()}`, org_id: 'org-001', ...req.body, created_at: new Date().toISOString() };
    db.commitments.push(commitment);
    res.status(201).json({ success: true, data: commitment });
  });

  app.put('/api/v1/commitments/:id', (req, res) => {
    const commitment = db.commitments.find(c => c.id === req.params.id);
    if (!commitment) return res.status(404).json({ error: 'Not found' });
    Object.assign(commitment, req.body);
    res.json({ success: true, data: commitment });
  });

  app.delete('/api/v1/commitments/:id', (req, res) => {
    const idx = db.commitments.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const commitment = db.commitments.splice(idx, 1)[0];
    res.json({ success: true, data: commitment });
  });

  // Tasks
  app.get('/api/v1/tasks', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    const tasks = db.tasks.filter(t => t.org_id === org_id);
    res.json({ success: true, data: tasks, total: tasks.length });
  });

  app.post('/api/v1/tasks', (req, res) => {
    const task = { id: `task-${Date.now()}`, org_id: 'org-001', ...req.body, created_at: new Date().toISOString() };
    db.tasks.push(task);
    res.status(201).json({ success: true, data: task });
  });

  app.put('/api/v1/tasks/:id', (req, res) => {
    const task = db.tasks.find(t => t.id === req.params.id);
    if (!task) return res.status(404).json({ error: 'Not found' });
    Object.assign(task, req.body);
    res.json({ success: true, data: task });
  });

  app.delete('/api/v1/tasks/:id', (req, res) => {
    const idx = db.tasks.findIndex(t => t.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const task = db.tasks.splice(idx, 1)[0];
    res.json({ success: true, data: task });
  });

  // Focus Sessions
  app.get('/api/v1/focus-sessions', (req, res) => {
    const user_id = req.query.user_id || 'user-001';
    const sessions = db.focus_sessions.filter(s => s.user_id === user_id);
    res.json({ success: true, data: sessions, total: sessions.length });
  });

  app.post('/api/v1/focus-sessions', (req, res) => {
    const session = { id: `fs-${Date.now()}`, ...req.body, created_at: new Date().toISOString() };
    db.focus_sessions.push(session);
    res.status(201).json({ success: true, data: session });
  });

  // ============ MEETING OS (12 endpoints) ============

  app.get('/api/v1/meetings', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    const meetings = db.meetings.filter(m => m.org_id === org_id);
    res.json({ success: true, data: meetings, total: meetings.length });
  });

  app.post('/api/v1/meetings', (req, res) => {
    const meeting = { id: `mtg-${Date.now()}`, org_id: 'org-001', ...req.body, created_at: new Date().toISOString() };
    db.meetings.push(meeting);
    res.status(201).json({ success: true, data: meeting });
  });

  app.put('/api/v1/meetings/:id', (req, res) => {
    const meeting = db.meetings.find(m => m.id === req.params.id);
    if (!meeting) return res.status(404).json({ error: 'Not found' });
    Object.assign(meeting, req.body);
    res.json({ success: true, data: meeting });
  });

  app.delete('/api/v1/meetings/:id', (req, res) => {
    const idx = db.meetings.findIndex(m => m.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const meeting = db.meetings.splice(idx, 1)[0];
    res.json({ success: true, data: meeting });
  });

  // Meeting Decisions
  app.get('/api/v1/meetings/:id/decisions', (req, res) => {
    const decisions = db.meeting_decisions.filter(d => d.meeting_id === req.params.id);
    res.json({ success: true, data: decisions, total: decisions.length });
  });

  app.post('/api/v1/meetings/:id/decisions', (req, res) => {
    const decision = { id: `dec-${Date.now()}`, meeting_id: req.params.id, ...req.body, created_at: new Date().toISOString() };
    db.meeting_decisions.push(decision);
    
    // Auto-create task
    const task = { id: `task-${Date.now()}`, org_id: 'org-001', owner_id: req.body.owner_id, title: `Follow up: ${req.body.title}`, status: 'pending', due_at: req.body.review_at, created_at: new Date().toISOString() };
    db.tasks.push(task);
    
    res.status(201).json({ success: true, data: decision, auto_task: task });
  });

  app.put('/api/v1/meetings/:id/decisions/:decision_id', (req, res) => {
    const decision = db.meeting_decisions.find(d => d.id === req.params.decision_id);
    if (!decision) return res.status(404).json({ error: 'Not found' });
    Object.assign(decision, req.body);
    res.json({ success: true, data: decision });
  });

  app.delete('/api/v1/meetings/:id/decisions/:decision_id', (req, res) => {
    const idx = db.meeting_decisions.findIndex(d => d.id === req.params.decision_id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const decision = db.meeting_decisions.splice(idx, 1)[0];
    res.json({ success: true, data: decision });
  });

  // Meeting Actions
  app.get('/api/v1/meetings/:id/actions', (req, res) => {
    const actions = db.meeting_actions.filter(a => a.meeting_id === req.params.id);
    res.json({ success: true, data: actions, total: actions.length });
  });

  app.post('/api/v1/meetings/:id/actions', (req, res) => {
    const action = { id: `act-${Date.now()}`, meeting_id: req.params.id, ...req.body, created_at: new Date().toISOString() };
    db.meeting_actions.push(action);
    res.status(201).json({ success: true, data: action });
  });

  // ============ INTERRUPTION FIREWALL (15 endpoints) - Using Database ============

  // Get requests - filter by user if user_id provided (for "my requests" view)
  app.get('/api/v1/requests', async (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const { status, requester_id, routed_to_id } = req.query;
      
      const requests = await dbHelper.getRequests(org_id, { status, requester_id, routed_to_id });
      res.json({ success: true, data: requests, total: requests.length });
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/requests', async (req, res) => {
    try {
      const { requester_id, requester_name, requester_email, routed_to_id, routed_to_name, routed_to_email, urgency, description, category } = req.body;
      
      const request = await dbHelper.createRequest({
        org_id: 'org-001',
        requester_id: requester_id || 'user-001',
        requester_name: requester_name || 'User',
        requester_email: requester_email || '',
        routed_to_id: routed_to_id || 'user-001',
        routed_to_name: routed_to_name || 'Admin',
        routed_to_email: routed_to_email || '',
        urgency: urgency || 'P3',
        description: description || req.body.title || '',
        category: category || 'general',
        what_tried: req.body.what_tried || '',
        impact: req.body.impact || '',
        request_type: routed_to_id === 'user-001' ? 'to_founder' : 'to_team'
      });
      
      res.status(201).json({ success: true, data: request });
    } catch (error) {
      console.error('Error creating request:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/v1/requests/:id', async (req, res) => {
    try {
      const request = await dbHelper.updateRequest(req.params.id, req.body);
      if (!request) return res.status(404).json({ error: 'Not found' });
      res.json({ success: true, data: request });
    } catch (error) {
      console.error('Error updating request:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Reject a request
  app.post('/api/v1/requests/:id/reject', async (req, res) => {
    try {
      const { rejection_reason } = req.body;
      const request = await dbHelper.updateRequest(req.params.id, {
        status: 'rejected',
        response: rejection_reason || 'Request rejected',
        responded_at: new Date().toISOString()
      });
      if (!request) return res.status(404).json({ error: 'Not found' });
      res.json({ success: true, data: request });
    } catch (error) {
      console.error('Error rejecting request:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Approve/Complete a request
  app.post('/api/v1/requests/:id/approve', async (req, res) => {
    try {
      const { resolution_notes } = req.body;
      const request = await dbHelper.updateRequest(req.params.id, {
        status: 'completed',
        response: resolution_notes || 'Request approved',
        responded_at: new Date().toISOString()
      });
      if (!request) return res.status(404).json({ error: 'Not found' });
      res.json({ success: true, data: request });
    } catch (error) {
      console.error('Error approving request:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/v1/requests/:id', async (req, res) => {
    try {
      await dbHelper.deleteRequest(req.params.id);
      res.json({ success: true, message: 'Request deleted' });
    } catch (error) {
      console.error('Error deleting request:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Escalation Rules
  app.get('/api/v1/escalation-rules', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    const rules = db.escalation_rules.filter(r => r.org_id === org_id);
    res.json({ success: true, data: rules, total: rules.length });
  });

  app.post('/api/v1/escalation-rules', (req, res) => {
    const rule = { id: `esc-${Date.now()}`, org_id: 'org-001', ...req.body, created_at: new Date().toISOString() };
    db.escalation_rules.push(rule);
    res.status(201).json({ success: true, data: rule });
  });

  app.put('/api/v1/escalation-rules/:id', (req, res) => {
    const rule = db.escalation_rules.find(r => r.id === req.params.id);
    if (!rule) return res.status(404).json({ error: 'Not found' });
    Object.assign(rule, req.body);
    res.json({ success: true, data: rule });
  });

  app.delete('/api/v1/escalation-rules/:id', (req, res) => {
    const idx = db.escalation_rules.findIndex(r => r.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const rule = db.escalation_rules.splice(idx, 1)[0];
    res.json({ success: true, data: rule });
  });

  // Office Hours
  app.get('/api/v1/office-hours', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    const hours = db.office_hours.filter(h => h.org_id === org_id);
    res.json({ success: true, data: hours, total: hours.length });
  });

  app.post('/api/v1/office-hours', (req, res) => {
    const hours = { id: `oh-${Date.now()}`, org_id: 'org-001', ...req.body, created_at: new Date().toISOString() };
    db.office_hours.push(hours);
    res.status(201).json({ success: true, data: hours });
  });

  app.put('/api/v1/office-hours/:id', (req, res) => {
    const hours = db.office_hours.find(h => h.id === req.params.id);
    if (!hours) return res.status(404).json({ error: 'Not found' });
    Object.assign(hours, req.body);
    res.json({ success: true, data: hours });
  });

  app.delete('/api/v1/office-hours/:id', (req, res) => {
    const idx = db.office_hours.findIndex(h => h.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const hours = db.office_hours.splice(idx, 1)[0];
    res.json({ success: true, data: hours });
  });

  // ============ ONE-STOP EXTRAS (18 endpoints) ============

  app.get('/api/v1/notes', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    const notes = db.notes.filter(n => n.org_id === org_id);
    res.json({ success: true, data: notes, total: notes.length });
  });

  app.post('/api/v1/notes', (req, res) => {
    const note = { id: `note-${Date.now()}`, org_id: 'org-001', ...req.body, created_at: new Date().toISOString() };
    db.notes.push(note);
    res.status(201).json({ success: true, data: note });
  });

  app.put('/api/v1/notes/:id', (req, res) => {
    const note = db.notes.find(n => n.id === req.params.id);
    if (!note) return res.status(404).json({ error: 'Not found' });
    Object.assign(note, req.body);
    res.json({ success: true, data: note });
  });

  app.delete('/api/v1/notes/:id', (req, res) => {
    const idx = db.notes.findIndex(n => n.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const note = db.notes.splice(idx, 1)[0];
    res.json({ success: true, data: note });
  });

  // Wiki Pages
  app.get('/api/v1/wiki/pages', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    const pages = db.wiki_pages.filter(p => p.org_id === org_id);
    res.json({ success: true, data: pages, total: pages.length });
  });

  app.post('/api/v1/wiki/pages', (req, res) => {
    const page = { id: `wiki-${Date.now()}`, org_id: 'org-001', ...req.body, created_at: new Date().toISOString() };
    db.wiki_pages.push(page);
    res.status(201).json({ success: true, data: page });
  });

  app.put('/api/v1/wiki/pages/:id', (req, res) => {
    const page = db.wiki_pages.find(p => p.id === req.params.id);
    if (!page) return res.status(404).json({ error: 'Not found' });
    Object.assign(page, req.body);
    res.json({ success: true, data: page });
  });

  app.delete('/api/v1/wiki/pages/:id', (req, res) => {
    const idx = db.wiki_pages.findIndex(p => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Not found' });
    const page = db.wiki_pages.splice(idx, 1)[0];
    res.json({ success: true, data: page });
  });

  // Threads & Messages
  app.get('/api/v1/threads/:object_type/:object_id', (req, res) => {
    const thread = db.threads.find(t => t.object_type === req.params.object_type && t.object_id === req.params.object_id);
    if (!thread) return res.status(404).json({ error: 'Not found' });
    const messages = db.messages.filter(m => m.thread_id === thread.id);
    res.json({ success: true, data: { thread, messages } });
  });

  app.post('/api/v1/threads/:object_type/:object_id/messages', (req, res) => {
    let thread = db.threads.find(t => t.object_type === req.params.object_type && t.object_id === req.params.object_id);
    if (!thread) {
      thread = { id: `thread-${Date.now()}`, org_id: 'org-001', object_type: req.params.object_type, object_id: req.params.object_id, participants_json: [], created_at: new Date().toISOString() };
      db.threads.push(thread);
    }
    const message = { id: `msg-${Date.now()}`, thread_id: thread.id, ...req.body, created_at: new Date().toISOString() };
    db.messages.push(message);
    res.status(201).json({ success: true, data: message });
  });

  // Email
  app.get('/api/v1/emails/outbox', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    const emails = db.emails_outbox.filter(e => e.org_id === org_id);
    res.json({ success: true, data: emails, total: emails.length });
  });

  app.post('/api/v1/emails/send', (req, res) => {
    const email = { id: `email-${Date.now()}`, org_id: 'org-001', ...req.body, status: 'sent', sent_at: new Date().toISOString(), created_at: new Date().toISOString() };
    db.emails_outbox.push(email);
    res.status(201).json({ success: true, data: email });
  });

  app.get('/api/v1/emails/inbox', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    const emails = db.emails_inbox.filter(e => e.org_id === org_id);
    res.json({ success: true, data: emails, total: emails.length });
  });

  // Notifications
  app.get('/api/v1/notifications', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    const user_id = req.query.user_id || 'user-001';
    const notifs = db.notifications.filter(n => n.org_id === org_id && n.user_id === user_id);
    res.json({ success: true, data: notifs, total: notifs.length });
  });

  app.post('/api/v1/notifications/mark-read', (req, res) => {
    const notif = db.notifications.find(n => n.id === req.body.notification_id);
    if (!notif) return res.status(404).json({ error: 'Not found' });
    notif.read_at = new Date().toISOString();
    res.json({ success: true, data: notif });
  });

  // Audit Logs
  app.get('/api/v1/audit-logs', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    const logs = db.audit_logs.filter(l => l.org_id === org_id);
    res.json({ success: true, data: logs, total: logs.length });
  });

  // ============ ANALYTICS & SUMMARY (10 endpoints) ============

  app.get('/api/v1/my-week', async (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const user_id = req.query.user_id || 'user-001';
      
      // Get real data from database
      const [tasks, meetings, requests, commitments, timeBlocks] = await Promise.all([
        dbHelper.getTasks(org_id, {}),
        dbHelper.getMeetings(org_id, {}),
        dbHelper.getRequests(org_id, {}),
        dbHelper.getCommitments(org_id, {}),
        dbHelper.getTimeBlocks(org_id, {})
      ]);
      
      const tasksDone = tasks.filter(t => t.status === 'done' || t.status === 'completed').length;
      const pendingRequests = requests.filter(r => r.status === 'pending' || r.status === 'open').length;
      
      // Calculate focus hours from time blocks
      const focusBlocks = timeBlocks.filter(b => b.type === 'deep_work' || b.type === 'focus');
      const focusHoursPlanned = focusBlocks.reduce((sum, b) => sum + (b.goal_minutes || 60), 0) / 60;
      const focusHoursCompleted = Math.round(focusHoursPlanned * 0.4 * 10) / 10; // Simulated completion
      
      res.json({ 
        success: true, 
        data: { 
          focus_hours_planned: focusHoursPlanned || 20,
          focus_hours_completed: focusHoursCompleted || 8,
          meetings_count: meetings.length,
          requests_due: pendingRequests,
          tasks_total: tasks.length,
          tasks_done: tasksDone,
          focus_completion_rate: focusHoursPlanned > 0 ? Math.round((focusHoursCompleted / focusHoursPlanned) * 100) : 40,
          meeting_effectiveness: 0,
          interruptions_prevented: 0,
          agenda_compliance: 87.5
        } 
      });
    } catch (error) {
      console.error('Error fetching my-week data:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/productivity/summary', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    res.json({ success: true, data: { deep_work_hours: 20, commitments_accuracy: 0.85, context_switches: 3 } });
  });

  app.get('/api/v1/meetings/summary', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    res.json({ success: true, data: { meeting_hours: 5, agenda_compliance: 0.9, decisions_per_meeting: 2.5, action_closure: 0.85 } });
  });

  app.get('/api/v1/firewall/summary', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    res.json({ success: true, data: { founder_pings: 2, median_response_time: '2h', valid_p1_ratio: 0.95 } });
  });

  app.get('/api/v1/dashboard/metrics', (req, res) => {
    res.json({ success: true, data: { north_star: 0.82, focus_completion: 0.80, meeting_effectiveness: 0.85, firewall_effectiveness: 0.95 } });
  });

  // ============ ANALYTICS (6 endpoints) ============
  app.get('/api/v1/analytics/productivity', (req, res) => {
    const range = req.query.range || '7d';
    const org_id = req.query.org_id || 'org-001';
    
    const completedTasks = db.tasks.filter(t => t.status === 'done').length;
    const inProgressTasks = db.tasks.filter(t => t.status === 'in_progress').length;
    const blockedTasks = db.tasks.filter(t => t.status === 'blocked').length;
    const overdueTasks = db.tasks.filter(t => new Date(t.due_at) < new Date() && t.status !== 'done').length;
    
    const focusHoursCompleted = 8;
    const focusHoursTarget = 20;
    const focusPercentage = (focusHoursCompleted / focusHoursTarget);
    const taskCompletionRate = db.tasks.length > 0 ? (completedTasks / db.tasks.length) : 0;
    
    res.json({ 
      success: true, 
      data: { 
        totalTasks: db.tasks.length,
        completedTasks,
        inProgressTasks,
        blockedTasks,
        overdueTasks,
        totalFocusHours: 8,
        averageFocusPerDay: 1.6,
        totalMeetingHours: 5,
        meetingsThisWeek: db.meetings.length,
        averageMeetingDuration: 60,
        timeTrackedHours: 0,
        productivityScore: Math.round(focusPercentage * 100),
        focusHoursTarget,
        focusHoursCompleted,
        taskCompletionRate,
        meetingEffectiveness: 85
      } 
    });
  });

  app.get('/api/v1/analytics/tasks', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    const byStatus = {
      pending: db.tasks.filter(t => t.status === 'pending').length,
      in_progress: db.tasks.filter(t => t.status === 'in_progress').length,
      done: db.tasks.filter(t => t.status === 'done').length,
      blocked: db.tasks.filter(t => t.status === 'blocked').length
    };
    
    res.json({ success: true, data: { byStatus, total: db.tasks.length } });
  });

  app.get('/api/v1/analytics/meetings', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    res.json({ 
      success: true, 
      data: { 
        total: db.meetings.length,
        thisWeek: db.meetings.length,
        totalHours: 5,
        avgDuration: 60,
        effectiveness: 85
      } 
    });
  });

  app.get('/api/v1/analytics/time-tracking', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    res.json({ 
      success: true, 
      data: { 
        totalHours: 0,
        byTask: {},
        byPriority: { P1: 0, P2: 0, P3: 0, P4: 0 }
      } 
    });
  });

  app.get('/api/v1/analytics/trends', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    const range = req.query.range || '7d';
    
    res.json({ 
      success: true, 
      data: { 
        focusHours: [8, 7, 9, 6, 8, 7, 8],
        taskCompletion: [2, 1, 3, 1, 2, 1, 0],
        meetings: [1, 2, 1, 2, 1, 1, 0],
        productivity: [65, 68, 72, 60, 65, 68, 70]
      } 
    });
  });

  app.get('/api/v1/analytics/summary', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    res.json({ 
      success: true, 
      data: { 
        northStar: 0.40,
        focusCompletion: 0.40,
        taskCompletion: 0,
        meetingEffectiveness: 85,
        firewallEffectiveness: 95
      } 
    });
  });

  // ============ RECURRING TASKS (4 endpoints) ============
  app.post('/api/v1/tasks/recurring', (req, res) => {
    const { title, description, frequency, end_date, org_id } = req.body;
    const recurringTask = {
      id: `recurring-${Date.now()}`,
      title,
      description,
      frequency: frequency || 'weekly',
      end_date,
      org_id: org_id || 'org-001',
      created_at: new Date().toISOString()
    };
    db.recurring_tasks.push(recurringTask);
    res.json({ success: true, data: recurringTask });
  });

  app.get('/api/v1/tasks/recurring', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    const recurring = db.recurring_tasks.filter(t => t.org_id === org_id);
    res.json({ success: true, data: recurring });
  });

  app.put('/api/v1/tasks/recurring/:id', (req, res) => {
    const task = db.recurring_tasks.find(t => t.id === req.params.id);
    if (task) {
      Object.assign(task, req.body);
      res.json({ success: true, data: task });
    } else {
      res.status(404).json({ success: false, error: 'Not found' });
    }
  });

  app.delete('/api/v1/tasks/recurring/:id', (req, res) => {
    const idx = db.recurring_tasks.findIndex(t => t.id === req.params.id);
    if (idx >= 0) {
      db.recurring_tasks.splice(idx, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Not found' });
    }
  });

  // ============ RECURRING MEETINGS (4 endpoints) ============
  app.post('/api/v1/meetings/recurring', (req, res) => {
    const { title, frequency, end_date, org_id } = req.body;
    const recurringMeeting = {
      id: `recurring-meeting-${Date.now()}`,
      title,
      frequency: frequency || 'weekly',
      end_date,
      org_id: org_id || 'org-001',
      created_at: new Date().toISOString()
    };
    db.recurring_meetings.push(recurringMeeting);
    res.json({ success: true, data: recurringMeeting });
  });

  app.get('/api/v1/meetings/recurring', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    const recurring = db.recurring_meetings.filter(m => m.org_id === org_id);
    res.json({ success: true, data: recurring });
  });

  app.put('/api/v1/meetings/recurring/:id', (req, res) => {
    const meeting = db.recurring_meetings.find(m => m.id === req.params.id);
    if (meeting) {
      Object.assign(meeting, req.body);
      res.json({ success: true, data: meeting });
    } else {
      res.status(404).json({ success: false, error: 'Not found' });
    }
  });

  app.delete('/api/v1/meetings/recurring/:id', (req, res) => {
    const idx = db.recurring_meetings.findIndex(m => m.id === req.params.id);
    if (idx >= 0) {
      db.recurring_meetings.splice(idx, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Not found' });
    }
  });

  // ============ NOTIFICATIONS (4 endpoints) ============
  app.post('/api/v1/notifications', (req, res) => {
    const { user_id, title, message, type, org_id } = req.body;
    const notification = {
      id: `notif-${Date.now()}`,
      user_id,
      title,
      message,
      type: type || 'info',
      read: false,
      org_id: org_id || 'org-001',
      created_at: new Date().toISOString()
    };
    db.notifications.push(notification);
    res.json({ success: true, data: notification });
  });

  app.get('/api/v1/notifications', (req, res) => {
    const org_id = req.query.org_id || 'org-001';
    const notifications = db.notifications.filter(n => n.org_id === org_id);
    res.json({ success: true, data: notifications });
  });

  app.put('/api/v1/notifications/:id', (req, res) => {
    const notif = db.notifications.find(n => n.id === req.params.id);
    if (notif) {
      Object.assign(notif, req.body);
      res.json({ success: true, data: notif });
    } else {
      res.status(404).json({ success: false, error: 'Not found' });
    }
  });

  app.delete('/api/v1/notifications/:id', (req, res) => {
    const idx = db.notifications.findIndex(n => n.id === req.params.id);
    if (idx >= 0) {
      db.notifications.splice(idx, 1);
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: 'Not found' });
    }
  });
};
