// Billing & Subscription Module Routes
// Includes: Plans, Subscriptions, Invoices, Payments, Refunds

const billingDatabase = {
  plans: [
    {
      id: 'plan-001',
      name: 'Starter',
      description: 'Perfect for getting started',
      price: 29,
      billing_cycle: 'monthly',
      features: ['Up to 1,000 users', '5GB storage', 'Email support', 'Basic analytics'],
      stripe_id: 'price_starter_monthly',
      status: 'active',
      created_at: '2025-01-01'
    },
    {
      id: 'plan-002',
      name: 'Professional',
      description: 'For growing teams',
      price: 99,
      billing_cycle: 'monthly',
      features: ['Up to 10,000 users', '100GB storage', 'Priority support', 'Advanced analytics', 'Custom integrations'],
      stripe_id: 'price_pro_monthly',
      status: 'active',
      created_at: '2025-01-01'
    },
    {
      id: 'plan-003',
      name: 'Enterprise',
      description: 'For large organizations',
      price: 299,
      billing_cycle: 'monthly',
      features: ['Unlimited users', 'Unlimited storage', '24/7 support', 'Custom analytics', 'Dedicated account manager'],
      stripe_id: 'price_enterprise_monthly',
      status: 'active',
      created_at: '2025-01-01'
    }
  ],

  subscriptions: [
    {
      id: 'sub-001',
      org_id: 'org-001',
      plan_id: 'plan-002',
      plan_name: 'Professional',
      status: 'active',
      current_period_start: '2025-11-01',
      current_period_end: '2025-12-01',
      amount: 99,
      currency: 'USD',
      billing_cycle: 'monthly',
      auto_renew: true,
      stripe_subscription_id: 'sub_stripe_001',
      created_at: '2025-11-01'
    },
    {
      id: 'sub-002',
      org_id: 'org-002',
      plan_id: 'plan-001',
      plan_name: 'Starter',
      status: 'active',
      current_period_start: '2025-10-15',
      current_period_end: '2025-11-15',
      amount: 29,
      currency: 'USD',
      billing_cycle: 'monthly',
      auto_renew: true,
      stripe_subscription_id: 'sub_stripe_002',
      created_at: '2025-10-15'
    }
  ],

  invoices: [
    {
      id: 'inv-001',
      org_id: 'org-001',
      subscription_id: 'sub-001',
      amount: 99,
      currency: 'USD',
      status: 'paid',
      issue_date: '2025-11-01',
      due_date: '2025-11-15',
      paid_date: '2025-11-02',
      description: 'Professional Plan - Monthly',
      invoice_number: 'INV-2025-001',
      stripe_invoice_id: 'in_stripe_001',
      pdf_url: 'https://example.com/invoices/inv-001.pdf'
    },
    {
      id: 'inv-002',
      org_id: 'org-001',
      subscription_id: 'sub-001',
      amount: 99,
      currency: 'USD',
      status: 'pending',
      issue_date: '2025-12-01',
      due_date: '2025-12-15',
      paid_date: null,
      description: 'Professional Plan - Monthly',
      invoice_number: 'INV-2025-002',
      stripe_invoice_id: 'in_stripe_002',
      pdf_url: 'https://example.com/invoices/inv-002.pdf'
    },
    {
      id: 'inv-003',
      org_id: 'org-002',
      subscription_id: 'sub-002',
      amount: 29,
      currency: 'USD',
      status: 'paid',
      issue_date: '2025-10-15',
      due_date: '2025-10-30',
      paid_date: '2025-10-16',
      description: 'Starter Plan - Monthly',
      invoice_number: 'INV-2025-003',
      stripe_invoice_id: 'in_stripe_003',
      pdf_url: 'https://example.com/invoices/inv-003.pdf'
    }
  ],

  payments: [
    {
      id: 'pay-001',
      invoice_id: 'inv-001',
      org_id: 'org-001',
      amount: 99,
      currency: 'USD',
      status: 'succeeded',
      payment_method: 'card',
      card_last4: '4242',
      payment_date: '2025-11-02',
      stripe_payment_id: 'pi_stripe_001',
      receipt_url: 'https://example.com/receipts/pay-001.pdf'
    },
    {
      id: 'pay-002',
      invoice_id: 'inv-003',
      org_id: 'org-002',
      amount: 29,
      currency: 'USD',
      status: 'succeeded',
      payment_method: 'card',
      card_last4: '5555',
      payment_date: '2025-10-16',
      stripe_payment_id: 'pi_stripe_002',
      receipt_url: 'https://example.com/receipts/pay-002.pdf'
    }
  ],

  payment_methods: [
    {
      id: 'pm-001',
      org_id: 'org-001',
      type: 'card',
      card_brand: 'visa',
      card_last4: '4242',
      exp_month: 12,
      exp_year: 2026,
      is_default: true,
      stripe_payment_method_id: 'pm_stripe_001',
      created_at: '2025-11-01'
    },
    {
      id: 'pm-002',
      org_id: 'org-002',
      type: 'card',
      card_brand: 'mastercard',
      card_last4: '5555',
      exp_month: 6,
      exp_year: 2027,
      is_default: true,
      stripe_payment_method_id: 'pm_stripe_002',
      created_at: '2025-10-15'
    }
  ],

  refunds: [
    {
      id: 'ref-001',
      payment_id: 'pay-001',
      invoice_id: 'inv-001',
      org_id: 'org-001',
      amount: 25,
      currency: 'USD',
      reason: 'Partial refund - service issue',
      status: 'succeeded',
      refund_date: '2025-11-05',
      stripe_refund_id: 'ref_stripe_001'
    }
  ]
};

