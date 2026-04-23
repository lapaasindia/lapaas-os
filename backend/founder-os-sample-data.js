// Sample data for Founder OS backend
// This initializes the in-memory database with realistic data

const sampleData = {
  tasks: [
    {
      id: 'task-001',
      org_id: 'org-001',
      owner_id: 'user-001',
      title: 'Implement calendar module',
      description: 'Build calendar UI and API integration',
      priority: 'P1',
      status: 'in_progress',
      due_at: '2025-11-15',
      project_id: null,
      parent_id: null,
      checklist_json: [
        { item: 'Design layout', done: true },
        { item: 'Implement views', done: true },
        { item: 'Add event creation', done: false }
      ],
      time_spent_min: 240,
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'task-002',
      org_id: 'org-001',
      owner_id: 'user-001',
      title: 'Review Q4 roadmap',
      description: 'Review and approve Q4 product roadmap',
      priority: 'P1',
      status: 'pending',
      due_at: '2025-11-12',
      project_id: null,
      parent_id: null,
      checklist_json: [],
      time_spent_min: 0,
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'task-003',
      org_id: 'org-001',
      owner_id: 'user-001',
      title: 'Send roadmap to stakeholders',
      description: 'Communicate Q4 roadmap to all stakeholders',
      priority: 'P2',
      status: 'pending',
      due_at: '2025-11-14',
      project_id: null,
      parent_id: null,
      checklist_json: [],
      time_spent_min: 0,
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'task-004',
      org_id: 'org-001',
      owner_id: 'user-001',
      title: 'Fix login bug',
      description: 'Users getting redirected from /feed page',
      priority: 'P1',
      status: 'done',
      due_at: '2025-11-10',
      project_id: null,
      parent_id: null,
      checklist_json: [],
      time_spent_min: 120,
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'task-005',
      org_id: 'org-001',
      owner_id: 'user-001',
      title: 'Reproduce issue',
      description: 'Identify root cause of login issue',
      priority: 'P1',
      status: 'done',
      due_at: '2025-11-10',
      project_id: null,
      parent_id: null,
      checklist_json: [],
      time_spent_min: 60,
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'task-006',
      org_id: 'org-001',
      owner_id: 'user-001',
      title: 'Implement fix',
      description: 'Deploy fix to production',
      priority: 'P1',
      status: 'done',
      due_at: '2025-11-10',
      project_id: null,
      parent_id: null,
      checklist_json: [],
      time_spent_min: 90,
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'task-007',
      org_id: 'org-001',
      owner_id: 'user-001',
      title: 'Update documentation',
      description: 'Update API documentation',
      priority: 'P3',
      status: 'pending',
      due_at: '2025-11-20',
      project_id: null,
      parent_id: null,
      checklist_json: [],
      time_spent_min: 0,
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'task-008',
      org_id: 'org-001',
      owner_id: 'user-001',
      title: 'Team standup prep',
      description: 'Prepare updates for team standup',
      priority: 'P2',
      status: 'pending',
      due_at: '2025-11-10',
      project_id: null,
      parent_id: null,
      checklist_json: [],
      time_spent_min: 0,
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'task-009',
      org_id: 'org-001',
      owner_id: 'user-001',
      title: 'Code review',
      description: 'Review pull requests from team',
      priority: 'P2',
      status: 'in_progress',
      due_at: '2025-11-11',
      project_id: null,
      parent_id: null,
      checklist_json: [],
      time_spent_min: 30,
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'task-010',
      org_id: 'org-001',
      owner_id: 'user-001',
      title: 'Performance optimization',
      description: 'Optimize database queries',
      priority: 'P3',
      status: 'pending',
      due_at: '2025-11-18',
      project_id: null,
      parent_id: null,
      checklist_json: [],
      time_spent_min: 0,
      created_at: '2025-11-08T10:00:00Z'
    }
  ],
  meetings: [
    {
      id: 'mtg-001',
      org_id: 'org-001',
      title: 'Weekly Leadership Sync',
      start_at: '2025-11-10T14:00:00Z',
      end_at: '2025-11-10T15:00:00Z',
      agenda_json: [
        { segment: 'Updates', minutes: 15, owner: 'user-001' },
        { segment: 'Blockers', minutes: 30, owner: 'user-002' },
        { segment: 'Decisions', minutes: 15, owner: 'user-001' }
      ],
      doc_links: ['https://docs.example.com/agenda'],
      roles_json: { facilitator: 'user-001', scribe: 'user-002', decision_maker: 'user-001' },
      status: 'scheduled',
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'mtg-002',
      org_id: 'org-001',
      title: 'Product Planning',
      start_at: '2025-11-11T10:00:00Z',
      end_at: '2025-11-11T11:30:00Z',
      agenda_json: [
        { segment: 'Q4 Roadmap', minutes: 45, owner: 'user-001' },
        { segment: 'Feature Prioritization', minutes: 45, owner: 'user-003' }
      ],
      doc_links: [],
      roles_json: { facilitator: 'user-003', scribe: 'user-001', decision_maker: 'user-001' },
      status: 'scheduled',
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'mtg-003',
      org_id: 'org-001',
      title: 'Engineering Standup',
      start_at: '2025-11-10T09:30:00Z',
      end_at: '2025-11-10T10:00:00Z',
      agenda_json: [
        { segment: 'Status Updates', minutes: 20, owner: 'user-002' },
        { segment: 'Blockers', minutes: 10, owner: 'user-002' }
      ],
      doc_links: [],
      roles_json: { facilitator: 'user-002', scribe: 'user-002', decision_maker: 'user-001' },
      status: 'scheduled',
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'mtg-004',
      org_id: 'org-001',
      title: 'Client Call',
      start_at: '2025-11-12T15:00:00Z',
      end_at: '2025-11-12T16:00:00Z',
      agenda_json: [
        { segment: 'Project Update', minutes: 30, owner: 'user-001' },
        { segment: 'Q&A', minutes: 30, owner: 'user-001' }
      ],
      doc_links: ['https://docs.example.com/client-brief'],
      roles_json: { facilitator: 'user-001', scribe: 'user-004', decision_maker: 'user-001' },
      status: 'scheduled',
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'mtg-005',
      org_id: 'org-001',
      title: 'Design Review',
      start_at: '2025-11-13T11:00:00Z',
      end_at: '2025-11-13T12:00:00Z',
      agenda_json: [
        { segment: 'UI Review', minutes: 40, owner: 'user-005' },
        { segment: 'Feedback', minutes: 20, owner: 'user-001' }
      ],
      doc_links: [],
      roles_json: { facilitator: 'user-005', scribe: 'user-001', decision_maker: 'user-001' },
      status: 'scheduled',
      created_at: '2025-11-08T10:00:00Z'
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
      attempts_json: ['Slack message', 'Email'],
      status: 'pending',
      routed_to_id: 'user-001',
      routed_to_name: 'Admin User',
      routed_to_email: 'admin@lapaas.com',
      request_type: 'to_founder',
      office_hour_slot_at: null,
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
      attempts_json: ['Slack', 'Email', 'Phone call'],
      status: 'pending',
      routed_to_id: 'user-001',
      routed_to_name: 'Admin User',
      routed_to_email: 'admin@lapaas.com',
      request_type: 'to_founder',
      office_hour_slot_at: null,
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
      attempts_json: ['Slack'],
      status: 'pending',
      routed_to_id: 'user-002',
      routed_to_name: 'John Smith',
      routed_to_email: 'john.smith@company.com',
      request_type: 'to_team',
      office_hour_slot_at: null,
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
      attempts_json: ['Email'],
      status: 'pending',
      routed_to_id: 'user-002',
      routed_to_name: 'John Smith',
      routed_to_email: 'john.smith@company.com',
      request_type: 'to_team',
      office_hour_slot_at: null,
      sla_at: '2025-11-30T17:30:00Z',
      created_at: '2025-11-26T08:00:00Z'
    }
  ],
  commitments: [
    {
      id: 'com-001',
      org_id: 'org-001',
      user_id: 'user-001',
      date: '2025-11-10',
      title: 'Implement calendar module',
      priority: 'P1',
      planned_minutes: 120,
      actual_minutes: 90,
      status: 'in_progress',
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'com-002',
      org_id: 'org-001',
      user_id: 'user-001',
      date: '2025-11-10',
      title: 'Review Q4 roadmap',
      priority: 'P1',
      planned_minutes: 60,
      actual_minutes: 0,
      status: 'pending',
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'com-003',
      org_id: 'org-001',
      user_id: 'user-001',
      date: '2025-11-10',
      title: 'Team standup',
      priority: 'P2',
      planned_minutes: 30,
      actual_minutes: 0,
      status: 'pending',
      created_at: '2025-11-08T10:00:00Z'
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
      type: 'focus',
      goal_minutes: 120,
      color: 'blue',
      notes: 'Deep work session',
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'tb-002',
      org_id: 'org-001',
      user_id: 'user-001',
      date: '2025-11-10',
      start_at: '11:00',
      end_at: '12:00',
      type: 'admin',
      goal_minutes: 60,
      color: 'purple',
      notes: 'Admin tasks',
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'tb-003',
      org_id: 'org-001',
      user_id: 'user-001',
      date: '2025-11-10',
      start_at: '14:00',
      end_at: '15:00',
      type: 'meeting',
      goal_minutes: 60,
      color: 'green',
      notes: 'Leadership sync',
      created_at: '2025-11-08T10:00:00Z'
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
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'oh-002',
      org_id: 'org-001',
      owner_id: 'user-001',
      day_of_week: 'Wednesday',
      start_time: '16:00',
      end_time: '17:00',
      created_at: '2025-11-08T10:00:00Z'
    },
    {
      id: 'oh-003',
      org_id: 'org-001',
      owner_id: 'user-001',
      day_of_week: 'Friday',
      start_time: '16:00',
      end_time: '17:00',
      created_at: '2025-11-08T10:00:00Z'
    }
  ]
};

module.exports = sampleData;
