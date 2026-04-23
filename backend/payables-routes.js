// Payables Management Routes
// Includes: PO management, GRN, Bill management, 3-way match, Pay runs

const payablesDatabase = {
  purchase_orders: [
    {
      id: 'PO-2025-001',
      org_id: 'org-001',
      vendor_id: 'vend-001',
      vendor_name: 'Premium Supplies Ltd',
      po_number: 'PO-2025-001',
      po_date: '2025-11-01',
      expected_delivery: '2025-11-15',
      status: 'open', // open, received, billed, paid
      items: [
        { product_id: 'prod-003', product_name: 'Software License', quantity: 5, rate: 50000, amount: 250000 }
      ],
      subtotal: 250000,
      tax: 45000,
      total: 295000,
      created_at: '2025-11-01',
      updated_at: '2025-11-01'
    },
    {
      id: 'PO-2025-002',
      org_id: 'org-001',
      vendor_id: 'vend-002',
      vendor_name: 'Tech Hardware Co',
      po_number: 'PO-2025-002',
      po_date: '2025-11-02',
      expected_delivery: '2025-11-16',
      status: 'received',
      items: [
        { product_id: 'prod-004', product_name: 'Hardware Equipment', quantity: 3, rate: 75000, amount: 225000 }
      ],
      subtotal: 225000,
      tax: 40500,
      total: 265500,
      created_at: '2025-11-02',
      updated_at: '2025-11-02'
    }
  ],

  grn: [
    {
      id: 'GRN-2025-001',
      org_id: 'org-001',
      po_id: 'PO-2025-002',
      po_number: 'PO-2025-002',
      vendor_id: 'vend-002',
      vendor_name: 'Tech Hardware Co',
      grn_date: '2025-11-10',
      status: 'received', // received, inspected, accepted, rejected
      items: [
        { product_id: 'prod-004', product_name: 'Hardware Equipment', quantity: 3, rate: 75000, amount: 225000 }
      ],
      total: 265500,
      notes: 'All items received in good condition',
      created_at: '2025-11-10',
      updated_at: '2025-11-10'
    }
  ],

  bills: [
    {
      id: 'BILL-2025-001',
      org_id: 'org-001',
      vendor_id: 'vend-002',
      vendor_name: 'Tech Hardware Co',
      bill_number: 'INV-VEN-001',
      bill_date: '2025-11-10',
      due_date: '2025-12-10',
      po_id: 'PO-2025-002',
      grn_id: 'GRN-2025-001',
      status: 'received', // received, matched, approved, paid
      items: [
        { product_id: 'prod-004', product_name: 'Hardware Equipment', quantity: 3, rate: 75000, amount: 225000 }
      ],
      subtotal: 225000,
      tax: 40500,
      total: 265500,
      amount_paid: 0,
      outstanding: 265500,
      three_way_match: {
        po_matched: true,
        grn_matched: true,
        bill_matched: true,
        status: 'matched'
      },
      created_at: '2025-11-10',
      updated_at: '2025-11-10'
    },
    {
      id: 'BILL-2025-002',
      org_id: 'org-001',
      vendor_id: 'vend-001',
      vendor_name: 'Premium Supplies Ltd',
      bill_number: 'INV-VEN-002',
      bill_date: '2025-11-05',
      due_date: '2025-12-05',
      po_id: 'PO-2025-001',
      grn_id: null,
      status: 'received',
      items: [
        { product_id: 'prod-003', product_name: 'Software License', quantity: 5, rate: 50000, amount: 250000 }
      ],
      subtotal: 250000,
      tax: 45000,
      total: 295000,
      amount_paid: 0,
      outstanding: 295000,
      three_way_match: {
        po_matched: true,
        grn_matched: false,
        bill_matched: true,
        status: 'pending_grn'
      },
      created_at: '2025-11-05',
      updated_at: '2025-11-05'
    }
  ],

  payments: [
    {
      id: 'PAY-2025-001',
      org_id: 'org-001',
      bill_id: 'BILL-2025-001',
      vendor_id: 'vend-002',
      vendor_name: 'Tech Hardware Co',
      payment_date: '2025-11-20',
      amount: 265500,
      payment_method: 'bank_transfer',
      reference_number: 'TXN-12345',
      status: 'completed',
      created_at: '2025-11-20',
      updated_at: '2025-11-20'
    }
  ],

  pay_runs: [
    {
      id: 'PAYRUN-2025-001',
      org_id: 'org-001',
      payrun_date: '2025-11-20',
      status: 'completed', // draft, approved, completed
      bills: ['BILL-2025-001'],
      total_amount: 265500,
      payment_count: 1,
      created_at: '2025-11-20',
      updated_at: '2025-11-20'
    }
  ]
};

