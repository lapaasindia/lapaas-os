// Founder OS Routes - Part 1
// Personal Productivity, Meeting OS, Interruption Firewall

const founderOSDatabase = {
  team_members: [
    { id: 'user-001', name: 'John Smith', email: 'john@company.com', avatar: '👨‍💼' },
    { id: 'user-002', name: 'Sarah Chen', email: 'sarah@company.com', avatar: '👩‍💼' },
    { id: 'user-003', name: 'Mike Johnson', email: 'mike@company.com', avatar: '👨‍💻' },
    { id: 'user-004', name: 'Emily Davis', email: 'emily@company.com', avatar: '👩‍💻' },
    { id: 'user-005', name: 'Alex Rodriguez', email: 'alex@company.com', avatar: '👨‍🔬' }
  ],

  meeting_templates: [
    {
      id: 'tmpl-001',
      name: 'Weekly Sync',
      description: 'Regular team sync meeting',
      agendaItems: [
        { title: 'Updates', duration: 10 },
        { title: 'Blockers', duration: 10 },
        { title: 'Next Steps', duration: 5 }
      ],
      duration: 30,
      facilitator: 'Team Lead'
    },
    {
      id: 'tmpl-002',
      name: 'Project Kickoff',
      description: 'New project initiation meeting',
      agendaItems: [
        { title: 'Project Overview', duration: 15 },
        { title: 'Scope & Goals', duration: 15 },
        { title: 'Timeline & Milestones', duration: 15 },
        { title: 'Team Roles', duration: 10 },
        { title: 'Q&A', duration: 5 }
      ],
      duration: 60,
      facilitator: 'Project Manager'
    },
    {
      id: 'tmpl-003',
      name: 'One-on-One',
      description: 'Manager-employee one-on-one',
      agendaItems: [
        { title: 'Progress Update', duration: 10 },
        { title: 'Challenges & Support', duration: 10 },
        { title: 'Goals & Development', duration: 10 }
      ],
      duration: 30,
      facilitator: 'Manager'
    },
    {
      id: 'tmpl-004',
      name: 'Sprint Review',
      description: 'Sprint completion review',
      agendaItems: [
        { title: 'Completed Items', duration: 15 },
        { title: 'Demo', duration: 20 },
        { title: 'Retrospective', duration: 15 },
        { title: 'Next Sprint Planning', duration: 10 }
      ],
      duration: 60,
      facilitator: 'Scrum Master'
    }
  ],

  time_blocks: [
    {
      id: 'tb-001',
      org_id: 'org-001',
      user_id: 'user-001',
      date: '2025-11-10',
      start_at: '09:00',
      end_at: '11:00',
      type: 'Deep Work',
      color: '#FF6B6B',
      goal_minutes: 120,
      notes: 'Product development sprint'
    },
    {
      id: 'tb-002',
      org_id: 'org-001',
      user_id: 'user-001',
      date: '2025-11-10',
      start_at: '14:00',
      end_at: '15:30',
      type: 'Admin',
      color: '#4ECDC4',
      goal_minutes: 90,
      notes: 'Email and admin tasks'
    }
  ],

  commitments: [
    {
      id: 'comm-001',
      org_id: 'org-001',
      user_id: 'user-001',
      date: '2025-11-10',
      title: 'Complete product roadmap',
      priority: 'P1',
      planned_minutes: 120,
      actual_minutes: 0,
      status: 'pending'
    },
    {
      id: 'comm-002',
      org_id: 'org-001',
      user_id: 'user-001',
      date: '2025-11-10',
      title: 'Review team proposals',
      priority: 'P2',
      planned_minutes: 45,
      actual_minutes: 0,
      status: 'pending'
    }
  ],

  focus_sessions: [
    {
      id: 'fs-001',
      org_id: 'org-001',
      user_id: 'user-001',
      start_at: '2025-11-08T09:00:00Z',
      end_at: '2025-11-08T11:00:00Z',
      allowed_interruptions: ['P1', 'Emergency'],
      breaches: 2,
      notes: 'Deep work session - 2 interruptions logged'
    }
  ],

  meetings: [
    {
      id: 'mtg-001',
      org_id: 'org-001',
      title: 'Weekly Leadership Sync',
      start_at: '2025-11-10T15:30:00Z',
      end_at: '2025-11-10T16:30:00Z',
      location: 'Conference Room A',
      facilitator: 'John Smith',
      facilitator_id: 'user-001',
      created_by: 'admin@lapaas.com',
      created_by_id: 'founder-user',
      members: ['admin@lapaas.com', 'john@lapaas.com', 'sarah@lapaas.com'],
      status: 'scheduled',
      attendees: ['user-001', 'user-002', 'user-003'],
      agendaItems: [
        { id: 'agenda-001', title: 'Q4 Roadmap Review', duration: 15, owner: 'user-001', status: 'pending' }
      ],
      links: [
        { id: 'link-001', title: 'Q4 Roadmap Document', url: 'https://docs.google.com/document/d/1q4roadmap', type: 'doc' }
      ],
      tasks: [
        { id: 'task-001', title: 'Finalize Q4 roadmap document', assigned_to: 'Sarah Chen', due_at: '2025-11-12', status: 'pending' }
      ],
      transcription: {
        file_url: null,
        file_name: null,
        uploaded_at: null,
        status: 'pending'
      },
      minutes: {
        content: 'Discussed Q4 priorities and timeline. Team aligned on key initiatives. Budget allocation approved.',
        key_decisions: [
          'Approved Q4 roadmap with 3 major initiatives',
          'Budget allocation: $500K for product development',
          'Timeline: Launch by end of Q4'
        ],
        action_items: []
      },
      notes: '',
      created_at: '2025-11-08T09:00:00Z',
      updated_at: '2025-11-08T09:00:00Z'
    }
  ],

  meeting_decisions: [
    {
      id: 'dec-001',
      org_id: 'org-001',
      meeting_id: 'mtg-001',
      title: 'Approve Q4 roadmap',
      rationale: 'Team consensus on priorities',
      owner_id: 'user-001',
      review_at: '2025-11-17',
      status: 'pending'
    }
  ],

  meeting_actions: [
    {
      id: 'act-001',
      org_id: 'org-001',
      meeting_id: 'mtg-001',
      task_id: 'task-001',
      title: 'Send roadmap to stakeholders',
      owner_id: 'user-002',
      due_at: '2025-11-12',
      status: 'pending'
    }
  ],

  requests: [
    {
      id: 'req-001',
      org_id: 'org-001',
      requester_id: 'user-002',
      requester_name: 'John Smith',
      requester_email: 'john.smith@company.com',
      category: 'Product',
      urgency: 'P2',
      description: 'Need approval on feature spec',
      what_tried: 'Reviewed with team, prepared documentation',
      impact: 'Blocking sprint planning for next week',
      attempts: ['Slack message', 'Email'],
      status: 'pending',
      routed_to_id: 'user-001',
      routed_to_name: 'Admin User',
      routed_to_email: 'admin@lapaas.com',
      request_type: 'to_founder',
      sla_at: '2025-11-27T17:30:00Z',
      created_at: '2025-11-26T10:00:00Z'
    },
    {
      id: 'req-002',
      org_id: 'org-001',
      requester_id: 'user-003',
      requester_name: 'Sarah Johnson',
      requester_email: 'sarah.johnson@company.com',
      category: 'Finance',
      urgency: 'P1',
      description: 'Urgent: Budget approval needed',
      what_tried: 'Prepared budget breakdown, got department head approval',
      impact: 'Vendor payment deadline tomorrow',
      attempts: ['Slack', 'Email', 'Phone call'],
      status: 'pending',
      routed_to_id: 'user-001',
      routed_to_name: 'Admin User',
      routed_to_email: 'admin@lapaas.com',
      request_type: 'to_founder',
      sla_at: '2025-11-26T19:30:00Z',
      created_at: '2025-11-26T11:00:00Z'
    },
    {
      id: 'req-003',
      org_id: 'org-001',
      requester_id: 'user-001',
      requester_name: 'Admin User',
      requester_email: 'admin@lapaas.com',
      category: 'Technical',
      urgency: 'P3',
      description: 'Review API documentation updates',
      what_tried: 'Updated docs, need peer review',
      impact: 'Documentation release scheduled for Friday',
      attempts: ['Slack'],
      status: 'pending',
      routed_to_id: 'user-002',
      routed_to_name: 'John Smith',
      routed_to_email: 'john.smith@company.com',
      request_type: 'to_team',
      sla_at: '2025-11-28T17:30:00Z',
      created_at: '2025-11-26T09:00:00Z'
    },
    {
      id: 'req-004',
      org_id: 'org-001',
      requester_id: 'user-004',
      requester_name: 'Mike Wilson',
      requester_email: 'mike.wilson@company.com',
      category: 'HR',
      urgency: 'P4',
      description: 'Request for team outing approval',
      what_tried: 'Gathered team preferences, prepared budget',
      impact: 'Team morale boost needed',
      attempts: ['Email'],
      status: 'pending',
      routed_to_id: 'user-002',
      routed_to_name: 'John Smith',
      routed_to_email: 'john.smith@company.com',
      request_type: 'to_team',
      sla_at: '2025-11-30T17:30:00Z',
      created_at: '2025-11-26T08:00:00Z'
    }
  ],

  escalation_rules: [
    {
      id: 'er-001',
      org_id: 'org-001',
      category: 'Product',
      default_route: 'Manager',
      conditions: [
        { urgency: 'P1', route: 'Owner' },
        { urgency: 'P2', route: 'Manager' }
      ]
    }
  ],

  office_hours: [
    {
      id: 'oh-001',
      org_id: 'org-001',
      owner_id: 'user-001',
      day_of_week: 'Monday',
      start_time: '16:00',
      end_time: '17:00',
      capacity: 3
    }
  ],

  // Global tasks list - synced from all sources (meetings, direct creation, etc)
  global_tasks: [
    {
      id: 'task-001',
      org_id: 'org-001',
      title: 'Finalize Q4 roadmap document',
      assigned_to: 'Sarah Chen',
      due_at: '2025-11-12',
      status: 'pending',
      source: 'meeting',
      source_id: 'mtg-001',
      created_at: '2025-11-08T09:00:00Z'
    }
  ]
};

