/**
 * Admin Reporting Routes - Week 12 MVP
 * Dashboard, Reporting, Settings, Governance
 */

import express, { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// ============================================
// ADMIN DASHBOARD ENDPOINTS
// ============================================

/**
 * GET /api/v1/admin/dashboard/metrics
 * Get comprehensive dashboard metrics
 */
router.get('/dashboard/metrics', (req: Request, res: Response) => {
  try {
    const metrics = {
      organizations: {
        total: 24,
        active: 22,
        inactive: 2,
        growth_this_month: 3
      },
      users: {
        total: 156,
        active: 142,
        inactive: 14,
        growth_this_month: 18
      },
      modules: {
        total: 10,
        active: 8,
        adoption_rate: 78,
        most_popular: 'Finance OS'
      },
      revenue: {
        monthly: 125400,
        growth_this_month: 15,
        mrr: 125400,
        arr: 1504800
      },
      subscriptions: {
        total: 18,
        free: 4,
        starter: 6,
        pro: 7,
        scale: 1
      },
      ai_credits: {
        total_allocated: 150000,
        total_used: 52500,
        usage_percentage: 35,
        monthly_reset: 5000
      }
    };

    res.status(200).json({
      success: true,
      data: metrics
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch dashboard metrics',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/admin/dashboard/charts
 * Get chart data for dashboard
 */
router.get('/dashboard/charts', (req: Request, res: Response) => {
  try {
    const charts = {
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
      ],
      user_growth: [
        { week: 'Week 1', users: 120 },
        { week: 'Week 2', users: 132 },
        { week: 'Week 3', users: 145 },
        { week: 'Week 4', users: 156 }
      ],
      subscription_distribution: [
        { plan: 'Free', count: 4, percentage: 22 },
        { plan: 'Starter', count: 6, percentage: 33 },
        { plan: 'Pro', count: 7, percentage: 39 },
        { plan: 'Scale', count: 1, percentage: 6 }
      ]
    };

    res.status(200).json({
      success: true,
      data: charts
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch chart data',
      message: error.message
    });
  }
});

// ============================================
// REPORTING ENDPOINTS
// ============================================

/**
 * GET /api/v1/admin/reports/organizations
 * Generate organization report
 */
router.get('/reports/organizations', (req: Request, res: Response) => {
  try {
    const { start_date, end_date, format = 'json' } = req.query;

    const report = {
      title: 'Organization Report',
      period: `${start_date || 'All time'}`,
      generated_at: new Date().toISOString(),
      organizations: [
        {
          id: 'org-001',
          name: 'TechStartup Inc',
          plan: 'pro',
          seats: 5,
          modules: 3,
          users: 5,
          monthly_spend: 7495,
          ai_credits_used: 2500,
          status: 'active',
          joined_date: '2025-09-15'
        },
        {
          id: 'org-002',
          name: 'Manufacturing Co',
          plan: 'scale',
          seats: 25,
          modules: 8,
          users: 24,
          monthly_spend: 45000,
          ai_credits_used: 8000,
          status: 'active',
          joined_date: '2025-08-20'
        },
        {
          id: 'org-003',
          name: 'Service Agency',
          plan: 'starter',
          seats: 3,
          modules: 1,
          users: 3,
          monthly_spend: 1499,
          ai_credits_used: 500,
          status: 'active',
          joined_date: '2025-10-01'
        }
      ],
      summary: {
        total_organizations: 24,
        total_users: 156,
        total_revenue: 125400,
        average_monthly_spend: 6970
      }
    };

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to generate organization report',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/admin/reports/modules
 * Generate module adoption report
 */
router.get('/reports/modules', (req: Request, res: Response) => {
  try {
    const report = {
      title: 'Module Adoption Report',
      generated_at: new Date().toISOString(),
      modules: [
        {
          id: 'finance-os',
          name: 'Finance OS',
          adoption_rate: 85,
          organizations: 15,
          users: 45,
          ai_credits_used: 12000,
          revenue_generated: 29925
        },
        {
          id: 'sales-os',
          name: 'Sales OS',
          adoption_rate: 72,
          organizations: 12,
          users: 36,
          ai_credits_used: 8500,
          revenue_generated: 23940
        },
        {
          id: 'operations-os',
          name: 'Operations OS',
          adoption_rate: 68,
          organizations: 10,
          users: 30,
          ai_credits_used: 7000,
          revenue_generated: 19950
        },
        {
          id: 'people-os',
          name: 'People OS',
          adoption_rate: 65,
          organizations: 9,
          users: 27,
          ai_credits_used: 6000,
          revenue_generated: 17955
        },
        {
          id: 'customer-os',
          name: 'Customer OS',
          adoption_rate: 58,
          organizations: 8,
          users: 24,
          ai_credits_used: 5000,
          revenue_generated: 15960
        }
      ],
      summary: {
        average_adoption_rate: 70,
        total_organizations_with_modules: 24,
        total_users_using_modules: 156,
        total_ai_credits_used: 38500
      }
    };

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to generate module report',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/admin/reports/ai-usage
 * Generate AI credit usage report
 */
router.get('/reports/ai-usage', (req: Request, res: Response) => {
  try {
    const report = {
      title: 'AI Credit Usage Report',
      generated_at: new Date().toISOString(),
      summary: {
        total_allocated: 150000,
        total_used: 52500,
        usage_percentage: 35,
        remaining: 97500,
        monthly_limit: 5000,
        monthly_used: 2000
      },
      top_users: [
        {
          org_id: 'org-002',
          org_name: 'Manufacturing Co',
          credits_used: 8000,
          percentage: 15.2
        },
        {
          org_id: 'org-001',
          org_name: 'TechStartup Inc',
          credits_used: 2500,
          percentage: 4.8
        },
        {
          org_id: 'org-003',
          org_name: 'Service Agency',
          credits_used: 500,
          percentage: 1.0
        }
      ],
      usage_by_feature: [
        { feature: 'Collections Copilot', usage: 15000 },
        { feature: 'Finance Copilot', usage: 12000 },
        { feature: 'Sales Copilot', usage: 10000 },
        { feature: 'HR Copilot', usage: 8000 },
        { feature: 'Ops Copilot', usage: 7500 }
      ]
    };

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to generate AI usage report',
      message: error.message
    });
  }
});

/**
 * GET /api/v1/admin/reports/revenue
 * Generate revenue report
 */
router.get('/reports/revenue', (req: Request, res: Response) => {
  try {
    const report = {
      title: 'Revenue Report',
      generated_at: new Date().toISOString(),
      summary: {
        monthly_revenue: 125400,
        monthly_growth: 15,
        annual_revenue: 1504800,
        average_customer_value: 5225
      },
      by_plan: [
        { plan: 'Free', count: 4, revenue: 0, percentage: 0 },
        { plan: 'Starter', count: 6, revenue: 8994, percentage: 7.2 },
        { plan: 'Pro', count: 7, revenue: 104965, percentage: 83.6 },
        { plan: 'Scale', count: 1, revenue: 11441, percentage: 9.1 }
      ],
      revenue_trend: [
        { month: 'August', revenue: 95000, growth: 0 },
        { month: 'September', revenue: 108000, growth: 13.7 },
        { month: 'October', revenue: 118000, growth: 9.3 },
        { month: 'November', revenue: 125400, growth: 6.3 }
      ]
    };

    res.status(200).json({
      success: true,
      data: report
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to generate revenue report',
      message: error.message
    });
  }
});

// ============================================
// ADMIN SETTINGS ENDPOINTS
// ============================================

/**
 * GET /api/v1/admin/settings
 * Get admin settings
 */
router.get('/settings', (req: Request, res: Response) => {
  try {
    const settings = {
      general: {
        platform_name: 'Lapaas OS',
        support_email: 'support@lapaas.com',
        timezone: 'Asia/Kolkata'
      },
      data_retention: {
        audit_logs_retention_days: 90,
        deleted_data_retention_days: 30,
        backup_retention_days: 365
      },
      security: {
        password_min_length: 8,
        password_require_uppercase: true,
        password_require_numbers: true,
        password_require_special: true,
        session_timeout_minutes: 30,
        two_factor_enabled: true
      },
      email: {
        smtp_host: 'smtp.gmail.com',
        smtp_port: 587,
        from_email: 'noreply@lapaas.com',
        from_name: 'Lapaas OS'
      },
      billing: {
        currency: 'INR',
        billing_day: 1,
        payment_provider: 'razorpay'
      }
    };

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch admin settings',
      message: error.message
    });
  }
});

/**
 * PUT /api/v1/admin/settings
 * Update admin settings
 */
router.put('/settings', (req: Request, res: Response) => {
  try {
    const { general, data_retention, security, email, billing } = req.body;

    const updated = {
      general: general || {},
      data_retention: data_retention || {},
      security: security || {},
      email: email || {},
      billing: billing || {},
      updated_at: new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      message: 'Admin settings updated',
      data: updated
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to update admin settings',
      message: error.message
    });
  }
});

// ============================================
// AUDIT LOGGING ENDPOINTS
// ============================================

/**
 * GET /api/v1/admin/audit-logs
 * Get audit logs
 */
router.get('/audit-logs', (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 20, action, actor } = req.query;

    const logs = [
      {
        id: uuidv4(),
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        actor: 'admin@lapaas.com',
        action: 'create_organization',
        resource: 'Organization',
        resource_id: 'org-024',
        details: 'Created new organization: TechStartup Inc',
        status: 'success'
      },
      {
        id: uuidv4(),
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        actor: 'admin@lapaas.com',
        action: 'assign_module',
        resource: 'Module',
        resource_id: 'finance-os',
        details: 'Assigned Finance OS to org-024',
        status: 'success'
      },
      {
        id: uuidv4(),
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        actor: 'admin@lapaas.com',
        action: 'allocate_credits',
        resource: 'AI Credits',
        resource_id: 'org-024',
        details: 'Allocated 5000 AI credits to org-024',
        status: 'success'
      },
      {
        id: uuidv4(),
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        actor: 'admin@lapaas.com',
        action: 'create_subscription',
        resource: 'Subscription',
        resource_id: 'sub-024',
        details: 'Created Pro subscription for org-024',
        status: 'success'
      }
    ];

    res.status(200).json({
      success: true,
      data: logs,
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total: logs.length
      }
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Failed to fetch audit logs',
      message: error.message
    });
  }
});

export default router;
