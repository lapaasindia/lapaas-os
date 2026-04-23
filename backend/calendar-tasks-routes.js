// Calendar & Tasks Routes - Phase 2 Core Primitives
// Comprehensive calendar and task management for Founder OS

// Database helper for persistent storage
const dbHelper = require('./db-helper');

const calendarTasksDatabase = {
  calendar_events: [
    {
      id: 'cal-001',
      org_id: 'org-001',
      user_id: 'user-001',
      title: 'Deep Work Block',
      description: 'Focused coding session',
      start_at: '2025-11-10T09:00:00Z',
      end_at: '2025-11-10T11:00:00Z',
      type: 'focus',
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR',
      attendees: [],
      color_tag: 'blue',
      reminders: [900, 3600],
      notes_id: null,
      created_at: '2025-11-08T10:00:00Z',
      updated_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'cal-002',
      org_id: 'org-001',
      user_id: 'user-001',
      title: 'Weekly Leadership Sync',
      description: 'Team sync meeting',
      start_at: '2025-11-10T14:00:00Z',
      end_at: '2025-11-10T15:00:00Z',
      type: 'meeting',
      recurrence_rule: 'FREQ=WEEKLY;BYDAY=MO',
      attendees: ['user-002', 'user-003'],
      color_tag: 'green',
      reminders: [900],
      notes_id: null,
      created_at: '2025-11-08T10:00:00Z',
      updated_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'cal-003',
      org_id: 'org-001',
      user_id: 'user-001',
      title: 'Office Hours',
      description: 'Available for questions and requests',
      start_at: '2025-11-10T16:00:00Z',
      end_at: '2025-11-10T17:00:00Z',
      type: 'office_hours',
      recurrence_rule: 'FREQ=DAILY;BYDAY=MO,TU,WE,TH,FR',
      attendees: [],
      color_tag: 'orange',
      reminders: [],
      notes_id: null,
      created_at: '2025-11-08T10:00:00Z',
      updated_at: '2025-11-08T10:00:00Z'
    }
  ],

  tasks: [
    {
      id: 'task-001',
      org_id: 'org-001',
      owner_id: 'user-001',
      title: 'Implement calendar module',
      description: 'Build calendar UI and API endpoints',
      due_at: '2025-11-15',
      priority: 'P1',
      status: 'in_progress',
      parent_id: null,
      dependencies: [],
      checklist_json: [
        { item: 'Design calendar layout', done: true },
        { item: 'Implement day/week views', done: true },
        { item: 'Add event creation', done: false },
        { item: 'Add recurring events', done: false }
      ],
      subtasks: [],
      time_spent_minutes: 240,
      time_logs: [
        { start: '2025-11-08T09:00:00Z', end: '2025-11-08T11:00:00Z', duration: 120 },
        { start: '2025-11-08T14:00:00Z', end: '2025-11-08T16:00:00Z', duration: 120 }
      ],
      linked_to: { type: 'time_block', id: 'tb-001' },
      created_at: '2025-11-08T10:00:00Z',
      updated_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'task-002',
      org_id: 'org-001',
      owner_id: 'user-001',
      title: 'Review Q4 roadmap',
      description: 'Prepare roadmap for Q4 planning',
      due_at: '2025-11-12',
      priority: 'P1',
      status: 'todo',
      parent_id: null,
      dependencies: [],
      checklist_json: [
        { item: 'Gather team input', done: false },
        { item: 'Compile metrics', done: false },
        { item: 'Create presentation', done: false }
      ],
      subtasks: [],
      time_spent_minutes: 0,
      time_logs: [],
      linked_to: { type: 'meeting', id: 'mtg-001' },
      created_at: '2025-11-08T10:00:00Z',
      updated_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'task-003',
      org_id: 'org-001',
      owner_id: 'user-001',
      title: 'Send roadmap to stakeholders',
      description: 'Email roadmap to key stakeholders',
      due_at: '2025-11-17',
      priority: 'P2',
      status: 'todo',
      parent_id: null,
      dependencies: ['task-002'],
      checklist_json: [],
      subtasks: [],
      time_spent_minutes: 0,
      time_logs: [],
      linked_to: { type: 'decision', id: 'dec-001' },
      created_at: '2025-11-08T10:00:00Z',
      updated_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'task-004',
      org_id: 'org-001',
      owner_id: 'user-001',
      title: 'Fix bug in auth flow',
      description: 'Users getting stuck on login page',
      due_at: '2025-11-10',
      priority: 'P1',
      status: 'todo',
      parent_id: null,
      dependencies: [],
      checklist_json: [
        { item: 'Reproduce issue', done: true },
        { item: 'Identify root cause', done: false },
        { item: 'Implement fix', done: false },
        { item: 'Test fix', done: false }
      ],
      subtasks: [],
      time_spent_minutes: 30,
      time_logs: [
        { start: '2025-11-08T13:00:00Z', end: '2025-11-08T13:30:00Z', duration: 30 }
      ],
      linked_to: { type: 'request', id: 'req-001' },
      created_at: '2025-11-08T10:00:00Z',
      updated_at: '2025-11-08T10:00:00Z'
    }
  ],

  task_templates: [
    {
      id: 'tmpl-001',
      org_id: 'org-001',
      name: 'Weekly Review',
      description: 'Template for weekly review task',
      checklist_template: [
        'Review Top-3 from last week',
        'Check task completion rate',
        'Plan Top-3 for next week',
        'Update roadmap',
        'Send owner brief'
      ],
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'tmpl-002',
      org_id: 'org-001',
      name: 'Project Kickoff',
      description: 'Template for project kickoff',
      checklist_template: [
        'Define project goals',
        'Identify stakeholders',
        'Create project plan',
        'Schedule kickoff meeting',
        'Send project brief'
      ],
      created_at: '2025-11-08T10:00:00Z'
    }
  ],

  my_week_view: [
    {
      id: 'week-001',
      org_id: 'org-001',
      user_id: 'user-001',
      week_start: '2025-11-10',
      week_end: '2025-11-16',
      top_3: ['task-001', 'task-002', 'task-004'],
      focus_hours_planned: 20,
      focus_hours_completed: 8,
      meetings_count: 5,
      requests_due: 2,
      created_at: '2025-11-08T10:00:00Z'
    }
  ]
};

