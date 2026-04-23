// Founder OS Extended Routes - Complete Implementation
// Weekly Planner, Deep-Work Guardrails, Agenda Enforcement, AI Copilots

const founderOSExtendedDatabase = {
  weekly_plans: [
    {
      id: 'wp-001',
      org_id: 'org-001',
      user_id: 'user-001',
      week_start: '2025-11-10',
      week_end: '2025-11-16',
      status: 'active',
      blocks: ['tb-001', 'tb-002', 'tb-003'],
      daily_top3: {
        'Monday': ['comm-001', 'comm-002', 'comm-003'],
        'Tuesday': ['comm-004', 'comm-005', 'comm-006'],
        'Wednesday': ['comm-007', 'comm-008', 'comm-009']
      },
      focus_hours_planned: 20,
      focus_hours_completed: 12,
      completion_rate: 60,
      created_at: '2025-11-08',
      updated_at: '2025-11-08'
    }
  ],

  deep_work_guardrails: [
    {
      id: 'dw-001',
      org_id: 'org-001',
      user_id: 'user-001',
      session_id: 'fs-001',
      start_at: '2025-11-08T09:00:00Z',
      end_at: '2025-11-08T11:00:00Z',
      status: 'active',
      mute_notifications: true,
      allowed_contacts: ['user-002', 'user-003'],
      breaches: [
        { time: '2025-11-08T09:15:00Z', contact: 'user-004', reason: 'Slack message' },
        { time: '2025-11-08T10:30:00Z', contact: 'user-005', reason: 'Email' }
      ],
      breach_count: 2,
      focus_score: 85,
      notes: 'Good focus session with 2 minor interruptions'
    }
  ],

  agenda_enforcement: [
    {
      id: 'ae-001',
      org_id: 'org-001',
      meeting_id: 'mtg-001',
      has_agenda: true,
      agenda_completeness: 100,
      status: 'compliant',
      nudge_sent: false,
      auto_cancel_triggered: false,
      created_at: '2025-11-08',
      updated_at: '2025-11-08'
    },
    {
      id: 'ae-002',
      org_id: 'org-001',
      meeting_id: 'mtg-002',
      has_agenda: false,
      agenda_completeness: 0,
      status: 'non_compliant',
      nudge_sent: true,
      auto_cancel_triggered: false,
      nudge_time: '2025-11-08T14:00:00Z',
      created_at: '2025-11-08',
      updated_at: '2025-11-08'
    }
  ],

  meeting_summaries: [
    {
      id: 'ms-001',
      org_id: 'org-001',
      meeting_id: 'mtg-001',
      title: 'Weekly Leadership Sync',
      attendees: ['user-001', 'user-002', 'user-003'],
      agenda_items: [
        { segment: 'Updates', duration: 15, completed: true },
        { segment: 'Blockers', duration: 20, completed: true }
      ],
      decisions: [
        { title: 'Approve Q4 roadmap', owner: 'user-001', deadline: '2025-11-17' }
      ],
      actions: [
        { title: 'Send roadmap to stakeholders', owner: 'user-002', deadline: '2025-11-12', status: 'pending' }
      ],
      summary: 'Productive meeting with clear decisions and action items',
      generated_at: '2025-11-08T11:05:00Z',
      sent_to_attendees: true
    }
  ],

  focus_analytics: [
    {
      id: 'fa-001',
      org_id: 'org-001',
      user_id: 'user-001',
      week_start: '2025-11-03',
      week_end: '2025-11-09',
      total_focus_hours_planned: 20,
      total_focus_hours_completed: 16,
      completion_rate: 80,
      total_breaches: 5,
      avg_breaches_per_session: 1.25,
      context_switches: 8,
      deep_work_score: 82,
      top_interruption_source: 'Slack',
      recommendations: [
        'Schedule focus blocks earlier in the day',
        'Reduce Slack notifications during deep work',
        'Add buffer time between meetings'
      ]
    }
  ],

  meeting_analytics: [
    {
      id: 'ma-001',
      org_id: 'org-001',
      user_id: 'user-001',
      week_start: '2025-11-03',
      week_end: '2025-11-09',
      total_meetings: 8,
      total_meeting_hours: 6,
      avg_meeting_duration: 45,
      meetings_with_agenda: 7,
      agenda_compliance: 87.5,
      total_decisions: 12,
      decisions_with_owner: 12,
      decision_ownership: 100,
      total_actions: 15,
      actions_completed: 12,
      action_closure_rate: 80,
      meeting_effectiveness_score: 85
    }
  ],

  firewall_analytics: [
    {
      id: 'fw-001',
      org_id: 'org-001',
      user_id: 'user-001',
      week_start: '2025-11-03',
      week_end: '2025-11-09',
      total_requests: 18,
      p1_requests: 3,
      p2_requests: 5,
      p3_requests: 6,
      p4_requests: 4,
      requests_routed_to_manager: 12,
      requests_routed_to_office_hours: 4,
      requests_routed_to_owner: 2,
      routing_effectiveness: 89,
      avg_response_time_hours: 2.5,
      true_p1_ratio: 95,
      interruptions_prevented: 12,
      interruption_reduction: 67
    }
  ],

  ai_suggestions: [
    {
      id: 'ai-001',
      org_id: 'org-001',
      user_id: 'user-001',
      type: 'planning',
      suggestion: 'Based on your tasks, I recommend 3 deep-work blocks of 120 mins each on Mon/Wed/Fri, avoiding 12-1:30pm. This gives you 6 hours of focused time.',
      priority: 'high',
      accepted: true,
      applied_at: '2025-11-08T09:00:00Z'
    },
    {
      id: 'ai-002',
      org_id: 'org-001',
      user_id: 'user-001',
      type: 'meeting',
      suggestion: 'Your meeting "Product Review" is missing an agenda. Add one to improve meeting effectiveness.',
      priority: 'medium',
      accepted: false
    },
    {
      id: 'ai-003',
      org_id: 'org-001',
      user_id: 'user-001',
      type: 'firewall',
      suggestion: 'This request is P3 (non-urgent). Route to office hours on Friday 2-3pm instead of interrupting now.',
      priority: 'high',
      accepted: true
    }
  ],

  founder_brief: [
    {
      id: 'fb-001',
      org_id: 'org-001',
      user_id: 'user-001',
      week_start: '2025-11-03',
      week_end: '2025-11-09',
      focus_hours_completed: 16,
      focus_hours_planned: 20,
      focus_completion_rate: 80,
      meeting_hours: 6,
      meeting_reduction_vs_baseline: 25,
      decisions_made: 12,
      actions_completed: 12,
      interruptions_prevented: 12,
      top_wins: [
        'Achieved 80% focus completion rate',
        'Completed all action items from meetings',
        'Prevented 12 interruptions with firewall'
      ],
      areas_to_improve: [
        'Schedule more deep-work blocks',
        'Reduce meeting hours further',
        'Improve agenda compliance to 95%'
      ],
      generated_at: '2025-11-09T17:00:00Z',
      sent_to_email: true
    }
  ]
};

