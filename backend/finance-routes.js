// Finance OS Routes
// Includes: Dashboard, Cashflow, Collections (integrated), Payables, Compliance, Reserves, Controls

module.exports = (app) => {
  // ==================== FINANCE HOME DASHBOARD ====================
  
  app.get('/api/v1/finance/dashboard', (req, res) => {
    try {
      const data = {
        runway_weeks: 13,
        current_cash: 1250000,
        monthly_burn: 420000,
        collections_current: 75,
        payables_due: 300000,
        compliance_pending: 3,
        today_actions: [
          {
            id: '1',
            type: 'collections',
            title: 'Send reminders to 3 overdue invoices',
            description: 'INV-001, INV-003, INV-004',
            priority: 'high',
            due_at: '2025-11-08'
          },
          {
            id: '2',
            type: 'payables',
            title: 'Approve pay run for 15th',
            description: '₹300K to 5 vendors',
            priority: 'high',
            due_at: '2025-11-08'
          },
          {
            id: '3',
            type: 'compliance',
            title: 'GST filing due in 12 days',
            description: 'GSTR-3B for Oct 2025',
            priority: 'medium',
            due_at: '2025-11-20'
          },
          {
            id: '4',
            type: 'cashflow',
            title: 'Update weekly forecast',
            description: 'Review variance from last week',
            priority: 'medium',
            due_at: '2025-11-10'
          }
        ],
        exceptions: [
          {
            id: '1',
            type: 'collections',
            title: 'INV-003 45 days overdue',
            severity: 'critical',
            action: 'Escalate to CFO'
          },
          {
            id: '2',
            type: 'payables',
            title: 'Vendor B payment mismatch',
            severity: 'high',
            action: 'Review 3-way match'
          },
          {
            id: '3',
            type: 'cashflow',
            title: 'Week 5 cash dip below ₹500K',
            severity: 'medium',
            action: 'Review scenarios'
          }
        ],
        modules: [
          { id: '1', name: 'Cashflow', icon: '📊', status: 'active', url: '/finance/cashflow' },
          { id: '2', name: 'Collections', icon: '💰', status: 'active', url: '/finance/collections' },
          { id: '3', name: 'Payables', icon: '📤', status: 'active', url: '/finance/payables' },
          { id: '4', name: 'Compliance', icon: '📋', status: 'active', url: '/finance/compliance' },
          { id: '5', name: 'Reserves', icon: '🏦', status: 'active', url: '/finance/reserves' },
          { id: '6', name: 'Controls', icon: '🔒', status: 'active', url: '/finance/controls' }
        ]
      };
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/finance/today-actions', (req, res) => {
    try {
      const actions = [
        { id: '1', type: 'collections', title: 'Send reminders', priority: 'high' },
        { id: '2', type: 'payables', title: 'Approve pay run', priority: 'high' },
        { id: '3', type: 'compliance', title: 'GST filing', priority: 'medium' }
      ];
      res.json({ success: true, data: actions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/finance/exceptions', (req, res) => {
    try {
      const exceptions = [
        { id: '1', type: 'collections', title: 'INV-003 45 days overdue', severity: 'critical' },
        { id: '2', type: 'payables', title: 'Vendor B payment mismatch', severity: 'high' },
        { id: '3', type: 'cashflow', title: 'Week 5 cash dip', severity: 'medium' }
      ];
      res.json({ success: true, data: exceptions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== CASHFLOW ====================

  app.get('/api/v1/finance/cashflow/weeks', (req, res) => {
    try {
      const scenario = req.query.scenario || 'base';
      const weeks = [];
      const startDate = new Date('2025-11-10');

      for (let i = 0; i < 13; i++) {
        const weekStart = new Date(startDate);
        weekStart.setDate(weekStart.getDate() + i * 7);

        let inflows = 0, outflows = 0;
        const lines = [];

        // Vary inflows and outflows based on scenario
        const scenarioMultiplier = scenario === 'best' ? 1.2 : scenario === 'worst' ? 0.8 : 1.0;

        if (i % 2 === 0) {
          inflows = (250000 + Math.random() * 100000) * scenarioMultiplier;
          lines.push({
            id: `inflow-${i}`,
            week_number: i + 1,
            type: 'inflow',
            category: 'AR',
            amount: inflows,
            probability: 0.8,
            status: 'expected',
            notes: 'Client payments expected'
          });
        }

        outflows = (420000 + Math.random() * 50000) * scenarioMultiplier;
        lines.push({
          id: `outflow-${i}`,
          week_number: i + 1,
          type: 'outflow',
          category: 'Payroll',
          amount: outflows,
          probability: 1.0,
          status: 'planned',
          notes: 'Monthly payroll'
        });

        if (i % 3 === 0) {
          const vendorPayment = (100000 + Math.random() * 50000) * scenarioMultiplier;
          outflows += vendorPayment;
          lines.push({
            id: `vendor-${i}`,
            week_number: i + 1,
            type: 'outflow',
            category: 'Vendors',
            amount: vendorPayment,
            probability: 1.0,
            status: 'planned',
            notes: 'Vendor payments'
          });
        }

        weeks.push({
          week_number: i + 1,
          week_start: weekStart.toISOString().split('T')[0],
          inflows_total: inflows,
          outflows_total: outflows,
          net: inflows - outflows,
          lines
        });
      }

      res.json({ success: true, data: weeks });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/finance/cashflow/weeks', (req, res) => {
    try {
      const { week_start, inflows_total, outflows_total } = req.body;
      const newWeek = {
        id: `week-${Date.now()}`,
        week_start,
        inflows_total,
        outflows_total,
        net: inflows_total - outflows_total,
        created_at: new Date().toISOString()
      };
      res.status(201).json({ success: true, data: newWeek });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/finance/cashflow/scenarios', (req, res) => {
    try {
      const scenarios = [
        { id: 'best', name: 'Best Case', description: 'Optimistic scenario', multiplier: 1.2 },
        { id: 'base', name: 'Base Case', description: 'Expected scenario', multiplier: 1.0 },
        { id: 'worst', name: 'Worst Case', description: 'Conservative scenario', multiplier: 0.8 }
      ];
      res.json({ success: true, data: scenarios });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/finance/cashflow/scenarios', (req, res) => {
    try {
      const { name, description, multiplier } = req.body;
      const newScenario = {
        id: `scenario-${Date.now()}`,
        name,
        description,
        multiplier,
        created_at: new Date().toISOString()
      };
      res.status(201).json({ success: true, data: newScenario });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== PAYABLES ====================

  app.get('/api/v1/finance/payables/bills', (req, res) => {
    try {
      const bills = [
        {
          id: 'B-001',
          vendor: 'PrintCo',
          amount: 78000,
          due_at: '2025-11-15',
          status: 'approved',
          po: 'PO-221',
          grn: 'GRN-414'
        },
        {
          id: 'B-002',
          vendor: 'OfficeSupply Inc',
          amount: 45000,
          due_at: '2025-11-20',
          status: 'pending',
          po: 'PO-222',
          grn: 'GRN-415'
        },
        {
          id: 'B-003',
          vendor: 'CloudServices Ltd',
          amount: 120000,
          due_at: '2025-11-10',
          status: 'approved',
          po: 'PO-223',
          grn: 'GRN-416'
        },
        {
          id: 'B-004',
          vendor: 'Marketing Agency',
          amount: 55000,
          due_at: '2025-11-25',
          status: 'pending',
          po: 'PO-224',
          grn: 'GRN-417'
        },
        {
          id: 'B-005',
          vendor: 'Logistics Partner',
          amount: 32000,
          due_at: '2025-11-12',
          status: 'approved',
          po: 'PO-225',
          grn: 'GRN-418'
        }
      ];
      res.json({ success: true, data: bills });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/finance/payables/pay-runs', (req, res) => {
    try {
      const { run_date, bills } = req.body;
      const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0);
      const payRun = {
        id: `payrun-${Date.now()}`,
        run_date,
        total_amount: totalAmount,
        bill_count: bills.length,
        status: 'pending',
        bills,
        created_at: new Date().toISOString()
      };
      res.status(201).json({ success: true, data: payRun });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== COMPLIANCE ====================

  app.get('/api/v1/finance/compliance/items', (req, res) => {
    try {
      const items = [
        {
          id: 'GSTR-3B',
          type: 'GST',
          name: 'GSTR-3B',
          due_at: '2025-11-20',
          status: 'pending',
          owner: 'Finance Admin',
          checklist: { reconcile_sales: true, pay_tax: false }
        },
        {
          id: 'TDS-Q2',
          type: 'TDS',
          name: 'TDS Quarterly',
          due_at: '2025-12-07',
          status: 'pending',
          owner: 'Finance Admin',
          checklist: { collect_forms: true, file_return: false }
        },
        {
          id: 'EPF-M11',
          type: 'EPF',
          name: 'EPF Monthly',
          due_at: '2025-11-15',
          status: 'completed',
          owner: 'HR',
          checklist: { reconcile: true, submit: true }
        }
      ];
      res.json({ success: true, data: items });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/finance/compliance/calendar', (req, res) => {
    try {
      const calendar = [
        { month: 'Nov', items: ['GSTR-3B (20th)', 'EPF (15th)'] },
        { month: 'Dec', items: ['TDS (7th)', 'GSTR-1 (10th)'] },
        { month: 'Jan', items: ['Annual Return (31st)'] }
      ];
      res.json({ success: true, data: calendar });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== RESERVES & DEBT ====================

  app.get('/api/v1/finance/reserves/rules', (req, res) => {
    try {
      const rules = [
        { id: '1', name: 'Taxes Holdback', percentage: 5, target_account: 'Taxes', priority: 1 },
        { id: '2', name: 'Emergency Reserve', percentage: 10, target_account: 'Reserve', priority: 2 },
        { id: '3', name: 'Operations', percentage: 70, target_account: 'Operations', priority: 3 },
        { id: '4', name: 'Owner Draw', percentage: 15, target_account: 'Owner', priority: 4 }
      ];
      res.json({ success: true, data: rules });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/finance/debts', (req, res) => {
    try {
      const debts = [
        {
          id: '1',
          lender: 'Bank A',
          type: 'Term Loan',
          principal: 500000,
          rate: 10.5,
          emi: 15000,
          due_day: 15,
          status: 'active'
        },
        {
          id: '2',
          lender: 'Bank B',
          type: 'Overdraft',
          principal: 200000,
          rate: 12.0,
          emi: 0,
          due_day: 30,
          status: 'active'
        }
      ];
      res.json({ success: true, data: debts });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== CONTROLS ====================

  app.get('/api/v1/finance/controls/exceptions', (req, res) => {
    try {
      const exceptions = [
        {
          id: '1',
          type: 'duplicate_payment',
          title: 'Duplicate payment detected',
          severity: 'critical',
          ref_id: 'B-001',
          resolved_at: null
        },
        {
          id: '2',
          type: 'mismatch',
          title: '3-way match failed',
          severity: 'high',
          ref_id: 'B-002',
          resolved_at: null
        },
        {
          id: '3',
          type: 'limit_breach',
          title: 'Vendor credit limit exceeded',
          severity: 'medium',
          ref_id: 'V-001',
          resolved_at: null
        }
      ];
      res.json({ success: true, data: exceptions });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/finance/controls/bank-recs', (req, res) => {
    try {
      const recs = [
        {
          id: '1',
          account: 'Main Account',
          statement_from: '2025-11-01',
          statement_to: '2025-11-07',
          status: 'completed',
          exceptions: 0
        },
        {
          id: '2',
          account: 'Savings Account',
          statement_from: '2025-11-01',
          statement_to: '2025-11-07',
          status: 'pending',
          exceptions: 2
        }
      ];
      res.json({ success: true, data: recs });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
