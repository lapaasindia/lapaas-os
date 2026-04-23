"use strict";
/**
 * Collections Admin Routes - Week 11 MVP
 * Collections Configuration, Agent Setup, Automation
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
// ============================================
// COLLECTIONS CONFIGURATION ENDPOINTS
// ============================================
/**
 * POST /api/v1/admin/collections/policy
 * Create/Update collections policy for organization
 */
router.post('/policy', (req, res) => {
    try {
        const { org_id, credit_terms, late_fee_percentage, escalation_days } = req.body;
        if (!org_id || !credit_terms) {
            return res.status(400).json({
                error: 'Missing required fields: org_id, credit_terms'
            });
        }
        const policy = {
            id: (0, uuid_1.v4)(),
            org_id,
            credit_terms, // e.g., "Net 30", "Net 60", "Net 90"
            late_fee_percentage: late_fee_percentage || 2,
            escalation_days: escalation_days || 30,
            dunning_ladder: [
                { day: 3, channel: 'email', template: 'friendly_reminder' },
                { day: 0, channel: 'whatsapp', template: 'payment_due' },
                { day: 7, channel: 'email', template: 'first_followup' },
                { day: 15, channel: 'whatsapp', template: 'urgent_reminder' }
            ],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        res.status(201).json({
            success: true,
            message: 'Collections policy created',
            data: policy
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to create collections policy',
            message: error.message
        });
    }
});
/**
 * GET /api/v1/admin/collections/policy/:org_id
 * Get collections policy for organization
 */
router.get('/policy/:org_id', (req, res) => {
    try {
        const { org_id } = req.params;
        const policy = {
            id: (0, uuid_1.v4)(),
            org_id,
            credit_terms: 'Net 30',
            late_fee_percentage: 2,
            escalation_days: 30,
            dunning_ladder: [
                { day: 3, channel: 'email', template: 'friendly_reminder', status: 'active' },
                { day: 0, channel: 'whatsapp', template: 'payment_due', status: 'active' },
                { day: 7, channel: 'email', template: 'first_followup', status: 'active' },
                { day: 15, channel: 'whatsapp', template: 'urgent_reminder', status: 'active' }
            ],
            created_at: new Date().toISOString()
        };
        res.status(200).json({
            success: true,
            data: policy
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to fetch collections policy',
            message: error.message
        });
    }
});
// ============================================
// COLLECTIONS TEMPLATES ENDPOINTS
// ============================================
/**
 * POST /api/v1/admin/collections/templates
 * Create collections template
 */
router.post('/templates', (req, res) => {
    try {
        const { org_id, name, channel, content, variables } = req.body;
        if (!org_id || !name || !channel) {
            return res.status(400).json({
                error: 'Missing required fields: org_id, name, channel'
            });
        }
        const template = {
            id: (0, uuid_1.v4)(),
            org_id,
            name,
            channel, // 'email', 'whatsapp', 'sms'
            content,
            variables: variables || ['{{invoice_id}}', '{{amount}}', '{{due_date}}', '{{customer_name}}'],
            created_at: new Date().toISOString()
        };
        res.status(201).json({
            success: true,
            message: 'Collections template created',
            data: template
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to create collections template',
            message: error.message
        });
    }
});
/**
 * GET /api/v1/admin/collections/templates/:org_id
 * Get collections templates for organization
 */
router.get('/templates/:org_id', (req, res) => {
    try {
        const { org_id } = req.params;
        const templates = [
            {
                id: (0, uuid_1.v4)(),
                org_id,
                name: 'Friendly Reminder',
                channel: 'email',
                content: 'Hi {{customer_name}}, gentle reminder that invoice {{invoice_id}} for {{amount}} is due on {{due_date}}.',
                status: 'active'
            },
            {
                id: (0, uuid_1.v4)(),
                org_id,
                name: 'Payment Due',
                channel: 'whatsapp',
                content: 'Payment due today for invoice {{invoice_id}}: {{amount}}. Please pay by {{due_date}}.',
                status: 'active'
            },
            {
                id: (0, uuid_1.v4)(),
                org_id,
                name: 'First Follow-up',
                channel: 'email',
                content: 'Invoice {{invoice_id}} ({{amount}}) is now overdue. Please arrange payment immediately.',
                status: 'active'
            },
            {
                id: (0, uuid_1.v4)(),
                org_id,
                name: 'Urgent Reminder',
                channel: 'whatsapp',
                content: 'URGENT: Invoice {{invoice_id}} is {{days_overdue}} days overdue. Amount: {{amount}}. Please pay now.',
                status: 'active'
            }
        ];
        res.status(200).json({
            success: true,
            data: templates,
            total: templates.length
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to fetch collections templates',
            message: error.message
        });
    }
});
// ============================================
// COLLECTIONS AGENT ENDPOINTS
// ============================================
/**
 * POST /api/v1/admin/collections/agent
 * Configure Collections Agent
 */
router.post('/agent', (req, res) => {
    try {
        const { org_id, enabled, schedule, rules } = req.body;
        if (!org_id) {
            return res.status(400).json({
                error: 'Missing required field: org_id'
            });
        }
        const agent = {
            id: (0, uuid_1.v4)(),
            org_id,
            enabled: enabled !== false,
            schedule: schedule || 'daily', // 'daily', 'weekly', 'custom'
            rules: rules || {
                auto_send_reminders: true,
                escalation_enabled: true,
                max_reminders_per_invoice: 4,
                respect_opt_out: true
            },
            status: 'active',
            created_at: new Date().toISOString()
        };
        res.status(201).json({
            success: true,
            message: 'Collections Agent configured',
            data: agent
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to configure Collections Agent',
            message: error.message
        });
    }
});
/**
 * GET /api/v1/admin/collections/agent/:org_id
 * Get Collections Agent configuration
 */
router.get('/agent/:org_id', (req, res) => {
    try {
        const { org_id } = req.params;
        const agent = {
            id: (0, uuid_1.v4)(),
            org_id,
            enabled: true,
            schedule: 'daily',
            rules: {
                auto_send_reminders: true,
                escalation_enabled: true,
                max_reminders_per_invoice: 4,
                respect_opt_out: true
            },
            status: 'active',
            last_run: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            next_run: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
            reminders_sent_today: 45,
            reminders_sent_this_month: 892
        };
        res.status(200).json({
            success: true,
            data: agent
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to fetch Collections Agent configuration',
            message: error.message
        });
    }
});
/**
 * GET /api/v1/admin/collections/agent/:org_id/logs
 * Get Collections Agent execution logs
 */
router.get('/agent/:org_id/logs', (req, res) => {
    try {
        const { org_id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const logs = [
            {
                id: (0, uuid_1.v4)(),
                org_id,
                action: 'send_reminder',
                invoice_id: 'INV-001',
                customer: 'Acme Corp',
                channel: 'whatsapp',
                status: 'success',
                timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
            },
            {
                id: (0, uuid_1.v4)(),
                org_id,
                action: 'send_reminder',
                invoice_id: 'INV-002',
                customer: 'Tech Solutions',
                channel: 'email',
                status: 'success',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                id: (0, uuid_1.v4)(),
                org_id,
                action: 'escalate',
                invoice_id: 'INV-003',
                customer: 'Global Industries',
                channel: 'whatsapp',
                status: 'success',
                timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
            }
        ];
        res.status(200).json({
            success: true,
            data: logs,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: logs.length
            }
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to fetch Collections Agent logs',
            message: error.message
        });
    }
});
// ============================================
// COLLECTIONS AUTOMATION ENDPOINTS
// ============================================
/**
 * POST /api/v1/admin/collections/automations
 * Create collections automation
 */
router.post('/automations', (req, res) => {
    try {
        const { org_id, name, trigger, action, enabled } = req.body;
        if (!org_id || !name || !trigger || !action) {
            return res.status(400).json({
                error: 'Missing required fields: org_id, name, trigger, action'
            });
        }
        const automation = {
            id: (0, uuid_1.v4)(),
            org_id,
            name,
            trigger, // 'invoice_due', 'invoice_overdue', 'payment_received'
            action, // 'send_reminder', 'escalate', 'create_task'
            enabled: enabled !== false,
            created_at: new Date().toISOString()
        };
        res.status(201).json({
            success: true,
            message: 'Collections automation created',
            data: automation
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to create collections automation',
            message: error.message
        });
    }
});
/**
 * GET /api/v1/admin/collections/automations/:org_id
 * Get collections automations for organization
 */
router.get('/automations/:org_id', (req, res) => {
    try {
        const { org_id } = req.params;
        const automations = [
            {
                id: (0, uuid_1.v4)(),
                org_id,
                name: 'Send Reminder on Day 3',
                trigger: 'invoice_due_3_days',
                action: 'send_reminder',
                template: 'friendly_reminder',
                channel: 'email',
                enabled: true,
                executions: 234
            },
            {
                id: (0, uuid_1.v4)(),
                org_id,
                name: 'Send WhatsApp on Due Date',
                trigger: 'invoice_due_today',
                action: 'send_reminder',
                template: 'payment_due',
                channel: 'whatsapp',
                enabled: true,
                executions: 189
            },
            {
                id: (0, uuid_1.v4)(),
                org_id,
                name: 'Escalate After 7 Days',
                trigger: 'invoice_overdue_7_days',
                action: 'escalate',
                template: 'first_followup',
                channel: 'email',
                enabled: true,
                executions: 45
            },
            {
                id: (0, uuid_1.v4)(),
                org_id,
                name: 'Urgent Reminder After 15 Days',
                trigger: 'invoice_overdue_15_days',
                action: 'send_reminder',
                template: 'urgent_reminder',
                channel: 'whatsapp',
                enabled: true,
                executions: 12
            }
        ];
        res.status(200).json({
            success: true,
            data: automations,
            total: automations.length
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to fetch collections automations',
            message: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=collectionsAdmin.js.map