module.exports = (app) => {
  // ==================== PURCHASE ORDERS ====================

  app.get('/api/v1/purchase-orders', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const status = req.query.status;

      let pos = payablesDatabase.purchase_orders.filter(p => p.org_id === org_id);

      if (status) {
        pos = pos.filter(p => p.status === status);
      }

      res.json({
        success: true,
        data: pos,
        total: pos.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/purchase-orders/:id', (req, res) => {
    try {
      const po = payablesDatabase.purchase_orders.find(p => p.id === req.params.id);
      if (!po) return res.status(404).json({ error: 'PO not found' });

      res.json({ success: true, data: po });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/purchase-orders', (req, res) => {
    try {
      const { vendor_id, vendor_name, po_date, expected_delivery, items } = req.body;

      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const tax = subtotal * 0.18;
      const total = subtotal + tax;

      const po = {
        id: `PO-${Date.now()}`,
        org_id: 'org-001',
        vendor_id,
        vendor_name,
        po_number: `PO-${Date.now()}`,
        po_date,
        expected_delivery,
        status: 'open',
        items,
        subtotal,
        tax,
        total,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      };

      payablesDatabase.purchase_orders.push(po);
      res.status(201).json({ success: true, data: po });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/v1/purchase-orders/:id', (req, res) => {
    try {
      const po = payablesDatabase.purchase_orders.find(p => p.id === req.params.id);
      if (!po) return res.status(404).json({ error: 'PO not found' });

      Object.assign(po, req.body, { updated_at: new Date().toISOString().split('T')[0] });
      res.json({ success: true, data: po });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/v1/purchase-orders/:id', (req, res) => {
    try {
      const index = payablesDatabase.purchase_orders.findIndex(p => p.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'PO not found' });

      const deleted = payablesDatabase.purchase_orders.splice(index, 1);
      res.json({ success: true, data: deleted[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== GRN (GOODS RECEIPT NOTE) ====================

  app.get('/api/v1/grn', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const status = req.query.status;

      let grns = payablesDatabase.grn.filter(g => g.org_id === org_id);

      if (status) {
        grns = grns.filter(g => g.status === status);
      }

      res.json({
        success: true,
        data: grns,
        total: grns.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/grn/:id', (req, res) => {
    try {
      const grn = payablesDatabase.grn.find(g => g.id === req.params.id);
      if (!grn) return res.status(404).json({ error: 'GRN not found' });

      res.json({ success: true, data: grn });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/grn', (req, res) => {
    try {
      const { po_id, vendor_id, vendor_name, items, grn_date, notes } = req.body;

      const total = items.reduce((sum, item) => sum + item.amount, 0);

      const grn = {
        id: `GRN-${Date.now()}`,
        org_id: 'org-001',
        po_id,
        po_number: `PO-${po_id}`,
        vendor_id,
        vendor_name,
        grn_date,
        status: 'received',
        items,
        total,
        notes,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      };

      payablesDatabase.grn.push(grn);

      // Update PO status
      const po = payablesDatabase.purchase_orders.find(p => p.id === po_id);
      if (po) po.status = 'received';

      res.status(201).json({ success: true, data: grn });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/v1/grn/:id', (req, res) => {
    try {
      const grn = payablesDatabase.grn.find(g => g.id === req.params.id);
      if (!grn) return res.status(404).json({ error: 'GRN not found' });

      Object.assign(grn, req.body, { updated_at: new Date().toISOString().split('T')[0] });
      res.json({ success: true, data: grn });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== BILLS ====================

  app.get('/api/v1/bills', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const status = req.query.status;
      const vendor_id = req.query.vendor_id;

      let bills = payablesDatabase.bills.filter(b => b.org_id === org_id);

      if (status) {
        bills = bills.filter(b => b.status === status);
      }

      if (vendor_id) {
        bills = bills.filter(b => b.vendor_id === vendor_id);
      }

      res.json({
        success: true,
        data: bills,
        total: bills.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/bills/:id', (req, res) => {
    try {
      const bill = payablesDatabase.bills.find(b => b.id === req.params.id);
      if (!bill) return res.status(404).json({ error: 'Bill not found' });

      res.json({ success: true, data: bill });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/bills', (req, res) => {
    try {
      const { vendor_id, vendor_name, bill_number, bill_date, due_date, po_id, grn_id, items } = req.body;

      const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
      const tax = subtotal * 0.18;
      const total = subtotal + tax;

      // 3-way match logic
      const po = payablesDatabase.purchase_orders.find(p => p.id === po_id);
      const grn = grn_id ? payablesDatabase.grn.find(g => g.id === grn_id) : null;

      const three_way_match = {
        po_matched: !!po,
        grn_matched: !!grn,
        bill_matched: true,
        status: (po && grn) ? 'matched' : 'pending'
      };

      const bill = {
        id: `BILL-${Date.now()}`,
        org_id: 'org-001',
        vendor_id,
        vendor_name,
        bill_number,
        bill_date,
        due_date,
        po_id,
        grn_id,
        status: 'received',
        items,
        subtotal,
        tax,
        total,
        amount_paid: 0,
        outstanding: total,
        three_way_match,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      };

      payablesDatabase.bills.push(bill);
      res.status(201).json({ success: true, data: bill });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/v1/bills/:id', (req, res) => {
    try {
      const bill = payablesDatabase.bills.find(b => b.id === req.params.id);
      if (!bill) return res.status(404).json({ error: 'Bill not found' });

      Object.assign(bill, req.body, { updated_at: new Date().toISOString().split('T')[0] });
      res.json({ success: true, data: bill });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== PAYMENTS ====================

  app.get('/api/v1/payments', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const vendor_id = req.query.vendor_id;

      let payments = payablesDatabase.payments.filter(p => p.org_id === org_id);

      if (vendor_id) {
        payments = payments.filter(p => p.vendor_id === vendor_id);
      }

      res.json({
        success: true,
        data: payments,
        total: payments.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/payments', (req, res) => {
    try {
      const { bill_id, vendor_id, vendor_name, payment_date, amount, payment_method, reference_number } = req.body;

      const payment = {
        id: `PAY-${Date.now()}`,
        org_id: 'org-001',
        bill_id,
        vendor_id,
        vendor_name,
        payment_date,
        amount,
        payment_method,
        reference_number,
        status: 'completed',
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      };

      payablesDatabase.payments.push(payment);

      // Update bill
      const bill = payablesDatabase.bills.find(b => b.id === bill_id);
      if (bill) {
        bill.amount_paid += amount;
        bill.outstanding = bill.total - bill.amount_paid;
        bill.status = bill.outstanding === 0 ? 'paid' : 'part_paid';
      }

      res.status(201).json({ success: true, data: payment });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== PAY RUNS ====================

  app.get('/api/v1/pay-runs', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const status = req.query.status;

      let payRuns = payablesDatabase.pay_runs.filter(p => p.org_id === org_id);

      if (status) {
        payRuns = payRuns.filter(p => p.status === status);
      }

      res.json({
        success: true,
        data: payRuns,
        total: payRuns.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/pay-runs', (req, res) => {
    try {
      const { payrun_date, bills } = req.body;

      const total_amount = bills.reduce((sum, bill_id) => {
        const bill = payablesDatabase.bills.find(b => b.id === bill_id);
        return sum + (bill ? bill.outstanding : 0);
      }, 0);

      const payRun = {
        id: `PAYRUN-${Date.now()}`,
        org_id: 'org-001',
        payrun_date,
        status: 'draft',
        bills,
        total_amount,
        payment_count: bills.length,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      };

      payablesDatabase.pay_runs.push(payRun);
      res.status(201).json({ success: true, data: payRun });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/v1/pay-runs/:id', (req, res) => {
    try {
      const payRun = payablesDatabase.pay_runs.find(p => p.id === req.params.id);
      if (!payRun) return res.status(404).json({ error: 'Pay run not found' });

      Object.assign(payRun, req.body, { updated_at: new Date().toISOString().split('T')[0] });
      res.json({ success: true, data: payRun });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== PAYABLES SUMMARY ====================

  app.get('/api/v1/payables/summary', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';

      const bills = payablesDatabase.bills.filter(b => b.org_id === org_id);
      const payments = payablesDatabase.payments.filter(p => p.org_id === org_id);

      const summary = {
        total_bills: bills.length,
        bills_paid: bills.filter(b => b.status === 'paid').length,
        bills_outstanding: bills.filter(b => b.status !== 'paid').length,
        total_payable: bills.reduce((sum, b) => sum + b.total, 0),
        total_paid: payments.reduce((sum, p) => sum + p.amount, 0),
        total_outstanding: bills.reduce((sum, b) => sum + b.outstanding, 0),
        overdue_bills: bills.filter(b => new Date(b.due_date) < new Date() && b.status !== 'paid').length,
        three_way_matched: bills.filter(b => b.three_way_match.status === 'matched').length,
        pending_grn: bills.filter(b => !b.grn_id).length
      };

      res.json({ success: true, data: summary });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