module.exports = (app) => {
  // ============ CALENDAR ENDPOINTS ============

  // Get all calendar events
  app.get(['/api/v1/calendar/events', '/api/v1/calendar'], (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const user_id = req.query.user_id;

      let events = calendarTasksDatabase.calendar_events.filter(
        e => e.org_id === org_id
      );

      if (user_id) {
        events = events.filter(e => e.user_id === user_id);
      }

      res.json({ success: true, data: events, total: events.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Alias for calendar
  app.get('/api/v1/calendar', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const user_id = req.query.user_id;

      let events = calendarTasksDatabase.calendar_events.filter(
        e => e.org_id === org_id
      );

      if (user_id) {
        events = events.filter(e => e.user_id === user_id);
      }

      res.json({ success: true, data: events, total: events.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create calendar event
  app.post(['/api/v1/calendar/events', '/api/v1/calendar'], (req, res) => {
    try {
      const { user_id, title, description, start_at, end_at, type, recurrence_rule, attendees, color_tag } = req.body;
      const event = {
        id: `cal-${Date.now()}`,
        org_id: 'org-001',
        user_id,
        title,
        description,
        start_at,
        end_at,
        type,
        recurrence_rule: recurrence_rule || null,
        attendees: attendees || [],
        color_tag: color_tag || 'blue',
        reminders: [900],
        notes_id: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      calendarTasksDatabase.calendar_events.push(event);
      res.status(201).json({ success: true, data: event });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update calendar event
  app.put(['/api/v1/calendar/events/:id', '/api/v1/calendar/:id'], (req, res) => {
    try {
      const event = calendarTasksDatabase.calendar_events.find(e => e.id === req.params.id);
      if (!event) return res.status(404).json({ error: 'Event not found' });
      Object.assign(event, req.body, { updated_at: new Date().toISOString() });
      res.json({ success: true, data: event });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete calendar event
  app.delete(['/api/v1/calendar/events/:id', '/api/v1/calendar/:id'], (req, res) => {
    try {
      const index = calendarTasksDatabase.calendar_events.findIndex(e => e.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Event not found' });
      const event = calendarTasksDatabase.calendar_events.splice(index, 1)[0];
      res.json({ success: true, data: event });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ TASK ENDPOINTS - Using Database ============

  // Get all tasks
  app.get('/api/v1/tasks', async (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const user_id = req.query.user_id;
      const status = req.query.status;

      const tasks = await dbHelper.getTasks(org_id, { user_id, status });
      res.json({ success: true, data: tasks, total: tasks.length });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get single task by ID
  app.get('/api/v1/tasks/:taskId', async (req, res) => {
    try {
      const { taskId } = req.params;
      const task = await dbHelper.getTaskById(taskId);
      
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      
      res.json({ success: true, data: task });
    } catch (error) {
      console.error('Error fetching task:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Create task
  app.post('/api/v1/tasks', async (req, res) => {
    try {
      const { owner_id, user_id, title, description, due_at, due_date, priority, status, subtasks } = req.body;
      const task = await dbHelper.createTask({
        org_id: 'org-001',
        user_id: user_id || owner_id || 'user-001',
        title,
        description,
        due_date: due_date || due_at,
        priority: priority || 'medium',
        status: status || 'pending',
        subtasks
      });
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update task
  app.put('/api/v1/tasks/:id', async (req, res) => {
    try {
      const task = await dbHelper.updateTask(req.params.id, req.body);
      if (!task) return res.status(404).json({ error: 'Task not found' });
      res.json({ success: true, data: task });
    } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete task
  app.delete('/api/v1/tasks/:id', async (req, res) => {
    try {
      await dbHelper.deleteTask(req.params.id);
      res.json({ success: true, message: 'Task deleted' });
    } catch (error) {
      console.error('Error deleting task:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Start task timer
  app.post('/api/v1/tasks/:id/timer/start', (req, res) => {
    try {
      const task = calendarTasksDatabase.tasks.find(t => t.id === req.params.id);
      if (!task) return res.status(404).json({ error: 'Task not found' });

      const timer = {
        start: new Date().toISOString(),
        end: null,
        duration: 0
      };

      res.json({ success: true, data: { task_id: task.id, timer } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stop task timer
  app.post('/api/v1/tasks/:id/timer/stop', (req, res) => {
    try {
      const task = calendarTasksDatabase.tasks.find(t => t.id === req.params.id);
      if (!task) return res.status(404).json({ error: 'Task not found' });

      const { start_time } = req.body;
      const end_time = new Date().toISOString();
      const duration = Math.round((new Date(end_time) - new Date(start_time)) / 60000);

      task.time_logs.push({
        start: start_time,
        end: end_time,
        duration
      });

      task.time_spent_minutes += duration;

      res.json({ success: true, data: { task_id: task.id, duration, total_time: task.time_spent_minutes } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update task checklist
  app.put('/api/v1/tasks/:id/checklist', (req, res) => {
    try {
      const task = calendarTasksDatabase.tasks.find(t => t.id === req.params.id);
      if (!task) return res.status(404).json({ error: 'Task not found' });

      const { checklist_json } = req.body;
      task.checklist_json = checklist_json;
      task.updated_at = new Date().toISOString();

      res.json({ success: true, data: task });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ SUBTASK ENDPOINTS ============

  // Add subtask to task
  app.post('/api/v1/tasks/:taskId/subtasks', (req, res) => {
    try {
      const { taskId } = req.params;
      const { title } = req.body;
      const task = calendarTasksDatabase.tasks.find(t => t.id === taskId);
      
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      // Initialize subtasks array if it doesn't exist
      if (!task.subtasks) {
        task.subtasks = [];
      }

      const subtask = {
        id: `subtask-${Date.now()}`,
        title,
        completed: false,
        created_at: new Date().toISOString()
      };

      task.subtasks.push(subtask);
      task.updated_at = new Date().toISOString();

      res.status(201).json({ success: true, data: subtask });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update subtask
  app.put('/api/v1/tasks/:taskId/subtasks/:subtaskId', (req, res) => {
    try {
      const { taskId, subtaskId } = req.params;
      const { completed, title } = req.body;
      const task = calendarTasksDatabase.tasks.find(t => t.id === taskId);
      
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      if (!task.subtasks) {
        task.subtasks = [];
      }

      const subtask = task.subtasks.find(s => s.id === subtaskId);
      if (!subtask) {
        return res.status(404).json({ success: false, error: 'Subtask not found' });
      }

      if (completed !== undefined) subtask.completed = completed;
      if (title !== undefined) subtask.title = title;
      task.updated_at = new Date().toISOString();

      res.json({ success: true, data: subtask });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete subtask
  app.delete('/api/v1/tasks/:taskId/subtasks/:subtaskId', (req, res) => {
    try {
      const { taskId, subtaskId } = req.params;
      const task = calendarTasksDatabase.tasks.find(t => t.id === taskId);
      
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }

      if (!task.subtasks) {
        task.subtasks = [];
      }

      const index = task.subtasks.findIndex(s => s.id === subtaskId);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Subtask not found' });
      }

      const subtask = task.subtasks.splice(index, 1)[0];
      task.updated_at = new Date().toISOString();

      res.json({ success: true, data: subtask });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ TASK TEMPLATES ============

  // Get task templates
  app.get('/api/v1/task-templates', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const templates = calendarTasksDatabase.task_templates.filter(t => t.org_id === org_id);
      res.json({ success: true, data: templates, total: templates.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create task from template
  app.post('/api/v1/tasks/from-template/:template_id', (req, res) => {
    try {
      const template = calendarTasksDatabase.task_templates.find(t => t.id === req.params.template_id);
      if (!template) return res.status(404).json({ error: 'Template not found' });

      const { owner_id, due_at } = req.body;
      const task = {
        id: `task-${Date.now()}`,
        org_id: 'org-001',
        owner_id,
        title: template.name,
        description: template.description,
        due_at,
        priority: 'P2',
        status: 'todo',
        parent_id: null,
        dependencies: [],
        checklist_json: template.checklist_template.map(item => ({ item, done: false })),
        time_spent_minutes: 0,
        time_logs: [],
        linked_to: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      calendarTasksDatabase.tasks.push(task);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ MY WEEK VIEW - Using Database ============

  // Get my week view
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
      const focusHoursCompleted = Math.round(focusHoursPlanned * 0.4 * 10) / 10;

      res.json({ 
        success: true, 
        data: {
          week_start: new Date().toISOString().split('T')[0],
          top_3: tasks.slice(0, 3).map(t => t.id),
          focus_hours_planned: focusHoursPlanned || 20,
          focus_hours_completed: focusHoursCompleted || 8,
          meetings_count: meetings.length,
          requests_due: pendingRequests,
          tasks_total: tasks.length,
          tasks_done: tasksDone,
          focus_completion_rate: focusHoursPlanned > 0 ? Math.round((focusHoursCompleted / focusHoursPlanned) * 100) : 40,
          meeting_effectiveness: 0,
          interruptions_prevented: 0
        }
      });
    } catch (error) {
      console.error('Error fetching my-week:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update my week view
  app.put('/api/v1/my-week', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const user_id = req.query.user_id || 'user-001';
      const { top_3, focus_hours_planned } = req.body;

      let week = calendarTasksDatabase.my_week_view.find(
        w => w.org_id === org_id && w.user_id === user_id
      );

      if (!week) {
        week = {
          id: `week-${Date.now()}`,
          org_id,
          user_id,
          week_start: new Date().toISOString().split('T')[0],
          week_end: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          top_3: top_3 || [],
          focus_hours_planned: focus_hours_planned || 0,
          focus_hours_completed: 0,
          meetings_count: 0,
          requests_due: 0,
          created_at: new Date().toISOString()
        };
        calendarTasksDatabase.my_week_view.push(week);
      } else {
        if (top_3) week.top_3 = top_3;
        if (focus_hours_planned) week.focus_hours_planned = focus_hours_planned;
      }

      res.json({ success: true, data: week });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ============ SUMMARY ENDPOINTS ============

  // Get calendar & tasks summary
  app.get('/api/v1/calendar-tasks/summary', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const user_id = req.query.user_id || 'user-001';

      const events = calendarTasksDatabase.calendar_events.filter(
        e => e.org_id === org_id && e.user_id === user_id
      );

      const tasks = calendarTasksDatabase.tasks.filter(
        t => t.org_id === org_id && t.owner_id === user_id
      );

      const completedTasks = tasks.filter(t => t.status === 'done').length;
      const totalTasks = tasks.length;
      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const focusEvents = events.filter(e => e.type === 'focus');
      const meetingEvents = events.filter(e => e.type === 'meeting');

      res.json({
        success: true,
        data: {
          total_events: events.length,
          focus_blocks: focusEvents.length,
          meetings: meetingEvents.length,
          total_tasks: totalTasks,
          completed_tasks: completedTasks,
          completion_rate: completionRate,
          in_progress_tasks: tasks.filter(t => t.status === 'in_progress').length,
          total_time_tracked: tasks.reduce((sum, t) => sum + t.time_spent_minutes, 0)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
