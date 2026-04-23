"use strict";
/**
 * Admin Routes - Week 10 MVP
 * Module Management, AI Credits, Billing Management
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const uuid_1 = require("uuid");
const router = (0, express_1.Router)();
// ============================================
// MODULE MANAGEMENT ENDPOINTS
// ============================================
/**
 * GET /api/v1/admin/modules
 * List all available modules
 */
router.get('/modules', (req, res) => {
    try {
        const modules = [
            {
                id: 'founder-os',
                code: 'FOUNDER_OS',
                name: 'Founder OS',
                track: 'Founder OS',
                price: 999,
                status: 'active',
                description: 'Personal productivity, meetings, interruption firewall'
            },
            {
                id: 'bms-planning',
                code: 'BMS_PLANNING',
                name: 'BMS & Planning',
                track: 'BMS & Planning',
                price: 1499,
                status: 'active',
                description: 'Scorecards, OKRs, AARs'
            },
            {
                id: 'finance-os',
                code: 'FINANCE_OS',
                name: 'Finance OS',
                track: 'Finance OS',
                price: 1999,
                status: 'active',
                description: 'Cashflow, Collections, Payables, Compliance'
            },
            {
                id: 'sales-os',
                code: 'SALES_OS',
                name: 'Sales OS',
                track: 'Sales OS',
                price: 1999,
                status: 'active',
                description: 'Pipeline, Funnel, Training, 10-year plan'
            },
            {
                id: 'marketing-os',
                code: 'MARKETING_OS',
                name: 'Marketing OS',
                track: 'Marketing OS',
                price: 1499,
                status: 'active',
                description: 'ICP/USP, Campaign P&L, Funnels'
            },
            {
                id: 'operations-os',
                code: 'OPERATIONS_OS',
                name: 'Operations OS',
                track: 'Operations OS',
                price: 1999,
                status: 'active',
                description: 'SOP Wiki, Quality, Vendor, Inventory'
            },
            {
                id: 'customer-os',
                code: 'CUSTOMER_OS',
                name: 'Customer OS',
                track: 'Customer OS',
                price: 1499,
                status: 'active',
                description: 'Helpdesk, Proactive CS, NPS'
            },
            {
                id: 'people-os',
                code: 'PEOPLE_OS',
                name: 'People OS',
                track: 'People OS',
                price: 1499,
                status: 'active',
                description: 'Hiring, Onboarding, KRAs, Rewards'
            },
            {
                id: 'automation-os',
                code: 'AUTOMATION_OS',
                name: 'Automation OS',
                track: 'Automation OS',
                price: 999,
                status: 'active',
                description: 'Workflow builder, Recipes'
            },
            {
                id: 'risk-data-os',
                code: 'RISK_DATA_OS',
                name: 'Risk & Data OS',
                track: 'Risk & Data OS',
                price: 1499,
                status: 'active',
                description: 'Risk Register, BCP/DR, Data Governance'
            }
        ];
        res.status(200).json({
            success: true,
            data: modules,
            total: modules.length
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to fetch modules',
            message: error.message
        });
    }
});
/**
 * POST /api/v1/admin/org-modules
 * Assign module to organization
 */
router.post('/org-modules', (req, res) => {
    try {
        const { org_id, module_id, seats, start_date, end_date } = req.body;
        if (!org_id || !module_id || !seats) {
            return res.status(400).json({
                error: 'Missing required fields: org_id, module_id, seats'
            });
        }
        const orgModule = {
            id: (0, uuid_1.v4)(),
            org_id,
            module_id,
            seats,
            start_date: start_date || new Date().toISOString(),
            end_date: end_date || null,
            status: 'active',
            created_at: new Date().toISOString()
        };
        res.status(201).json({
            success: true,
            message: 'Module assigned to organization',
            data: orgModule
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to assign module',
            message: error.message
        });
    }
});
/**
 * GET /api/v1/admin/org-modules/:org_id
 * Get modules assigned to organization
 */
router.get('/org-modules/:org_id', (req, res) => {
    try {
        const { org_id } = req.params;
        const orgModules = [
            {
                id: (0, uuid_1.v4)(),
                org_id,
                module_id: 'finance-os',
                module_name: 'Finance OS',
                seats: 5,
                status: 'active',
                start_date: new Date().toISOString(),
                end_date: null
            },
            {
                id: (0, uuid_1.v4)(),
                org_id,
                module_id: 'sales-os',
                module_name: 'Sales OS',
                seats: 10,
                status: 'active',
                start_date: new Date().toISOString(),
                end_date: null
            }
        ];
        res.status(200).json({
            success: true,
            data: orgModules,
            total: orgModules.length
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to fetch org modules',
            message: error.message
        });
    }
});
// ============================================
// AI CREDIT MANAGEMENT ENDPOINTS
// ============================================
/**
 * POST /api/v1/admin/ai-credits
 * Allocate AI credits to organization
 */
