// Finance OS Phase 2 Routes - Payables, Compliance, Reserves, Controls
// Uses real database with persistent data

const financeDB = require('./finance-database');

module.exports = (app) => {
  // ==================== PAYABLES MODULE ====================

  // Get all bills
  app.get('/api/v1/finance/payables/bills', (req, res) => {
    try {
      const status = req.query.status || 'all';
      let bills = financeDB.bills;
      
      if (status !== 'all') {
        bills = bills.filter(b => b.status === status);
      }
      
      res.json({
        success: true,
        data: bills,
        total: bills.length,
        summary: {
          total_amount: bills.reduce((sum, b) => sum + b.amount, 0),
          approved: bills.filter(b => b.status === 'approved').length,
          pending: bills.filter(b => b.status === 'pending').length
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get bill details
  app.get('/api/v1/finance/payables/bills/:id', (req, res) => {
    try {
      const bill = financeDB.bills.find(b => b.id === req.params.id);
      if (!bill) return res.status(404).json({ error: 'Bill not found' });
      
      const vendor = financeDB.vendors.find(v => v.id === bill.vendor_id);
      res.json({ success: true, data: { ...bill, vendor } });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Approve bill
  app.put('/api/v1/finance/payables/bills/:id/approve', (req, res) => {
    try {
      const bill = financeDB.bills.find(b => b.id === req.params.id);
      if (!bill) return res.status(404).json({ error: 'Bill not found' });
      
      bill.status = 'approved';
      bill.approval_state = 'approved';
      bill.approver_id = req.body.approver_id || 'user-001';
      bill.approved_at = new Date().toISOString();
      
      res.json({ success: true, data: bill, message: 'Bill approved successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all vendors
  app.get('/api/v1/finance/payables/vendors', (req, res) => {
    try {
      res.json({
        success: true,
        data: financeDB.vendors,
        total: financeDB.vendors.length,
        summary: {
          active_vendors: financeDB.vendors.filter(v => v.status === 'active').length,
          avg_happiness: (financeDB.vendors.reduce((sum, v) => sum + v.happiness_score, 0) / financeDB.vendors.length).toFixed(1),
          total_paid: financeDB.vendors.reduce((sum, v) => sum + v.total_paid, 0)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get vendor details
  app.get('/api/v1/finance/payables/vendors/:id', (req, res) => {
    try {
      const vendor = financeDB.vendors.find(v => v.id === req.params.id);
      if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
      
      const vendor_bills = financeDB.bills.filter(b => b.vendor_id === vendor.id);
      const total_outstanding = vendor_bills
        .filter(b => b.payment_status === 'pending')
        .reduce((sum, b) => sum + b.amount, 0);
      
      res.json({
        success: true,
        data: {
          ...vendor,
          bills: vendor_bills,
          total_outstanding,
          pending_bills: vendor_bills.filter(b => b.payment_status === 'pending').length
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create pay run
  app.post('/api/v1/finance/payables/pay-runs', (req, res) => {
    try {
      const { run_date, bills } = req.body;
      const total_amount = bills.reduce((sum, bill_id) => {
        const bill = financeDB.bills.find(b => b.id === bill_id);
        return sum + (bill ? bill.amount : 0);
      }, 0);
      
      const payRun = {
        id: `PR-${Date.now()}`,
        run_date,
        run_number: `PR-2025-${financeDB.pay_runs.length + 1}`,
        total_amount,
        bill_count: bills.length,
        status: 'pending',
        approver_id: null,
        approved_at: null,
        payment_date: null,
        bills,
        created_at: new Date().toISOString()
      };
      
      financeDB.pay_runs.push(payRun);
      res.status(201).json({ success: true, data: payRun });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get pay runs
  app.get('/api/v1/finance/payables/pay-runs', (req, res) => {
    try {
      const status = req.query.status || 'all';
      let payRuns = financeDB.pay_runs;
      
      if (status !== 'all') {
        payRuns = payRuns.filter(pr => pr.status === status);
      }
      
      res.json({
        success: true,
        data: payRuns,
        total: payRuns.length,
        summary: {
          total_amount: payRuns.reduce((sum, pr) => sum + pr.total_amount, 0),
          completed: payRuns.filter(pr => pr.status === 'completed').length,
          pending: payRuns.filter(pr => pr.status === 'pending').length
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Approve pay run
  app.put('/api/v1/finance/payables/pay-runs/:id/approve', (req, res) => {
    try {
      const payRun = financeDB.pay_runs.find(pr => pr.id === req.params.id);
      if (!payRun) return res.status(404).json({ error: 'Pay run not found' });
      
      payRun.status = 'completed';
      payRun.approver_id = req.body.approver_id || 'user-001';
      payRun.approved_at = new Date().toISOString();
      payRun.payment_date = new Date().toISOString();
      
      // Update bill payment status
      payRun.bills.forEach(bill_id => {
        const bill = financeDB.bills.find(b => b.id === bill_id);
        if (bill) bill.payment_status = 'paid';
      });
      
      res.json({ success: true, data: payRun, message: 'Pay run approved and processed' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== COMPLIANCE MODULE ====================

  // Get all compliance items
  app.get('/api/v1/finance/compliance/items', (req, res) => {
    try {
      const type = req.query.type || 'all';
      let items = financeDB.compliance_items;
      
      if (type !== 'all') {
        items = items.filter(i => i.type === type);
      }
      
      res.json({
        success: true,
        data: items,
        total: items.length,
        summary: {
          pending: items.filter(i => i.status === 'pending').length,
          completed: items.filter(i => i.status === 'completed').length,
          overdue: items.filter(i => i.status === 'pending' && new Date(i.due_date) < new Date()).length
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get compliance item details
  app.get('/api/v1/finance/compliance/items/:id', (req, res) => {
    try {
      const item = financeDB.compliance_items.find(i => i.id === req.params.id);
      if (!item) return res.status(404).json({ error: 'Compliance item not found' });
      
      res.json({ success: true, data: item });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update compliance checklist
  app.put('/api/v1/finance/compliance/items/:id/checklist', (req, res) => {
    try {
      const item = financeDB.compliance_items.find(i => i.id === req.params.id);
      if (!item) return res.status(404).json({ error: 'Compliance item not found' });
      
      item.checklist = { ...item.checklist, ...req.body.checklist };
      item.updated_at = new Date().toISOString();
      
      // Check if all items are done
      const allDone = Object.values(item.checklist).every(v => v === true);
      if (allDone) item.status = 'completed';
      
      res.json({ success: true, data: item });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Upload compliance document
  app.post('/api/v1/finance/compliance/items/:id/documents', (req, res) => {
    try {
      const item = financeDB.compliance_items.find(i => i.id === req.params.id);
      if (!item) return res.status(404).json({ error: 'Compliance item not found' });
      
      const doc = {
        id: `DOC-${Date.now()}`,
        name: req.body.name,
        url: req.body.url,
        uploaded_at: new Date().toISOString(),
        verified: false
      };
      
      item.documents.push(doc);
      res.status(201).json({ success: true, data: doc });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get compliance calendar
  app.get('/api/v1/finance/compliance/calendar', (req, res) => {
    try {
      const calendar = {};
      financeDB.compliance_items.forEach(item => {
        const date = new Date(item.due_date);
        const month = date.toLocaleString('en-IN', { month: 'long', year: 'numeric' });
        
        if (!calendar[month]) calendar[month] = [];
        calendar[month].push({
          id: item.id,
          name: item.name,
          due_date: item.due_date,
          status: item.status,
          type: item.type
        });
      });
      
      res.json({ success: true, data: calendar });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== RESERVES & DEBT MODULE ====================

  // Get reserve rules
  app.get('/api/v1/finance/reserves/rules', (req, res) => {
    try {
      res.json({
        success: true,
        data: financeDB.reserve_rules,
        total_percentage: financeDB.reserve_rules.reduce((sum, r) => sum + r.percentage, 0)
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update reserve rule
  app.put('/api/v1/finance/reserves/rules/:id', (req, res) => {
    try {
      const rule = financeDB.reserve_rules.find(r => r.id === req.params.id);
      if (!rule) return res.status(404).json({ error: 'Reserve rule not found' });
      
      rule.percentage = req.body.percentage || rule.percentage;
      rule.target_account = req.body.target_account || rule.target_account;
      rule.priority = req.body.priority || rule.priority;
      
      res.json({ success: true, data: rule });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get reserve ledger
  app.get('/api/v1/finance/reserves/ledger', (req, res) => {
    try {
      res.json({
        success: true,
        data: financeDB.reserve_ledger,
        latest: financeDB.reserve_ledger[financeDB.reserve_ledger.length - 1]
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get all debts
  app.get('/api/v1/finance/debts', (req, res) => {
    try {
      res.json({
        success: true,
        data: financeDB.debts,
        total: financeDB.debts.length,
        summary: {
          total_principal: financeDB.debts.reduce((sum, d) => sum + d.principal, 0),
          total_remaining: financeDB.debts.reduce((sum, d) => sum + d.remaining_amount, 0),
          total_emi: financeDB.debts.reduce((sum, d) => sum + d.emi, 0)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get debt details
  app.get('/api/v1/finance/debts/:id', (req, res) => {
    try {
      const debt = financeDB.debts.find(d => d.id === req.params.id);
      if (!debt) return res.status(404).json({ error: 'Debt not found' });
      
      const months_remaining = Math.ceil((new Date(debt.end_date) - new Date()) / (1000 * 60 * 60 * 24 * 30));
      const interest_saved_avalanche = debt.principal * debt.rate * 0.05; // Simplified
      
      res.json({
        success: true,
        data: {
          ...debt,
          months_remaining,
          interest_saved_avalanche,
          amortization_schedule: generateAmortizationSchedule(debt)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== CONTROLS MODULE ====================

  // Get bank reconciliations
  app.get('/api/v1/finance/controls/bank-recs', (req, res) => {
    try {
      res.json({
        success: true,
        data: financeDB.bank_reconciliations,
        summary: {
          completed: financeDB.bank_reconciliations.filter(br => br.status === 'completed').length,
          pending: financeDB.bank_reconciliations.filter(br => br.status === 'pending').length,
          total_exceptions: financeDB.bank_reconciliations.reduce((sum, br) => sum + br.exceptions, 0)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get bank rec details
  app.get('/api/v1/finance/controls/bank-recs/:id', (req, res) => {
    try {
      const rec = financeDB.bank_reconciliations.find(br => br.id === req.params.id);
      if (!rec) return res.status(404).json({ error: 'Bank reconciliation not found' });
      
      res.json({ success: true, data: rec });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Complete bank reconciliation
  app.put('/api/v1/finance/controls/bank-recs/:id/complete', (req, res) => {
    try {
      const rec = financeDB.bank_reconciliations.find(br => br.id === req.params.id);
      if (!rec) return res.status(404).json({ error: 'Bank reconciliation not found' });
      
      rec.status = 'completed';
      rec.reconciled_by = req.body.reconciled_by || 'user-001';
      rec.reconciled_at = new Date().toISOString();
      
      res.json({ success: true, data: rec });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get control exceptions
  app.get('/api/v1/finance/controls/exceptions', (req, res) => {
    try {
      const severity = req.query.severity || 'all';
      let exceptions = financeDB.control_exceptions;
      
      if (severity !== 'all') {
        exceptions = exceptions.filter(e => e.severity === severity);
      }
      
      res.json({
        success: true,
        data: exceptions,
        summary: {
          critical: exceptions.filter(e => e.severity === 'critical').length,
          high: exceptions.filter(e => e.severity === 'high').length,
          medium: exceptions.filter(e => e.severity === 'medium').length,
          open: exceptions.filter(e => e.status === 'open').length
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Resolve exception
  app.put('/api/v1/finance/controls/exceptions/:id/resolve', (req, res) => {
    try {
      const exception = financeDB.control_exceptions.find(e => e.id === req.params.id);
      if (!exception) return res.status(404).json({ error: 'Exception not found' });
      
      exception.status = 'resolved';
      exception.resolved_by = req.body.resolved_by || 'user-001';
      exception.resolved_at = new Date().toISOString();
      exception.resolution_notes = req.body.resolution_notes;
      
      res.json({ success: true, data: exception });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};

// Helper function to generate amortization schedule
function generateAmortizationSchedule(debt) {
  const schedule = [];
  let remaining = debt.remaining_amount;
  const monthlyRate = debt.rate / 12 / 100;
  
  for (let i = 0; i < 6; i++) {
    const interest = remaining * monthlyRate;
    const principal = debt.emi - interest;
    remaining -= principal;
    
    schedule.push({
      month: i + 1,
      emi: debt.emi,
      principal,
      interest,
      remaining: Math.max(0, remaining)
    });
  }
  
  return schedule;
}