// Database helper for persistent storage
const dbHelper = require('./db-helper');

// Get database reference from test-server (for user enrichment)
const getDb = () => {
  try {
    return require('./test-server').db;
  } catch (e) {
    return null;
  }
};

module.exports = (app) => {
  // Time Blocks - Using Database
  app.get('/api/v1/time-blocks', async (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const user_id = req.query.user_id;
      const date = req.query.date;
      
      const blocks = await dbHelper.getTimeBlocks(org_id, { user_id, date });
      res.json({ success: true, data: blocks, total: blocks.length });
    } catch (error) {
      console.error('Error fetching time blocks:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/time-blocks', async (req, res) => {
    try {
      const { user_id, userId, date, start_at, startTime, end_at, endTime, type, title, blockType, color, goal_minutes, targetMinutes, notes, orgId } = req.body;
      const block = await dbHelper.createTimeBlock({
        org_id: orgId || 'org-001',
        user_id: user_id || userId || 'user-001',
        title: title || type || 'Time Block',
        block_type: blockType || type?.toLowerCase().replace(' ', '_') || 'deep_work',
        date,
        start_time: start_at || startTime || '09:00',
        end_time: end_at || endTime || '10:00',
        target_minutes: goal_minutes || targetMinutes || 60,
        color,
        notes
      });
      res.status(201).json({ success: true, data: block });
    } catch (error) {
      console.error('Error creating time block:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/v1/time-blocks/:blockId', async (req, res) => {
    try {
      const { blockId } = req.params;
      const block = await dbHelper.updateTimeBlock(blockId, req.body);
      if (!block) {
        return res.status(404).json({ error: 'Time block not found' });
      }
      res.json({ success: true, data: block });
    } catch (error) {
      console.error('Error updating time block:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/v1/time-blocks/:blockId', async (req, res) => {
    try {
      const { blockId } = req.params;
      await dbHelper.deleteTimeBlock(blockId);
      res.json({ success: true, message: 'Time block deleted' });
    } catch (error) {
      console.error('Error deleting time block:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Commitments - Using Database
  app.get('/api/v1/commitments', async (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const user_id = req.query.user_id;
      const date = req.query.date;
      
      const commitments = await dbHelper.getCommitments(org_id, { user_id, date });
      res.json({ success: true, data: commitments, total: commitments.length });
    } catch (error) {
      console.error('Error fetching commitments:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/commitments/top3', async (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const user_id = req.query.user_id;
      const date = req.query.date;
      
      if (!user_id || !date) {
        return res.status(400).json({ error: 'user_id and date are required' });
      }
      
      let commitments = await dbHelper.getCommitments(org_id, { user_id, date });
      commitments = commitments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 3);
      res.json({ success: true, data: { date, commitments, total: commitments.length, completed: commitments.filter(c => c.completed).length } });
    } catch (error) {
      console.error('Error fetching top 3 commitments:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/commitments/:commitmentId', async (req, res) => {
    try {
      const { commitmentId } = req.params;
      const commitment = await dbHelper.getCommitmentById(commitmentId);
      if (!commitment) {
        return res.status(404).json({ error: 'Commitment not found' });
      }
      res.json({ success: true, data: commitment });
    } catch (error) {
      console.error('Error fetching commitment:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/commitments', async (req, res) => {
    try {
      const { user_id, date, title, priority, planned_minutes, effort_minutes, description, subtasks } = req.body;
      const commitment = await dbHelper.createCommitment({
        org_id: 'org-001',
        user_id: user_id || 'user-001',
        date: date || new Date().toISOString().split('T')[0],
        title,
        description,
        priority: priority || 1,
        effort_minutes: effort_minutes || planned_minutes || 30,
        subtasks
      });
      res.status(201).json({ success: true, data: commitment });
    } catch (error) {
      console.error('Error creating commitment:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/v1/commitments/:commitmentId', async (req, res) => {
    try {
      const { commitmentId } = req.params;
      const commitment = await dbHelper.updateCommitment(commitmentId, req.body);
      if (!commitment) {
        return res.status(404).json({ error: 'Commitment not found' });
      }
      res.json({ success: true, data: commitment });
    } catch (error) {
      console.error('Error updating commitment:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/v1/commitments/:commitmentId', async (req, res) => {
    try {
      const { commitmentId } = req.params;
      await dbHelper.deleteCommitment(commitmentId);
      res.json({ success: true, message: 'Commitment deleted' });
    } catch (error) {
      console.error('Error deleting commitment:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Focus Sessions
  app.get('/api/v1/focus-sessions', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const sessions = founderOSDatabase.focus_sessions.filter(s => s.org_id === org_id);
      res.json({ success: true, data: sessions, total: sessions.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/focus-sessions', (req, res) => {
    try {
      const { user_id, start_at, end_at, allowed_interruptions, notes } = req.body;
      const session = {
        id: `fs-${Date.now()}`,
        org_id: 'org-001',
        user_id, start_at, end_at, allowed_interruptions,
        breaches: 0, notes
      };
      founderOSDatabase.focus_sessions.push(session);
      res.status(201).json({ success: true, data: session });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Meetings - Using Database
  app.get('/api/v1/meetings', async (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const user_id = req.query.user_id;
      const user_email = req.query.user_email;
      
      let meetings = await dbHelper.getMeetings(org_id, { user_id });
      
      // If user_email is provided, additionally filter meetings where user is a member
      if (user_email) {
        meetings = meetings.filter(m => {
          if (m.organizer_name && m.organizer_name.toLowerCase().includes(user_email.split('@')[0].toLowerCase())) return true;
          if (m.attendees && m.attendees.includes(user_email)) return true;
          if (!m.attendees || m.attendees.length === 0) return true;
          return false;
        });
      }
      
      res.json({ success: true, data: meetings, total: meetings.length });
    } catch (error) {
      console.error('Error fetching meetings:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/meetings', async (req, res) => {
    try {
      const { title, start_at, end_at, location, agenda, doc_links, roles, created_by, facilitator, facilitator_id, members, agendaItems } = req.body;
      
      const meeting = await dbHelper.createMeeting({
        org_id: 'org-001',
        title,
        start_time: start_at,
        end_time: end_at,
        location: location || '',
        organizer_id: facilitator_id || 'user-001',
        organizer_name: facilitator || created_by || 'Organizer',
        facilitator_id: facilitator_id,
        attendees: members || (created_by ? [created_by] : []),
        status: 'scheduled',
        agendaItems: agendaItems || (agenda ? agenda.map((a, i) => ({ title: a.title || a, duration_minutes: a.duration || 10 })) : [])
      });
      
      res.status(201).json({ success: true, data: meeting });
    } catch (error) {
      console.error('Error creating meeting:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/meetings/:meetingId', async (req, res) => {
    try {
      const { meetingId } = req.params;
      const meeting = await dbHelper.getMeetingById(meetingId);
      
      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }
      
      res.json({ success: true, data: meeting });
    } catch (error) {
      console.error('Error fetching meeting:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/v1/meetings/:meetingId', async (req, res) => {
    try {
      const { meetingId } = req.params;
      const { title, location, status, description, start_at, end_at, notes } = req.body;
      
      const meeting = await dbHelper.updateMeeting(meetingId, {
        title,
        location,
        status,
        description,
        start_time: start_at,
        end_time: end_at,
        notes
      });
      
      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }
      
      res.json({ success: true, data: meeting });
    } catch (error) {
      console.error('Error updating meeting:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/v1/meetings/:meetingId', async (req, res) => {
    try {
      const { meetingId } = req.params;
      await dbHelper.deleteMeeting(meetingId);
      res.json({ success: true, message: 'Meeting deleted' });
    } catch (error) {
      console.error('Error deleting meeting:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get agenda items for a meeting
  app.get('/api/v1/meetings/:meetingId/agenda', async (req, res) => {
    try {
      const { meetingId } = req.params;
      const agendaItems = await dbHelper.dbAll(
        'SELECT * FROM meeting_agenda_items WHERE meeting_id = ? ORDER BY order_index',
        [meetingId]
      );
      
      // Map to include both field naming conventions
      const mappedItems = agendaItems.map(item => ({
        ...item,
        segment: item.title,
        minutes: item.duration_minutes,
        owner: item.presenter_name
      }));
      
      res.json({ success: true, data: mappedItems });
    } catch (error) {
      console.error('Error fetching agenda items:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/meetings/:meetingId/agenda', async (req, res) => {
    try {
      const { meetingId } = req.params;
      const { title, segment, duration, minutes, owner, presenter_name } = req.body;
      
      const meeting = await dbHelper.getMeetingById(meetingId);
      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }
      
      // Support both field naming conventions
      const agendaItem = await dbHelper.addAgendaItem(meetingId, {
        title: title || segment,
        duration_minutes: duration || minutes || 10,
        presenter_name: presenter_name || owner || ''
      });
      
      // Return with both field names for compatibility
      const response = {
        ...agendaItem,
        segment: agendaItem.title,
        minutes: agendaItem.duration_minutes,
        owner: agendaItem.presenter_name
      };
      
      res.status(201).json({ success: true, data: response });
    } catch (error) {
      console.error('Error adding agenda item:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete agenda item
  app.delete('/api/v1/meetings/:meetingId/agenda/:agendaId', async (req, res) => {
    try {
      const { agendaId } = req.params;
      await dbHelper.deleteAgendaItem(agendaId);
      res.json({ success: true, message: 'Agenda item deleted' });
    } catch (error) {
      console.error('Error deleting agenda item:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Legacy agenda endpoint - keeping for backward compatibility
  app.post('/api/v1/meetings/:meetingId/agenda-legacy', (req, res) => {
    try {
      const { meetingId } = req.params;
      const { title, duration } = req.body;
      const meeting = founderOSDatabase.meetings.find(m => m.id === meetingId);
      
      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }
      
      if (!meeting.agendaItems) {
        meeting.agendaItems = [];
      }
      
      const agendaItem = {
        id: `agenda-${Date.now()}`,
        title,
        duration: duration || 15
      };
      
      meeting.agendaItems.push(agendaItem);
      res.status(201).json({ success: true, data: agendaItem });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/v1/meetings/:meetingId/agenda/:agendaId', (req, res) => {
    try {
      const { meetingId, agendaId } = req.params;
      const meeting = founderOSDatabase.meetings.find(m => m.id === meetingId);
      
      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }
      
      if (!meeting.agendaItems) {
        meeting.agendaItems = [];
      }
      
      const index = meeting.agendaItems.findIndex(a => a.id === agendaId);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Agenda item not found' });
      }
      
      const deleted = meeting.agendaItems.splice(index, 1)[0];
      res.json({ success: true, data: deleted });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Meeting Links
  app.post('/api/v1/meetings/:meetingId/links', (req, res) => {
    try {
      const { meetingId } = req.params;
      const { title, url, type } = req.body;
      const meeting = founderOSDatabase.meetings.find(m => m.id === meetingId);
      
      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }
      
      if (!meeting.links) {
        meeting.links = [];
      }
      
      const link = {
        id: `link-${Date.now()}`,
        title,
        url,
        type: type || 'doc'
      };
      
      meeting.links.push(link);
      res.status(201).json({ success: true, data: link });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/v1/meetings/:meetingId/links/:linkId', (req, res) => {
    try {
      const { meetingId, linkId } = req.params;
      const meeting = founderOSDatabase.meetings.find(m => m.id === meetingId);
      
      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }
      
      if (!meeting.links) {
        meeting.links = [];
      }
      
      const index = meeting.links.findIndex(l => l.id === linkId);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Link not found' });
      }
      
      const deleted = meeting.links.splice(index, 1)[0];
      res.json({ success: true, data: deleted });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Meeting Tasks / Action Items
  app.post('/api/v1/meetings/:meetingId/tasks', (req, res) => {
    try {
      const { meetingId } = req.params;
      const { title, assigned_to, due_at } = req.body;
      const meeting = founderOSDatabase.meetings.find(m => m.id === meetingId);
      
      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }
      
      if (!meeting.tasks) {
        meeting.tasks = [];
      }
      
      const task = {
        id: `task-${Date.now()}`,
        title,
        assigned_to: assigned_to || null,
        due_at: due_at || null,
        status: 'pending'
      };
      
      meeting.tasks.push(task);

      // Also add to global tasks list for synchronization
      if (!founderOSDatabase.global_tasks) {
        founderOSDatabase.global_tasks = [];
      }
      
      const globalTask = {
        ...task,
        org_id: 'org-001',
        source: 'meeting',
        source_id: meetingId,
        created_at: new Date().toISOString()
      };
      
      founderOSDatabase.global_tasks.push(globalTask);

      res.status(201).json({ success: true, data: task });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/v1/meetings/:meetingId/tasks/:taskId', (req, res) => {
    try {
      const { meetingId, taskId } = req.params;
      const { title, assigned_to, due_at, status } = req.body;
      const meeting = founderOSDatabase.meetings.find(m => m.id === meetingId);
      
      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }
      
      if (!meeting.tasks) {
        meeting.tasks = [];
      }
      
      const task = meeting.tasks.find(t => t.id === taskId);
      if (!task) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      
      if (title) task.title = title;
      if (assigned_to) task.assigned_to = assigned_to;
      if (due_at) task.due_at = due_at;
      if (status) task.status = status;
      
      // Sync to global tasks
      if (founderOSDatabase.global_tasks) {
        const globalTask = founderOSDatabase.global_tasks.find(t => t.id === taskId);
        if (globalTask) {
          if (title) globalTask.title = title;
          if (assigned_to) globalTask.assigned_to = assigned_to;
          if (due_at) globalTask.due_at = due_at;
          if (status) globalTask.status = status;
        }
      }
      
      res.json({ success: true, data: task });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/v1/meetings/:meetingId/tasks/:taskId', (req, res) => {
    try {
      const { meetingId, taskId } = req.params;
      const meeting = founderOSDatabase.meetings.find(m => m.id === meetingId);
      
      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }
      
      if (!meeting.tasks) {
        meeting.tasks = [];
      }
      
      const index = meeting.tasks.findIndex(t => t.id === taskId);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Task not found' });
      }
      
      const deleted = meeting.tasks.splice(index, 1)[0];

      // Also remove from global tasks
      if (founderOSDatabase.global_tasks) {
        const globalIndex = founderOSDatabase.global_tasks.findIndex(t => t.id === taskId);
        if (globalIndex !== -1) {
          founderOSDatabase.global_tasks.splice(globalIndex, 1);
        }
      }

      res.json({ success: true, data: deleted });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Meeting Transcription Upload
  app.post('/api/v1/meetings/:meetingId/transcription', (req, res) => {
    try {
      const { meetingId } = req.params;
      const { file_url, file_name } = req.body;
      const meeting = founderOSDatabase.meetings.find(m => m.id === meetingId);
      
      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }
      
      if (!meeting.transcription) {
        meeting.transcription = {};
      }
      
      meeting.transcription = {
        file_url: file_url || null,
        file_name: file_name || 'transcription',
        uploaded_at: new Date().toISOString(),
        status: 'completed'
      };
      
      res.status(201).json({ success: true, data: meeting.transcription });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/v1/meetings/:meetingId/transcription', (req, res) => {
    try {
      const { meetingId } = req.params;
      const meeting = founderOSDatabase.meetings.find(m => m.id === meetingId);
      
      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }
      
      meeting.transcription = {
        file_url: null,
        file_name: null,
        uploaded_at: null,
        status: 'pending'
      };
      
      res.json({ success: true, data: meeting.transcription });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Team Members
  app.get('/api/v1/team-members', (req, res) => {
    try {
      res.json({ success: true, data: founderOSDatabase.team_members });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Global Tasks (synced from all sources)
  app.get('/api/v1/global-tasks', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const tasks = founderOSDatabase.global_tasks?.filter(t => t.org_id === org_id) || [];
      res.json({ success: true, data: tasks, total: tasks.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Meeting Templates
  app.get('/api/v1/meeting-templates', (req, res) => {
    try {
      res.json({ success: true, data: founderOSDatabase.meeting_templates });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/meetings/:meetingId/apply-template', (req, res) => {
    try {
      const { meetingId } = req.params;
      const { templateId } = req.body;
      const meeting = founderOSDatabase.meetings.find(m => m.id === meetingId);
      const template = founderOSDatabase.meeting_templates.find(t => t.id === templateId);

      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }
      if (!template) {
        return res.status(404).json({ success: false, error: 'Template not found' });
      }

      // Apply template
      meeting.agendaItems = template.agendaItems.map(item => ({
        id: `agenda-${Date.now()}-${Math.random()}`,
        title: item.title,
        duration: item.duration,
        status: 'pending'
      }));
      meeting.facilitator = template.facilitator;
      meeting.updated_at = new Date().toISOString();

      res.json({ success: true, data: meeting });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Meeting Reminders
  app.post('/api/v1/meetings/:meetingId/reminders', (req, res) => {
    try {
      const { meetingId } = req.params;
      const { reminder_time, email_to } = req.body;
      const meeting = founderOSDatabase.meetings.find(m => m.id === meetingId);

      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }

      if (!meeting.reminders) {
        meeting.reminders = [];
      }

      const reminder = {
        id: `reminder-${Date.now()}`,
        reminder_time: reminder_time || '15', // minutes before meeting
        email_to: email_to,
        status: 'scheduled',
        created_at: new Date().toISOString()
      };

      meeting.reminders.push(reminder);
      res.status(201).json({ success: true, data: reminder });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/v1/meetings/:meetingId/reminders/:reminderId', (req, res) => {
    try {
      const { meetingId, reminderId } = req.params;
      const meeting = founderOSDatabase.meetings.find(m => m.id === meetingId);

      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }

      if (!meeting.reminders) {
        meeting.reminders = [];
      }

      const index = meeting.reminders.findIndex(r => r.id === reminderId);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Reminder not found' });
      }

      const deleted = meeting.reminders.splice(index, 1)[0];
      res.json({ success: true, data: deleted });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Attendee Management
  app.post('/api/v1/meetings/:meetingId/attendees', (req, res) => {
    try {
      const { meetingId } = req.params;
      const { attendee_name, attendee_email } = req.body;
      const meeting = founderOSDatabase.meetings.find(m => m.id === meetingId);

      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }

      if (!meeting.attendees_list) {
        meeting.attendees_list = [];
      }

      const attendee = {
        id: `attendee-${Date.now()}`,
        name: attendee_name,
        email: attendee_email,
        status: 'invited',
        added_at: new Date().toISOString()
      };

      meeting.attendees_list.push(attendee);
      res.status(201).json({ success: true, data: attendee });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/v1/meetings/:meetingId/attendees/:attendeeId', (req, res) => {
    try {
      const { meetingId, attendeeId } = req.params;
      const meeting = founderOSDatabase.meetings.find(m => m.id === meetingId);

      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }

      if (!meeting.attendees_list) {
        meeting.attendees_list = [];
      }

      const index = meeting.attendees_list.findIndex(a => a.id === attendeeId);
      if (index === -1) {
        return res.status(404).json({ success: false, error: 'Attendee not found' });
      }

      const deleted = meeting.attendees_list.splice(index, 1)[0];
      res.json({ success: true, data: deleted });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Decision Tracking - GET decisions for a meeting - Using Database
  app.get('/api/v1/meetings/:meetingId/decisions', async (req, res) => {
    try {
      const { meetingId } = req.params;
      const meeting = await dbHelper.getMeetingById(meetingId);

      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }

      // Map database field names to frontend expected names
      const decisions = (meeting.decisions || []).map(d => ({
        ...d,
        title: d.decision || d.title, // Map 'decision' column to 'title'
        review_at: d.review_date || d.review_at
      }));
      res.json({ success: true, data: decisions, total: decisions.length });
    } catch (error) {
      console.error('Error fetching decisions:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Decision Tracking - POST new decision - Using Database
  app.post('/api/v1/meetings/:meetingId/decisions', async (req, res) => {
    try {
      const { meetingId } = req.params;
      const { title, rationale, owner, owner_id, review_at, create_task } = req.body;
      
      const meeting = await dbHelper.getMeetingById(meetingId);
      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }

      const decisionData = await dbHelper.addMeetingDecision(meetingId, {
        decision: title,
        rationale,
        owner_id: owner_id || owner,
        owner_name: owner || owner_id,
        review_date: review_at,
        status: 'approved'
      });
      
      // Map database field to frontend expected field
      const decision = {
        ...decisionData,
        title: decisionData.decision || title,
        review_at: decisionData.review_date || review_at
      };
      
      // Auto-create task if requested
      let task = null;
      if (create_task && (owner_id || owner)) {
        task = await dbHelper.createTask({
          org_id: 'org-001',
          user_id: owner_id || owner,
          title: `Follow up: ${title}`,
          description: `Decision from meeting: ${meeting.title}`,
          status: 'pending',
          priority: 'medium',
          due_date: review_at
        });
      }
      
      res.status(201).json({ success: true, data: decision, auto_task: task });
    } catch (error) {
      console.error('Error creating decision:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/v1/meetings/:meetingId/decisions/:decisionId', async (req, res) => {
    try {
      const { decisionId } = req.params;
      await dbHelper.deleteMeetingDecision(decisionId);
      res.json({ success: true, message: 'Decision deleted' });
    } catch (error) {
      console.error('Error deleting decision:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // PDF Export
  app.get('/api/v1/meetings/:meetingId/export-pdf', (req, res) => {
    try {
      const { meetingId } = req.params;
      const meeting = founderOSDatabase.meetings.find(m => m.id === meetingId);

      if (!meeting) {
        return res.status(404).json({ success: false, error: 'Meeting not found' });
      }

      // Generate PDF content (simplified - in production use a library like pdfkit)
      const pdfContent = `
MEETING MINUTES: ${meeting.title}
=====================================

Date: ${meeting.start_at ? new Date(meeting.start_at).toLocaleDateString() : 'N/A'}
Time: ${meeting.start_at ? new Date(meeting.start_at).toLocaleTimeString() : 'N/A'}
Location: ${meeting.location || 'N/A'}
Facilitator: ${meeting.facilitator || 'N/A'}

AGENDA:
${meeting.agendaItems?.map((item, i) => `${i + 1}. ${item.title} (${item.duration} min)`).join('\n') || 'No agenda items'}

ATTENDEES:
${meeting.attendees_list?.map(a => `- ${a.name} (${a.email})`).join('\n') || 'No attendees'}

NOTES:
${meeting.minutes?.content || 'No notes'}

KEY DECISIONS:
${meeting.minutes?.key_decisions?.map(d => `- ${d}`).join('\n') || 'No decisions'}

ACTION ITEMS:
${meeting.tasks?.map(t => `- ${t.title} (Assigned to: ${t.assigned_to})`).join('\n') || 'No action items'}

DECISIONS:
${meeting.decisions?.map(d => `- ${d.title}\n  Rationale: ${d.rationale}\n  Owner: ${d.owner}`).join('\n') || 'No decisions'}

Generated: ${new Date().toLocaleString()}
      `;

      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="meeting-${meetingId}.txt"`);
      res.send(pdfContent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Meeting Decisions
  app.get('/api/v1/meeting-decisions', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const decisions = founderOSDatabase.meeting_decisions.filter(d => d.org_id === org_id);
      res.json({ success: true, data: decisions, total: decisions.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/meeting-decisions', (req, res) => {
    try {
      const { meeting_id, title, rationale, owner_id, review_at } = req.body;
      const decision = {
        id: `dec-${Date.now()}`,
        org_id: 'org-001',
        meeting_id, title, rationale, owner_id, review_at,
        status: 'pending'
      };
      founderOSDatabase.meeting_decisions.push(decision);
      res.status(201).json({ success: true, data: decision });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Meeting Actions
  app.get('/api/v1/meeting-actions', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const actions = founderOSDatabase.meeting_actions.filter(a => a.org_id === org_id);
      res.json({ success: true, data: actions, total: actions.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/meeting-actions', (req, res) => {
    try {
      const { meeting_id, title, owner_id, due_at } = req.body;
      const action = {
        id: `act-${Date.now()}`,
        org_id: 'org-001',
        meeting_id, task_id: `task-${Date.now()}`,
        title, owner_id, due_at,
        status: 'pending'
      };
      founderOSDatabase.meeting_actions.push(action);
      res.status(201).json({ success: true, data: action });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Requests - Using Database
  app.get('/api/v1/requests', async (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const { user_id, status, requester_id, routed_to_id } = req.query;
      
      const requests = await dbHelper.getRequests(org_id, { user_id, status, requester_id, routed_to_id });
      res.json({ success: true, data: requests, total: requests.length });
    } catch (error) {
      console.error('Error fetching requests:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Get single request by ID
  app.get('/api/v1/requests/:requestId', async (req, res) => {
    try {
      const { requestId } = req.params;
      const request = await dbHelper.getRequestById(requestId);
      
      if (!request) {
        return res.status(404).json({ success: false, error: 'Request not found' });
      }
      
      res.json({ success: true, data: request });
    } catch (error) {
      console.error('Error fetching request:', error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/requests', async (req, res) => {
    try {
      const { 
        requester_id, requester_name, requester_email,
        routed_to_id, routed_to_name, routed_to_email,
        category, urgency, description, what_tried, impact 
      } = req.body;
      
      const request = await dbHelper.createRequest({
        org_id: 'org-001',
        requester_id: requester_id || 'user-001',
        requester_name: requester_name || 'User',
        requester_email: requester_email || '',
        routed_to_id: routed_to_id || 'user-001',
        routed_to_name: routed_to_name || 'Admin',
        routed_to_email: routed_to_email || '',
        category: category || 'general',
        urgency: urgency || 'P3',
        description: description || '',
        what_tried: what_tried || '',
        impact: impact || '',
        request_type: routed_to_id === 'user-001' ? 'to_founder' : 'to_team'
      });
      
      res.status(201).json({ success: true, data: request });
    } catch (error) {
      console.error('Error creating request:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Update request
  app.put('/api/v1/requests/:requestId', async (req, res) => {
    try {
      const { requestId } = req.params;
      const request = await dbHelper.updateRequest(requestId, req.body);
      
      if (!request) {
        return res.status(404).json({ success: false, error: 'Request not found' });
      }
      
      res.json({ success: true, data: request });
    } catch (error) {
      console.error('Error updating request:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Reject request
  app.post('/api/v1/requests/:requestId/reject', async (req, res) => {
    try {
      const { requestId } = req.params;
      const { rejection_reason } = req.body;
      
      const request = await dbHelper.updateRequest(requestId, {
        status: 'rejected',
        response: rejection_reason || 'Request rejected',
        responded_at: new Date().toISOString()
      });
      
      if (!request) {
        return res.status(404).json({ success: false, error: 'Request not found' });
      }
      
      res.json({ success: true, data: request });
    } catch (error) {
      console.error('Error rejecting request:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Approve request
  app.post('/api/v1/requests/:requestId/approve', async (req, res) => {
    try {
      const { requestId } = req.params;
      const { resolution_notes } = req.body;
      
      const request = await dbHelper.updateRequest(requestId, {
        status: 'completed',
        response: resolution_notes || 'Request approved',
        responded_at: new Date().toISOString()
      });
      
      if (!request) {
        return res.status(404).json({ success: false, error: 'Request not found' });
      }
      
      res.json({ success: true, data: request });
    } catch (error) {
      console.error('Error approving request:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Delete request
  app.delete('/api/v1/requests/:requestId', async (req, res) => {
    try {
      const { requestId } = req.params;
      await dbHelper.deleteRequest(requestId);
      res.json({ success: true, message: 'Request deleted' });
    } catch (error) {
      console.error('Error deleting request:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Escalation Rules
  app.get('/api/v1/escalation-rules', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const rules = founderOSDatabase.escalation_rules.filter(r => r.org_id === org_id);
      res.json({ success: true, data: rules, total: rules.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Office Hours
  app.get('/api/v1/office-hours', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const hours = founderOSDatabase.office_hours.filter(h => h.org_id === org_id);
      res.json({ success: true, data: hours, total: hours.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/office-hours', (req, res) => {
    try {
      const { owner_id, day_of_week, start_time, end_time, capacity } = req.body;
      const officeHour = {
        id: `oh-${Date.now()}`,
        org_id: 'org-001',
        owner_id, day_of_week, start_time, end_time, capacity
      };
      founderOSDatabase.office_hours.push(officeHour);
      res.status(201).json({ success: true, data: officeHour });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Summary
  app.get('/api/v1/founder-os/summary', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const blocks = founderOSDatabase.time_blocks.filter(b => b.org_id === org_id);
      const commitments = founderOSDatabase.commitments.filter(c => c.org_id === org_id);
      const sessions = founderOSDatabase.focus_sessions.filter(s => s.org_id === org_id);
      const meetings = founderOSDatabase.meetings.filter(m => m.org_id === org_id);
      const requests = founderOSDatabase.requests.filter(r => r.org_id === org_id);

      const totalPlannedMinutes = commitments.reduce((sum, c) => sum + c.planned_minutes, 0);
      const totalActualMinutes = commitments.reduce((sum, c) => sum + c.actual_minutes, 0);
      const completionRate = totalPlannedMinutes > 0 ? ((totalActualMinutes / totalPlannedMinutes) * 100).toFixed(1) : 0;

      const totalBreaches = sessions.reduce((sum, s) => sum + s.breaches, 0);
      const avgBreachesPerSession = sessions.length > 0 ? (totalBreaches / sessions.length).toFixed(2) : 0;

      const openRequests = requests.filter(r => r.status === 'open').length;
      const p1Requests = requests.filter(r => r.urgency === 'P1').length;

      res.json({
        success: true,
        data: {
          total_blocks: blocks.length,
          total_commitments: commitments.length,
          completion_rate: completionRate,
          focus_sessions: sessions.length,
          avg_breaches_per_session: avgBreachesPerSession,
          total_meetings: meetings.length,
          open_requests: openRequests,
          p1_requests: p1Requests
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