module.exports = (app) => {
  // Weekly Plans
  app.get('/api/v1/weekly-plans', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const plans = founderOSExtendedDatabase.weekly_plans.filter(p => p.org_id === org_id);
      res.json({ success: true, data: plans, total: plans.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/weekly-plans', (req, res) => {
    try {
      const { user_id, week_start, week_end, blocks, daily_top3 } = req.body;
      const plan = {
        id: `wp-${Date.now()}`,
        org_id: 'org-001',
        user_id, week_start, week_end, blocks, daily_top3,
        status: 'active',
        focus_hours_planned: 20,
        focus_hours_completed: 0,
        completion_rate: 0,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      };
      founderOSExtendedDatabase.weekly_plans.push(plan);
      res.status(201).json({ success: true, data: plan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Deep Work Guardrails
  app.get('/api/v1/deep-work-guardrails', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const guardrails = founderOSExtendedDatabase.deep_work_guardrails.filter(g => g.org_id === org_id);
      res.json({ success: true, data: guardrails, total: guardrails.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/deep-work-guardrails', (req, res) => {
    try {
      const { user_id, session_id, start_at, end_at, allowed_contacts } = req.body;
      const guardrail = {
        id: `dw-${Date.now()}`,
        org_id: 'org-001',
        user_id, session_id, start_at, end_at, allowed_contacts,
        status: 'active',
        mute_notifications: true,
        breaches: [],
        breach_count: 0,
        focus_score: 100
      };
      founderOSExtendedDatabase.deep_work_guardrails.push(guardrail);
      res.status(201).json({ success: true, data: guardrail });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/v1/deep-work-guardrails/:id', (req, res) => {
    try {
      const guardrail = founderOSExtendedDatabase.deep_work_guardrails.find(g => g.id === req.params.id);
      if (!guardrail) return res.status(404).json({ error: 'Guardrail not found' });
      Object.assign(guardrail, req.body);
      res.json({ success: true, data: guardrail });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Agenda Enforcement
  app.get('/api/v1/agenda-enforcement', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const enforcement = founderOSExtendedDatabase.agenda_enforcement.filter(a => a.org_id === org_id);
      res.json({ success: true, data: enforcement, total: enforcement.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Meeting Summaries
  app.get('/api/v1/meeting-summaries', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const summaries = founderOSExtendedDatabase.meeting_summaries.filter(s => s.org_id === org_id);
      res.json({ success: true, data: summaries, total: summaries.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/meeting-summaries', (req, res) => {
    try {
      const { meeting_id, title, attendees, agenda_items, decisions, actions } = req.body;
      const summary = {
        id: `ms-${Date.now()}`,
        org_id: 'org-001',
        meeting_id, title, attendees, agenda_items, decisions, actions,
        summary: 'Meeting summary auto-generated',
        generated_at: new Date().toISOString(),
        sent_to_attendees: true
      };
      founderOSExtendedDatabase.meeting_summaries.push(summary);
      res.status(201).json({ success: true, data: summary });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Focus Analytics
  app.get('/api/v1/focus-analytics', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const analytics = founderOSExtendedDatabase.focus_analytics.filter(a => a.org_id === org_id);
      res.json({ success: true, data: analytics, total: analytics.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Meeting Analytics
  app.get('/api/v1/meeting-analytics', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const analytics = founderOSExtendedDatabase.meeting_analytics.filter(a => a.org_id === org_id);
      res.json({ success: true, data: analytics, total: analytics.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Firewall Analytics
  app.get('/api/v1/firewall-analytics', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const analytics = founderOSExtendedDatabase.firewall_analytics.filter(a => a.org_id === org_id);
      res.json({ success: true, data: analytics, total: analytics.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // AI Suggestions
  app.get('/api/v1/ai-suggestions', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const suggestions = founderOSExtendedDatabase.ai_suggestions.filter(s => s.org_id === org_id);
      res.json({ success: true, data: suggestions, total: suggestions.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Founder Brief
  app.get('/api/v1/founder-brief', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const briefs = founderOSExtendedDatabase.founder_brief.filter(b => b.org_id === org_id);
      res.json({ success: true, data: briefs, total: briefs.length });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Complete Founder OS Summary
  app.get('/api/v1/founder-os/complete-summary', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';

      const plans = founderOSExtendedDatabase.weekly_plans.filter(p => p.org_id === org_id);
      const guardrails = founderOSExtendedDatabase.deep_work_guardrails.filter(g => g.org_id === org_id);
      const enforcement = founderOSExtendedDatabase.agenda_enforcement.filter(a => a.org_id === org_id);
      const summaries = founderOSExtendedDatabase.meeting_summaries.filter(s => s.org_id === org_id);
      const focusAnalytics = founderOSExtendedDatabase.focus_analytics.filter(a => a.org_id === org_id);
      const meetingAnalytics = founderOSExtendedDatabase.meeting_analytics.filter(a => a.org_id === org_id);
      const firewallAnalytics = founderOSExtendedDatabase.firewall_analytics.filter(a => a.org_id === org_id);
      const suggestions = founderOSExtendedDatabase.ai_suggestions.filter(s => s.org_id === org_id);
      const briefs = founderOSExtendedDatabase.founder_brief.filter(b => b.org_id === org_id);

      const latestFocusAnalytics = focusAnalytics[focusAnalytics.length - 1];
      const latestMeetingAnalytics = meetingAnalytics[meetingAnalytics.length - 1];
      const latestFirewallAnalytics = firewallAnalytics[firewallAnalytics.length - 1];

      res.json({
        success: true,
        data: {
          weekly_plans: plans.length,
          deep_work_sessions: guardrails.length,
          agenda_compliance: enforcement.filter(e => e.status === 'compliant').length,
          meeting_summaries: summaries.length,
          focus_completion_rate: latestFocusAnalytics?.completion_rate || 0,
          focus_score: latestFocusAnalytics?.deep_work_score || 0,
          meeting_effectiveness: latestMeetingAnalytics?.meeting_effectiveness_score || 0,
          action_closure_rate: latestMeetingAnalytics?.action_closure_rate || 0,
          interruptions_prevented: latestFirewallAnalytics?.interruptions_prevented || 0,
          interruption_reduction: latestFirewallAnalytics?.interruption_reduction || 0,
          ai_suggestions_pending: suggestions.filter(s => !s.accepted).length,
          founder_briefs_generated: briefs.length
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