module.exports = (app) => {
  // ==================== PLANS ====================

  app.get('/api/v1/billing/plans', (req, res) => {
    try {
      res.json({
        success: true,
        data: billingDatabase.plans,
        total: billingDatabase.plans.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/billing/plans', (req, res) => {
    try {
      const plan = {
        id: `plan-${Date.now()}`,
        ...req.body,
        created_at: new Date().toISOString()
      };
      billingDatabase.plans.push(plan);
      res.status(201).json({ success: true, data: plan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/v1/billing/plans/:id', (req, res) => {
    try {
      const plan = billingDatabase.plans.find(p => p.id === req.params.id);
      if (!plan) return res.status(404).json({ error: 'Plan not found' });
      
      Object.assign(plan, req.body);
      res.json({ success: true, data: plan });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/v1/billing/plans/:id', (req, res) => {
    try {
      const index = billingDatabase.plans.findIndex(p => p.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Plan not found' });
      
      const deleted = billingDatabase.plans.splice(index, 1);
      res.json({ success: true, data: deleted[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== SUBSCRIPTIONS ====================

  app.get('/api/v1/billing/subscriptions', (req, res) => {
    try {
      const org_id = req.query.org_id;
      let subs = billingDatabase.subscriptions;
      
      if (org_id) {
        subs = subs.filter(s => s.org_id === org_id);
      }
      
      res.json({
        success: true,
        data: subs,
        total: subs.length,
        summary: {
          active: subs.filter(s => s.status === 'active').length,
          cancelled: subs.filter(s => s.status === 'cancelled').length,
          total_mrr: subs.reduce((sum, s) => sum + s.amount, 0)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/billing/subscriptions', (req, res) => {
    try {
      const subscription = {
        id: `sub-${Date.now()}`,
        ...req.body,
        status: 'active',
        created_at: new Date().toISOString()
      };
      billingDatabase.subscriptions.push(subscription);
      res.status(201).json({ success: true, data: subscription });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/v1/billing/subscriptions/:id', (req, res) => {
    try {
      const sub = billingDatabase.subscriptions.find(s => s.id === req.params.id);
      if (!sub) return res.status(404).json({ error: 'Subscription not found' });
      
      Object.assign(sub, req.body);
      res.json({ success: true, data: sub });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/billing/subscriptions/:id/cancel', (req, res) => {
    try {
      const sub = billingDatabase.subscriptions.find(s => s.id === req.params.id);
      if (!sub) return res.status(404).json({ error: 'Subscription not found' });
      
      sub.status = 'cancelled';
      sub.cancelled_at = new Date().toISOString();
      res.json({ success: true, data: sub });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== INVOICES ====================

  app.get('/api/v1/billing/invoices', (req, res) => {
    try {
      const org_id = req.query.org_id;
      let invoices = billingDatabase.invoices;
      
      if (org_id) {
        invoices = invoices.filter(i => i.org_id === org_id);
      }
      
      res.json({
        success: true,
        data: invoices,
        total: invoices.length,
        summary: {
          paid: invoices.filter(i => i.status === 'paid').length,
          pending: invoices.filter(i => i.status === 'pending').length,
          total_amount: invoices.reduce((sum, i) => sum + i.amount, 0)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/billing/invoices/:id', (req, res) => {
    try {
      const invoice = billingDatabase.invoices.find(i => i.id === req.params.id);
      if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
      
      res.json({ success: true, data: invoice });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== PAYMENTS ====================

  app.post('/api/v1/billing/payments', (req, res) => {
    try {
      const payment = {
        id: `pay-${Date.now()}`,
        ...req.body,
        status: 'succeeded',
        payment_date: new Date().toISOString()
      };
      billingDatabase.payments.push(payment);
      
      // Update invoice status
      const invoice = billingDatabase.invoices.find(i => i.id === payment.invoice_id);
      if (invoice) {
        invoice.status = 'paid';
        invoice.paid_date = new Date().toISOString();
      }
      
      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/billing/payments', (req, res) => {
    try {
      const org_id = req.query.org_id;
      let payments = billingDatabase.payments;
      
      if (org_id) {
        payments = payments.filter(p => p.org_id === org_id);
      }
      
      res.json({
        success: true,
        data: payments,
        total: payments.length,
        summary: {
          succeeded: payments.filter(p => p.status === 'succeeded').length,
          failed: payments.filter(p => p.status === 'failed').length,
          total_amount: payments.reduce((sum, p) => sum + p.amount, 0)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== PAYMENT METHODS ====================

  app.get('/api/v1/billing/payment-methods', (req, res) => {
    try {
      const org_id = req.query.org_id;
      let methods = billingDatabase.payment_methods;
      
      if (org_id) {
        methods = methods.filter(m => m.org_id === org_id);
      }
      
      res.json({ success: true, data: methods });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/billing/payment-methods', (req, res) => {
    try {
      const method = {
        id: `pm-${Date.now()}`,
        ...req.body,
        created_at: new Date().toISOString()
      };
      billingDatabase.payment_methods.push(method);
      res.status(201).json({ success: true, data: method });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/v1/billing/payment-methods/:id', (req, res) => {
    try {
      const index = billingDatabase.payment_methods.findIndex(m => m.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Payment method not found' });
      
      const deleted = billingDatabase.payment_methods.splice(index, 1);
      res.json({ success: true, data: deleted[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== REFUNDS ====================

  app.post('/api/v1/billing/refunds', (req, res) => {
    try {
      const refund = {
        id: `ref-${Date.now()}`,
        ...req.body,
        status: 'succeeded',
        refund_date: new Date().toISOString()
      };
      billingDatabase.refunds.push(refund);
      
      // Update payment
      const payment = billingDatabase.payments.find(p => p.id === refund.payment_id);
      if (payment) {
        payment.status = 'refunded';
      }
      
      res.status(201).json({ success: true, data: refund });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/billing/refunds', (req, res) => {
    try {
      const org_id = req.query.org_id;
      let refunds = billingDatabase.refunds;
      
      if (org_id) {
        refunds = refunds.filter(r => r.org_id === org_id);
      }
      
      res.json({
        success: true,
        data: refunds,
        total: refunds.length,
        summary: {
          total_refunded: refunds.reduce((sum, r) => sum + r.amount, 0)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== BILLING DASHBOARD ====================

  app.get('/api/v1/billing/dashboard', (req, res) => {
    try {
      const org_id = req.query.org_id;
      
      const subs = billingDatabase.subscriptions.filter(s => s.org_id === org_id);
      const invoices = billingDatabase.invoices.filter(i => i.org_id === org_id);
      const payments = billingDatabase.payments.filter(p => p.org_id === org_id);
      
      const dashboard = {
        mrr: subs.reduce((sum, s) => sum + s.amount, 0),
        active_subscriptions: subs.filter(s => s.status === 'active').length,
        total_revenue: payments.reduce((sum, p) => sum + p.amount, 0),
        pending_invoices: invoices.filter(i => i.status === 'pending').length,
        paid_invoices: invoices.filter(i => i.status === 'paid').length,
        failed_payments: payments.filter(p => p.status === 'failed').length,
        churn_rate: '2.5%',
        ltv: 1200,
        arr: subs.reduce((sum, s) => sum + (s.amount * 12), 0)
      };
      
      res.json({ success: true, data: dashboard });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