router.post('/ai-credits', (req, res) => {
    try {
        const { org_id, total_credits, monthly_limit } = req.body;
        if (!org_id || !total_credits) {
            return res.status(400).json({
                error: 'Missing required fields: org_id, total_credits'
            });
        }
        const aiCredit = {
            id: (0, uuid_1.v4)(),
            org_id,
            total_credits,
            used_credits: 0,
            monthly_limit: monthly_limit || total_credits,
            reset_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
        };
        res.status(201).json({
            success: true,
            message: 'AI credits allocated',
            data: aiCredit
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to allocate AI credits',
            message: error.message
        });
    }
});
/**
 * GET /api/v1/admin/ai-credits/:org_id
 * Get AI credit status for organization
 */
router.get('/ai-credits/:org_id', (req, res) => {
    try {
        const { org_id } = req.params;
        const aiCredit = {
            org_id,
            total_credits: 10000,
            used_credits: 3500,
            remaining_credits: 6500,
            monthly_limit: 5000,
            monthly_used: 2000,
            monthly_remaining: 3000,
            reset_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
            usage_percentage: 35
        };
        res.status(200).json({
            success: true,
            data: aiCredit
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to fetch AI credits',
            message: error.message
        });
    }
});
/**
 * PUT /api/v1/admin/ai-credits/:org_id
 * Update AI credits for organization
 */
router.put('/ai-credits/:org_id', (req, res) => {
    try {
        const { org_id } = req.params;
        const { total_credits, monthly_limit } = req.body;
        const updated = {
            org_id,
            total_credits: total_credits || 10000,
            monthly_limit: monthly_limit || 5000,
            updated_at: new Date().toISOString()
        };
        res.status(200).json({
            success: true,
            message: 'AI credits updated',
            data: updated
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to update AI credits',
            message: error.message
        });
    }
});
// ============================================
// BILLING MANAGEMENT ENDPOINTS
// ============================================
/**
 * POST /api/v1/admin/subscriptions
 * Create subscription for organization
 */
router.post('/subscriptions', (req, res) => {
    try {
        const { org_id, plan, billing_provider, seats } = req.body;
        if (!org_id || !plan) {
            return res.status(400).json({
                error: 'Missing required fields: org_id, plan'
            });
        }
        const subscription = {
            id: (0, uuid_1.v4)(),
            org_id,
            plan, // 'free', 'starter', 'pro', 'scale'
            seats: seats || 3,
            status: 'active',
            billing_provider: billing_provider || 'razorpay',
            start_date: new Date().toISOString(),
            next_renewal: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            created_at: new Date().toISOString()
        };
        res.status(201).json({
            success: true,
            message: 'Subscription created',
            data: subscription
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to create subscription',
            message: error.message
        });
    }
});
/**
 * GET /api/v1/admin/subscriptions/:org_id
 * Get subscription for organization
 */
router.get('/subscriptions/:org_id', (req, res) => {
    try {
        const { org_id } = req.params;
        const subscription = {
            id: (0, uuid_1.v4)(),
            org_id,
            plan: 'pro',
            seats: 5,
            status: 'active',
            billing_provider: 'razorpay',
            monthly_amount: 7495,
            start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            next_renewal: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString()
        };
        res.status(200).json({
            success: true,
            data: subscription
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to fetch subscription',
            message: error.message
        });
    }
});
/**
 * POST /api/v1/admin/payments
 * Record payment for organization
 */
router.post('/payments', (req, res) => {
    try {
        const { org_id, amount, currency, payment_method } = req.body;
        if (!org_id || !amount) {
            return res.status(400).json({
                error: 'Missing required fields: org_id, amount'
            });
        }
        const payment = {
            id: (0, uuid_1.v4)(),
            org_id,
            amount,
            currency: currency || 'INR',
            payment_method: payment_method || 'razorpay',
            status: 'completed',
            transaction_id: `TXN_${Date.now()}`,
            created_at: new Date().toISOString()
        };
        res.status(201).json({
            success: true,
            message: 'Payment recorded',
            data: payment
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to record payment',
            message: error.message
        });
    }
});
/**
 * GET /api/v1/admin/payments/:org_id
 * Get payment history for organization
 */
router.get('/payments/:org_id', (req, res) => {
    try {
        const { org_id } = req.params;
        const { page = 1, limit = 10 } = req.query;
        const payments = [
            {
                id: (0, uuid_1.v4)(),
                org_id,
                amount: 7495,
                currency: 'INR',
                status: 'completed',
                date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            },
            {
                id: (0, uuid_1.v4)(),
                org_id,
                amount: 7495,
                currency: 'INR',
                status: 'completed',
                date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
            }
        ];
        res.status(200).json({
            success: true,
            data: payments,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: payments.length
            }
        });
    }
    catch (error) {
        res.status(500).json({
            error: 'Failed to fetch payments',
            message: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map