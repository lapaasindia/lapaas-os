/**
 * Admin Routes - JavaScript Version for test-server.js
 * Module Management, AI Credits, Billing, Collections, Reporting
 */

const { v4: uuidv4 } = require('uuid');

// In-memory storage
const modules = [
  { id: 'founder-os', code: 'FOUNDER_OS', name: 'Founder OS', price: 999, status: 'active' },
  { id: 'bms-planning', code: 'BMS_PLANNING', name: 'BMS & Planning', price: 1499, status: 'active' },
  { id: 'finance-os', code: 'FINANCE_OS', name: 'Finance OS', price: 1999, status: 'active' },
  { id: 'sales-os', code: 'SALES_OS', name: 'Sales OS', price: 1999, status: 'active' },
  { id: 'marketing-os', code: 'MARKETING_OS', name: 'Marketing OS', price: 1499, status: 'active' },
  { id: 'operations-os', code: 'OPERATIONS_OS', name: 'Operations OS', price: 1999, status: 'active' },
  { id: 'customer-os', code: 'CUSTOMER_OS', name: 'Customer OS', price: 1499, status: 'active' },
  { id: 'people-os', code: 'PEOPLE_OS', name: 'People OS', price: 1499, status: 'active' },
  { id: 'automation-os', code: 'AUTOMATION_OS', name: 'Automation OS', price: 999, status: 'active' },
  { id: 'risk-data-os', code: 'RISK_DATA_OS', name: 'Risk & Data OS', price: 1499, status: 'active' }
];

const orgModules = [];
const aiCredits = [];
const subscriptions = [];
const payments = [];
const collectionsPolicies = [];
const collectionsTemplates = [];
const collectionsAgents = [];
const collectionsAutomations = [];
const auditLogs = [];

