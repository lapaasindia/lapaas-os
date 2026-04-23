/**
 * Collections User Routes - Week 13
 * User-facing collections management
 */

const { v4: uuidv4 } = require('uuid');

// In-memory storage
const invoices = [];
const collectionsActions = [];
const customers = [];

module.exports = (app) => {
  // Initialize sample data
  const initializeData = () => {
    if (invoices.length === 0) {
      const now = new Date();
      
      // Sample customers
      customers.push(
        { id: 'cust-001', name: 'Acme Corp', email: 'billing@acme.com', phone: '+91-9876543210', total_outstanding: 150000 },
        { id: 'cust-002', name: 'TechVision Ltd', email: 'accounts@techvision.com', phone: '+91-9876543211', total_outstanding: 75000 },
        { id: 'cust-003', name: 'Global Solutions', email: 'finance@global.com', phone: '+91-9876543212', total_outstanding: 120000 },
        { id: 'cust-004', name: 'Innovation Hub', email: 'billing@innovation.com', phone: '+91-9876543213', total_outstanding: 45000 }
      );

      // Sample invoices
      invoices.push(
        {
          id: 'INV-001',
          customer_id: 'cust-001',
          customer_name: 'Acme Corp',
          amount: 50000,
          due_date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'overdue',
          days_overdue: 5,
          reminders_sent: 2,
          last_reminder: new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'INV-002',
          customer_id: 'cust-001',
          customer_name: 'Acme Corp',
          amount: 100000,
          due_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          days_overdue: 0,
          reminders_sent: 0,
          last_reminder: null,
          created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'INV-003',
          customer_id: 'cust-002',
          customer_name: 'TechVision Ltd',
          amount: 75000,
          due_date: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'overdue',
          days_overdue: 45,
          reminders_sent: 5,
          last_reminder: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'INV-004',
          customer_id: 'cust-003',
          customer_name: 'Global Solutions',
          amount: 120000,
          due_date: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'overdue',
          days_overdue: 25,
          reminders_sent: 3,
          last_reminder: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          created_at: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'INV-005',
          customer_id: 'cust-004',
          customer_name: 'Innovation Hub',
          amount: 45000,
          due_date: new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          days_overdue: 0,
          reminders_sent: 0,
          last_reminder: null,
          created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      );
    }
  };

  initializeData();

  // ============================================
  // COLLECTIONS DASHBOARD
  // ============================================

  /**
   * GET /api/v1/collections/dashboard
   * Get collections dashboard metrics
   */
  app.get('/api/v1/collections/dashboard', (req, res) => {
    try {
      const now = new Date();
      const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.amount, 0);
      const overdueAmount = invoices
        .filter(inv => inv.status === 'overdue')
        .reduce((sum, inv) => sum + inv.amount, 0);
      const collectionCurrent = ((totalOutstanding - overdueAmount) / totalOutstanding * 100).toFixed(1);

      // Calculate DSO (Days Sales Outstanding)
      const totalDays = invoices.reduce((sum, inv) => {
        const daysOutstanding = Math.floor((now - new Date(inv.created_at)) / (1000 * 60 * 60 * 24));
        return sum + daysOutstanding;
      }, 0);
      const dso = Math.round(totalDays / invoices.length);

      // Age buckets
      const ageBuckets = {
        '0_30': 0,
        '30_60': 0,
        '60_90': 0,
        '90_plus': 0
      };

      invoices.forEach(inv => {
        const daysOverdue = inv.days_overdue;
        if (daysOverdue <= 30) ageBuckets['0_30'] += inv.amount;
        else if (daysOverdue <= 60) ageBuckets['30_60'] += inv.amount;
        else if (daysOverdue <= 90) ageBuckets['60_90'] += inv.amount;
        else ageBuckets['90_plus'] += inv.amount;
      });

      res.status(200).json({
        success: true,
        data: {
          summary: {
            total_outstanding: totalOutstanding,
            collection_current: parseFloat(collectionCurrent),
            dso: dso,
            total_invoices: invoices.length,
            overdue_invoices: invoices.filter(inv => inv.status === 'overdue').length,
            pending_invoices: invoices.filter(inv => inv.status === 'pending').length
          },
          by_age: ageBuckets,
          by_customer: customers.map(c => ({
            customer_id: c.id,
            customer_name: c.name,
            total_outstanding: c.total_outstanding,
            invoice_count: invoices.filter(inv => inv.customer_id === c.id).length
          }))
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch dashboard', message: error.message });
    }
  });

  // ============================================
  // INVOICES MANAGEMENT
  // ============================================

  /**
   * GET /api/v1/collections/invoices
   * Get all invoices with pagination
   */
  app.get('/api/v1/collections/invoices', (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      let filtered = invoices;

      if (status) {
        filtered = invoices.filter(inv => inv.status === status);
      }

      const start = (page - 1) * limit;
      const paginatedInvoices = filtered.slice(start, start + limit);

      res.status(200).json({
        success: true,
        data: paginatedInvoices,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filtered.length,
          pages: Math.ceil(filtered.length / limit)
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch invoices', message: error.message });
    }
  });

  /**
   * GET /api/v1/collections/invoices/:invoice_id
   * Get invoice details
   */
  app.get('/api/v1/collections/invoices/:invoice_id', (req, res) => {
    try {
      const { invoice_id } = req.params;
      const invoice = invoices.find(inv => inv.id === invoice_id);

      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      res.status(200).json({
        success: true,
        data: invoice
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch invoice', message: error.message });
    }
  });

  /**
   * PUT /api/v1/collections/invoices/:invoice_id/mark-paid
   * Mark invoice as paid
   */
  app.put('/api/v1/collections/invoices/:invoice_id/mark-paid', (req, res) => {
    try {
      const { invoice_id } = req.params;
      const invoice = invoices.find(inv => inv.id === invoice_id);

      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      invoice.status = 'paid';
      invoice.paid_date = new Date().toISOString();

      collectionsActions.push({
        id: uuidv4(),
        invoice_id,
        action_type: 'mark_paid',
        timestamp: new Date().toISOString(),
        status: 'completed'
      });

      res.status(200).json({
        success: true,
        message: 'Invoice marked as paid',
        data: invoice
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to mark invoice as paid', message: error.message });
    }
  });

  // ============================================
  // COLLECTIONS ACTIONS
  // ============================================

  /**
   * POST /api/v1/collections/send-reminder
   * Send payment reminder (WhatsApp/Email)
   */
  app.post('/api/v1/collections/send-reminder', (req, res) => {
    try {
      const { invoice_id, channel } = req.body;

      if (!invoice_id || !channel) {
        return res.status(400).json({ error: 'invoice_id and channel required' });
      }

      const invoice = invoices.find(inv => inv.id === invoice_id);
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      invoice.reminders_sent += 1;
      invoice.last_reminder = new Date().toISOString();

      const action = {
        id: uuidv4(),
        invoice_id,
        action_type: 'reminder_sent',
        channel,
        timestamp: new Date().toISOString(),
        status: 'sent',
        customer_name: invoice.customer_name,
        amount: invoice.amount
      };

      collectionsActions.push(action);

      res.status(201).json({
        success: true,
        message: `Reminder sent via ${channel}`,
        data: action
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to send reminder', message: error.message });
    }
  });

  /**
   * POST /api/v1/collections/log-call
   * Log collection call
   */
  app.post('/api/v1/collections/log-call', (req, res) => {
    try {
      const { invoice_id, notes, outcome } = req.body;

      if (!invoice_id) {
        return res.status(400).json({ error: 'invoice_id required' });
      }

      const invoice = invoices.find(inv => inv.id === invoice_id);
      if (!invoice) {
        return res.status(404).json({ error: 'Invoice not found' });
      }

      const action = {
        id: uuidv4(),
        invoice_id,
        action_type: 'call_logged',
        notes: notes || '',
        outcome: outcome || 'no_answer',
        timestamp: new Date().toISOString(),
        status: 'completed',
        customer_name: invoice.customer_name
      };

      collectionsActions.push(action);

      res.status(201).json({
        success: true,
        message: 'Call logged successfully',
        data: action
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to log call', message: error.message });
    }
  });

  /**
   * GET /api/v1/collections/actions
   * Get collections actions history
   */
  app.get('/api/v1/collections/actions', (req, res) => {
    try {
      const { invoice_id, limit = 20 } = req.query;
      let filtered = collectionsActions;

      if (invoice_id) {
        filtered = collectionsActions.filter(action => action.invoice_id === invoice_id);
      }

      const result = filtered.slice(-limit).reverse();

      res.status(200).json({
        success: true,
        data: result,
        total: filtered.length
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch actions', message: error.message });
    }
  });

  // ============================================
  // COLLECTIONS REPORTS
  // ============================================

  /**
   * GET /api/v1/collections/report
   * Get collections aging report
   */
  app.get('/api/v1/collections/report', (req, res) => {
    try {
      const ageBuckets = {
        '0_30': { amount: 0, count: 0, invoices: [] },
        '30_60': { amount: 0, count: 0, invoices: [] },
        '60_90': { amount: 0, count: 0, invoices: [] },
        '90_plus': { amount: 0, count: 0, invoices: [] }
      };

      invoices.forEach(inv => {
        const daysOverdue = inv.days_overdue;
        let bucket;

        if (daysOverdue <= 30) bucket = '0_30';
        else if (daysOverdue <= 60) bucket = '30_60';
        else if (daysOverdue <= 90) bucket = '60_90';
        else bucket = '90_plus';

        ageBuckets[bucket].amount += inv.amount;
        ageBuckets[bucket].count += 1;
        ageBuckets[bucket].invoices.push({
          id: inv.id,
          customer: inv.customer_name,
          amount: inv.amount,
          days_overdue: inv.days_overdue
        });
      });

      res.status(200).json({
        success: true,
        data: {
          title: 'Collections Aging Report',
          generated_at: new Date().toISOString(),
          by_age: ageBuckets,
          summary: {
            total_outstanding: invoices.reduce((sum, inv) => sum + inv.amount, 0),
            total_invoices: invoices.length,
            overdue_invoices: invoices.filter(inv => inv.status === 'overdue').length
          }
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to generate report', message: error.message });
    }
  });

  // ============================================
  // CUSTOMERS
  // ============================================

  /**
   * GET /api/v1/collections/customers
   * Get all customers
   */
  app.get('/api/v1/collections/customers', (req, res) => {
    try {
      const customerData = customers.map(c => ({
        ...c,
        invoice_count: invoices.filter(inv => inv.customer_id === c.id).length,
        overdue_count: invoices.filter(inv => inv.customer_id === c.id && inv.status === 'overdue').length
      }));

      res.status(200).json({
        success: true,
        data: customerData,
        total: customerData.length
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch customers', message: error.message });
    }
  });

  /**
   * GET /api/v1/collections/customers/:customer_id
   * Get customer details
   */
  app.get('/api/v1/collections/customers/:customer_id', (req, res) => {
    try {
      const { customer_id } = req.params;
      const customer = customers.find(c => c.id === customer_id);

      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const customerInvoices = invoices.filter(inv => inv.customer_id === customer_id);

      res.status(200).json({
        success: true,
        data: {
          ...customer,
          invoices: customerInvoices,
          invoice_count: customerInvoices.length,
          overdue_count: customerInvoices.filter(inv => inv.status === 'overdue').length,
          total_outstanding: customerInvoices.reduce((sum, inv) => sum + inv.amount, 0)
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch customer', message: error.message });
    }
  });
};
