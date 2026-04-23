/**
 * Admin Plans Routes - Enhanced with Modules, Duration, and Credits
 */

const { v4: uuidv4 } = require('uuid');

// In-memory storage
const plans = [];
const users = [];
const userPlans = [];

module.exports = (app) => {
  // ============================================
  // PLANS ENDPOINTS - ENHANCED
  // ============================================

  /**
   * POST /api/v1/admin/plans
   * Create a new subscription plan
   */
  app.post('/api/v1/admin/plans', (req, res) => {
    try {
      const { name, price, seats, modules, duration, credits, features } = req.body;

      if (!name || !price || !modules || !duration || credits === undefined) {
        return res.status(400).json({
          error: 'Missing required fields: name, price, modules, duration, credits'
        });
      }

      const plan = {
        id: uuidv4(),
        name,
        price,
        seats: seats || 3,
        modules, // Array of module IDs
        duration, // Days (30, 90, 365)
        credits, // AI credits per month
        features: features || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      plans.push(plan);

      res.status(201).json({
        success: true,
        message: 'Plan created successfully',
        data: plan
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to create plan',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/admin/plans
   * Get all subscription plans
   */
  app.get('/api/v1/admin/plans', (req, res) => {
    try {
      const defaultPlans = [
        {
          id: '1',
          name: 'Starter',
          price: 1499,
          seats: 3,
          modules: ['finance-os', 'sales-os'],
          duration: 30,
          credits: 1000,
          features: ['Basic analytics', 'Email support', '1 team'],
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Professional',
          price: 7495,
          seats: 10,
          modules: ['finance-os', 'sales-os', 'operations-os', 'people-os'],
          duration: 30,
          credits: 5000,
          features: ['Advanced analytics', 'Priority support', '5 teams', 'Custom integrations'],
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Enterprise',
          price: 45000,
          seats: 50,
          modules: ['finance-os', 'sales-os', 'operations-os', 'people-os', 'customer-os', 'automation-os'],
          duration: 365,
          credits: 50000,
          features: ['Full analytics', '24/7 support', 'Unlimited teams', 'Custom integrations', 'Dedicated account manager'],
          created_at: new Date().toISOString()
        }
      ];

      const allPlans = plans.length > 0 ? plans : defaultPlans;

      res.status(200).json({
        success: true,
        data: allPlans,
        total: allPlans.length
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch plans',
        message: error.message
      });
    }
  });

  /**
   * PUT /api/v1/admin/plans/:plan_id
   * Update a subscription plan
   */
  app.put('/api/v1/admin/plans/:plan_id', (req, res) => {
    try {
      const { plan_id } = req.params;
      const { name, price, seats, modules, duration, credits, features } = req.body;

      const plan = plans.find(p => p.id === plan_id);
      if (!plan) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      plan.name = name || plan.name;
      plan.price = price || plan.price;
      plan.seats = seats || plan.seats;
      plan.modules = modules || plan.modules;
      plan.duration = duration || plan.duration;
      plan.credits = credits !== undefined ? credits : plan.credits;
      plan.features = features || plan.features;
      plan.updated_at = new Date().toISOString();

      res.status(200).json({
        success: true,
        message: 'Plan updated successfully',
        data: plan
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to update plan',
        message: error.message
      });
    }
  });

  /**
   * DELETE /api/v1/admin/plans/:plan_id
   * Delete a subscription plan
   */
  app.delete('/api/v1/admin/plans/:plan_id', (req, res) => {
    try {
      const { plan_id } = req.params;
      const index = plans.findIndex(p => p.id === plan_id);

      if (index === -1) {
        return res.status(404).json({ error: 'Plan not found' });
      }

      const deletedPlan = plans.splice(index, 1);

      res.status(200).json({
        success: true,
        message: 'Plan deleted successfully',
        data: deletedPlan[0]
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to delete plan',
        message: error.message
      });
    }
  });

  // ============================================
  // USER MANAGEMENT ENDPOINTS
  // ============================================

  /**
   * GET /api/v1/admin/users
   * Get all users
   */
  app.get('/api/v1/admin/users', (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const defaultUsers = [
        {
          id: uuidv4(),
          email: 'admin@test.com',
          name: 'Admin User',
          role: 'admin',
          organization: 'TechStartup Inc',
          status: 'active',
          created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          last_login: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
          id: uuidv4(),
          email: 'user@techstartup.com',
          name: 'John Doe',
          role: 'user',
          organization: 'TechStartup Inc',
          status: 'active',
          created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          last_login: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
        },
        {
          id: uuidv4(),
          email: 'manager@manufacturing.com',
          name: 'Jane Smith',
          role: 'manager',
          organization: 'Manufacturing Co',
          status: 'active',
          created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
          last_login: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
          id: uuidv4(),
          email: 'inactive@service.com',
          name: 'Bob Wilson',
          role: 'user',
          organization: 'Service Agency',
          status: 'inactive',
          created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
          last_login: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const allUsers = users.length > 0 ? users : defaultUsers;
      const start = (page - 1) * limit;
      const paginatedUsers = allUsers.slice(start, start + limit);

      res.status(200).json({
        success: true,
        data: paginatedUsers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: allUsers.length,
          pages: Math.ceil(allUsers.length / limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch users',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/admin/users/:user_id
   * Get user details
   */
  app.get('/api/v1/admin/users/:user_id', (req, res) => {
    try {
      const { user_id } = req.params;

      const user = users.find(u => u.id === user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch user',
        message: error.message
      });
    }
  });

  /**
   * PUT /api/v1/admin/users/:user_id
   * Update user
   */
  app.put('/api/v1/admin/users/:user_id', (req, res) => {
    try {
      const { user_id } = req.params;
      const { role, status } = req.body;

      const user = users.find(u => u.id === user_id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (role) user.role = role;
      if (status) user.status = status;
      user.updated_at = new Date().toISOString();

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to update user',
        message: error.message
      });
    }
  });

  /**
   * DELETE /api/v1/admin/users/:user_id
   * Delete user
   */
  app.delete('/api/v1/admin/users/:user_id', (req, res) => {
    try {
      const { user_id } = req.params;
      const index = users.findIndex(u => u.id === user_id);

      if (index === -1) {
        return res.status(404).json({ error: 'User not found' });
      }

      const deletedUser = users.splice(index, 1);

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: deletedUser[0]
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to delete user',
        message: error.message
      });
    }
  });

  // ============================================
  // ANALYTICS ENDPOINTS
  // ============================================

  /**
   * GET /api/v1/admin/analytics/overview
   * Get detailed analytics overview
   */
  app.get('/api/v1/admin/analytics/overview', (req, res) => {
    try {
      const analytics = {
        summary: {
          total_organizations: 24,
          total_users: 156,
          active_users: 142,
          inactive_users: 14,
          total_revenue: 125400,
          monthly_revenue: 125400,
          annual_revenue: 1504800,
          average_customer_value: 5225,
          churn_rate: 2.5,
          growth_rate: 15.3
        },
        user_metrics: {
          new_users_this_month: 18,
          active_users_today: 89,
          active_users_this_week: 125,
          active_users_this_month: 142,
          user_retention_rate: 97.5
        },
        revenue_metrics: {
          mrr: 125400,
          arr: 1504800,
          revenue_growth_mom: 15,
          revenue_growth_yoy: 45,
          average_plan_value: 6970
        },
        module_metrics: {
          total_modules: 10,
          active_modules: 8,
          module_adoption_rate: 78,
          most_used_module: 'Finance OS',
          least_used_module: 'Risk & Data OS'
        },
        plan_metrics: {
          free_plans: 4,
          starter_plans: 6,
          professional_plans: 7,
          enterprise_plans: 1,
          plan_distribution: {
            free: 22,
            starter: 33,
            professional: 39,
            enterprise: 6
          }
        },
        ai_metrics: {
          total_credits_allocated: 150000,
          total_credits_used: 52500,
          credits_usage_percentage: 35,
          monthly_credits_limit: 5000,
          monthly_credits_used: 2000,
          average_credits_per_user: 336
        }
      };

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch analytics',
        message: error.message
      });
    }
  });

  /**
   * GET /api/v1/admin/analytics/trends
   * Get analytics trends
   */
  app.get('/api/v1/admin/analytics/trends', (req, res) => {
    try {
      const trends = {
        revenue_trend: [
          { month: 'August', revenue: 95000, growth: 0 },
          { month: 'September', revenue: 108000, growth: 13.7 },
          { month: 'October', revenue: 118000, growth: 9.3 },
          { month: 'November', revenue: 125400, growth: 6.3 }
        ],
        user_trend: [
          { week: 'Week 1', users: 120, new_users: 5 },
          { week: 'Week 2', users: 132, new_users: 12 },
          { week: 'Week 3', users: 145, new_users: 13 },
          { week: 'Week 4', users: 156, new_users: 11 }
        ],
        module_adoption_trend: [
          { module: 'Finance OS', adoption: 85, trend: 'up' },
          { module: 'Sales OS', adoption: 72, trend: 'up' },
          { module: 'Operations OS', adoption: 68, trend: 'stable' },
          { module: 'People OS', adoption: 65, trend: 'up' },
          { module: 'Customer OS', adoption: 58, trend: 'down' }
        ],
        ai_credits_trend: [
          { date: '2025-11-01', used: 1200, remaining: 3800 },
          { date: '2025-11-04', used: 1500, remaining: 3500 },
          { date: '2025-11-07', used: 1800, remaining: 3200 },
          { date: '2025-11-08', used: 2000, remaining: 3000 }
        ]
      };

      res.status(200).json({
        success: true,
        data: trends
      });
    } catch (error) {
      res.status(500).json({
        error: 'Failed to fetch trends',
        message: error.message
      });
    }
  });
};