module.exports = (app) => {
  // ============================================
  // MODULE MANAGEMENT ENDPOINTS
  // ============================================

  app.get('/api/v1/admin/modules', (req, res) => {
    res.status(200).json({
      success: true,
      data: modules,
      total: modules.length
    });
  });

  app.post('/api/v1/admin/org-modules', (req, res) => {
    const { org_id, module_id, seats } = req.body;
    if (!org_id || !module_id || !seats) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const orgModule = {
      id: uuidv4(),
      org_id,
      module_id,
      seats,
      status: 'active',
      created_at: new Date().toISOString()
    };
    orgModules.push(orgModule);
    auditLogs.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      actor: 'admin@lapaas.com',
      action: 'assign_module',
      resource: module_id,
      status: 'success'
    });
    res.status(201).json({ success: true, message: 'Module assigned', data: orgModule });
  });

  app.get('/api/v1/admin/org-modules/:org_id', (req, res) => {
    const { org_id } = req.params;
    const result = orgModules.filter(m => m.org_id === org_id);
    res.status(200).json({ success: true, data: result, total: result.length });
  });

  // ============================================
  // AI CREDIT MANAGEMENT ENDPOINTS
  // ============================================

  app.post('/api/v1/admin/ai-credits', (req, res) => {
    const { org_id, total_credits, monthly_limit } = req.body;
    if (!org_id || !total_credits) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const credit = {
      id: uuidv4(),
      org_id,
      total_credits,
      used_credits: 0,
      monthly_limit: monthly_limit || total_credits,
      reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    };
    aiCredits.push(credit);
    auditLogs.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      actor: 'admin@lapaas.com',
      action: 'allocate_credits',
      resource: org_id,
      status: 'success'
    });
    res.status(201).json({ success: true, message: 'AI credits allocated', data: credit });
  });

  app.get('/api/v1/admin/ai-credits/:org_id', (req, res) => {
    const { org_id } = req.params;
    const credit = aiCredits.find(c => c.org_id === org_id) || {
      org_id,
      total_credits: 10000,
      used_credits: 3500,
      remaining_credits: 6500,
      usage_percentage: 35
    };
    res.status(200).json({ success: true, data: credit });
  });

  app.put('/api/v1/admin/ai-credits/:org_id', (req, res) => {
    const { org_id } = req.params;
    const { total_credits, monthly_limit } = req.body;
    const updated = {
      org_id,
      total_credits: total_credits || 10000,
      monthly_limit: monthly_limit || 5000,
      updated_at: new Date().toISOString()
    };
    res.status(200).json({ success: true, message: 'AI credits updated', data: updated });
  });

  // ============================================
  // BILLING MANAGEMENT ENDPOINTS
  // ============================================

  app.post('/api/v1/admin/subscriptions', (req, res) => {
    const { org_id, plan, seats } = req.body;
    if (!org_id || !plan) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const subscription = {
      id: uuidv4(),
      org_id,
      plan,
      seats: seats || 3,
      status: 'active',
      start_date: new Date().toISOString(),
      next_renewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString()
    };
    subscriptions.push(subscription);
    auditLogs.push({
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      actor: 'admin@lapaas.com',
      action: 'create_subscription',
      resource: org_id,
      status: 'success'
    });
    res.status(201).json({ success: true, message: 'Subscription created', data: subscription });
  });

  app.get('/api/v1/admin/subscriptions/:org_id', (req, res) => {
    const { org_id } = req.params;
    const subscription = subscriptions.find(s => s.org_id === org_id) || {
      org_id,
      plan: 'pro',
      seats: 5,
      status: 'active'
    };
    res.status(200).json({ success: true, data: subscription });
  });

  app.post('/api/v1/admin/payments', (req, res) => {
    const { org_id, amount } = req.body;
    if (!org_id || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const payment = {
      id: uuidv4(),
      org_id,
      amount,
      currency: 'INR',
      status: 'completed',
      created_at: new Date().toISOString()
    };
    payments.push(payment);
    res.status(201).json({ success: true, message: 'Payment recorded', data: payment });
  });

  app.get('/api/v1/admin/payments/:org_id', (req, res) => {
    const { org_id } = req.params;
    const result = payments.filter(p => p.org_id === org_id);
    res.status(200).json({ success: true, data: result, total: result.length });
  });

  // ============================================
  // DASHBOARD ENDPOINTS
  // ============================================

  app.get('/api/v1/admin/dashboard/metrics', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        organizations: { total: 24, active: 22, growth_this_month: 3 },
        users: { total: 156, active: 142, growth_this_month: 18 },
        modules: { total: 10, active: 8, adoption_rate: 78 },
        revenue: { monthly: 125400, growth_this_month: 15, arr: 1504800 },
        subscriptions: { total: 18, free: 4, starter: 6, pro: 7, scale: 1 },
        ai_credits: { total_allocated: 150000, total_used: 52500, usage_percentage: 35 }
      }
    });
  });

  app.get('/api/v1/admin/dashboard/charts', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        module_adoption: [
          { module: 'Finance OS', adoption: 85, orgs: 15 },
          { module: 'Sales OS', adoption: 72, orgs: 12 },
          { module: 'Operations OS', adoption: 68, orgs: 10 },
          { module: 'People OS', adoption: 65, orgs: 9 },
          { module: 'Customer OS', adoption: 58, orgs: 8 }
        ],
        revenue_trend: [
          { month: 'Aug', revenue: 95000 },
          { month: 'Sep', revenue: 108000 },
          { month: 'Oct', revenue: 118000 },
          { month: 'Nov', revenue: 125400 }
        ]
      }
    });
  });

  // ============================================
  // REPORTING ENDPOINTS
  // ============================================

  app.get('/api/v1/admin/reports/organizations', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        title: 'Organization Report',
        organizations: [
          { id: 'org-001', name: 'TechStartup Inc', plan: 'pro', users: 5, monthly_spend: 7495 },
          { id: 'org-002', name: 'Manufacturing Co', plan: 'scale', users: 24, monthly_spend: 45000 }
        ],
        summary: { total_organizations: 24, total_revenue: 125400 }
      }
    });
  });

  app.get('/api/v1/admin/reports/modules', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        title: 'Module Adoption Report',
        modules: modules.map(m => ({ ...m, adoption_rate: 70, organizations: 10 })),
        summary: { average_adoption_rate: 70 }
      }
    });
  });

  app.get('/api/v1/admin/reports/ai-usage', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        title: 'AI Credit Usage Report',
        summary: { total_allocated: 150000, total_used: 52500, usage_percentage: 35 }
      }
    });
  });

  app.get('/api/v1/admin/reports/revenue', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        title: 'Revenue Report',
        summary: { monthly_revenue: 125400, annual_revenue: 1504800 }
      }
    });
  });

  // ============================================
  // SETTINGS ENDPOINTS
  // ============================================

  app.get('/api/v1/admin/settings', (req, res) => {
    res.status(200).json({
      success: true,
      data: {
        general: { platform_name: 'Lapaas OS', support_email: 'support@lapaas.com', timezone: 'Asia/Kolkata' },
        security: { two_factor_enabled: true, session_timeout_minutes: 30 },
        data_retention: { audit_logs_retention_days: 90, backup_retention_days: 365 }
      }
    });
  });

  app.put('/api/v1/admin/settings', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Admin settings updated',
      data: { updated_at: new Date().toISOString() }
    });
  });

  // ============================================
  // AUDIT LOGGING ENDPOINTS
  // ============================================

  app.get('/api/v1/admin/audit-logs', (req, res) => {
    res.status(200).json({
      success: true,
      data: auditLogs.slice(-10),
      total: auditLogs.length
    });
  });

  // ============================================
  // COLLECTIONS ENDPOINTS
  // ============================================

  app.post('/api/v1/admin/collections/policy', (req, res) => {
    const { org_id, credit_terms } = req.body;
    if (!org_id || !credit_terms) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const policy = {
      id: uuidv4(),
      org_id,
      credit_terms,
      late_fee_percentage: 2,
      dunning_ladder: [
        { day: 3, channel: 'email', template: 'friendly_reminder' },
        { day: 0, channel: 'whatsapp', template: 'payment_due' },
        { day: 7, channel: 'email', template: 'first_followup' },
        { day: 15, channel: 'whatsapp', template: 'urgent_reminder' }
      ],
      created_at: new Date().toISOString()
    };
    collectionsPolicies.push(policy);
    res.status(201).json({ success: true, message: 'Collections policy created', data: policy });
  });

  app.get('/api/v1/admin/collections/policy/:org_id', (req, res) => {
    const { org_id } = req.params;
    const policy = collectionsPolicies.find(p => p.org_id === org_id) || {
      org_id,
      credit_terms: 'Net 30',
      late_fee_percentage: 2,
      dunning_ladder: [
        { day: 3, channel: 'email', template: 'friendly_reminder', status: 'active' },
        { day: 0, channel: 'whatsapp', template: 'payment_due', status: 'active' },
        { day: 7, channel: 'email', template: 'first_followup', status: 'active' },
        { day: 15, channel: 'whatsapp', template: 'urgent_reminder', status: 'active' }
      ]
    };
    res.status(200).json({ success: true, data: policy });
  });

  app.post('/api/v1/admin/collections/templates', (req, res) => {
    const { org_id, name, channel, content } = req.body;
    if (!org_id || !name || !channel) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const template = {
      id: uuidv4(),
      org_id,
      name,
      channel,
      content,
      created_at: new Date().toISOString()
    };
    collectionsTemplates.push(template);
    res.status(201).json({ success: true, message: 'Collections template created', data: template });
  });

  app.get('/api/v1/admin/collections/templates/:org_id', (req, res) => {
    const { org_id } = req.params;
    const templates = collectionsTemplates.filter(t => t.org_id === org_id);
    const defaultTemplates = [
      { id: uuidv4(), org_id, name: 'Friendly Reminder', channel: 'email', status: 'active' },
      { id: uuidv4(), org_id, name: 'Payment Due', channel: 'whatsapp', status: 'active' },
      { id: uuidv4(), org_id, name: 'First Follow-up', channel: 'email', status: 'active' },
      { id: uuidv4(), org_id, name: 'Urgent Reminder', channel: 'whatsapp', status: 'active' }
    ];
    res.status(200).json({ success: true, data: templates.length > 0 ? templates : defaultTemplates, total: templates.length || 4 });
  });

  app.post('/api/v1/admin/collections/agent', (req, res) => {
    const { org_id, enabled, schedule } = req.body;
    if (!org_id) {
      return res.status(400).json({ error: 'Missing required field: org_id' });
    }
    const agent = {
      id: uuidv4(),
      org_id,
      enabled: enabled !== false,
      schedule: schedule || 'daily',
      status: 'active',
      created_at: new Date().toISOString()
    };
    collectionsAgents.push(agent);
    res.status(201).json({ success: true, message: 'Collections Agent configured', data: agent });
  });

  app.get('/api/v1/admin/collections/agent/:org_id', (req, res) => {
    const { org_id } = req.params;
    const agent = collectionsAgents.find(a => a.org_id === org_id) || {
      org_id,
      enabled: true,
      schedule: 'daily',
      status: 'active',
      reminders_sent_today: 45,
      reminders_sent_this_month: 892
    };
    res.status(200).json({ success: true, data: agent });
  });

  app.get('/api/v1/admin/collections/agent/:org_id/logs', (req, res) => {
    const { org_id } = req.params;
    const logs = [
      { id: uuidv4(), org_id, action: 'send_reminder', status: 'success', timestamp: new Date().toISOString() },
      { id: uuidv4(), org_id, action: 'send_reminder', status: 'success', timestamp: new Date().toISOString() }
    ];
    res.status(200).json({ success: true, data: logs, total: logs.length });
  });

  app.post('/api/v1/admin/collections/automations', (req, res) => {
    const { org_id, name, trigger, action } = req.body;
    if (!org_id || !name || !trigger || !action) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const automation = {
      id: uuidv4(),
      org_id,
      name,
      trigger,
      action,
      enabled: true,
      created_at: new Date().toISOString()
    };
    collectionsAutomations.push(automation);
    res.status(201).json({ success: true, message: 'Collections automation created', data: automation });
  });

  app.get('/api/v1/admin/collections/automations/:org_id', (req, res) => {
    const { org_id } = req.params;
    const automations = collectionsAutomations.filter(a => a.org_id === org_id);
    const defaultAutomations = [
      { id: uuidv4(), org_id, name: 'Send Reminder on Day 3', trigger: 'invoice_due_3_days', action: 'send_reminder', enabled: true, executions: 234 },
      { id: uuidv4(), org_id, name: 'Send WhatsApp on Due Date', trigger: 'invoice_due_today', action: 'send_reminder', enabled: true, executions: 189 },
      { id: uuidv4(), org_id, name: 'Escalate After 7 Days', trigger: 'invoice_overdue_7_days', action: 'escalate', enabled: true, executions: 45 },
      { id: uuidv4(), org_id, name: 'Urgent Reminder After 15 Days', trigger: 'invoice_overdue_15_days', action: 'send_reminder', enabled: true, executions: 12 }
    ];
    res.status(200).json({ success: true, data: automations.length > 0 ? automations : defaultAutomations, total: automations.length || 4 });
  });
};
