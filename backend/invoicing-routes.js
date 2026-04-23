// Invoicing & Receipts Module Routes
// Includes: Invoices, Receipts, Credit/Debit Notes, Advance Receipts

const invoicingDatabase = {
  invoices: [
    {
      id: 'inv-001',
      org_id: 'org-001',
      customer_id: 'cust-001',
      invoice_number: 'INV-2025-001',
      series: 'INV',
      issue_date: '2025-11-01',
      due_date: '2025-11-15',
      line_items: [
        {
          id: 'li-001',
          description: 'Software Development Services',
          hsn_sac: '9989',
          qty: 1,
          rate: 100000,
          cgst_rate: 9,
          sgst_rate: 9,
          igst_rate: 0,
          amount: 100000
        }
      ],
      subtotal: 100000,
      cgst: 9000,
      sgst: 9000,
      igst: 0,
      total: 118000,
      currency: 'INR',
      reverse_charge: false,
      place_of_supply: 'INTRA',
      status: 'Issued',
      approval_status: 'Approved',
      approved_by: 'user-001',
      approved_at: '2025-11-01',
      notes_en: 'Payment due within 15 days',
      notes_hi: 'भुगतान 15 दिनों के भीतर देय है',
      created_at: '2025-11-01',
      updated_at: '2025-11-01',
      created_by: 'user-001',
      updated_by: 'user-001'
    },
    {
      id: 'inv-002',
      org_id: 'org-001',
      customer_id: 'cust-002',
      invoice_number: 'INV-2025-002',
      series: 'INV',
      issue_date: '2025-11-02',
      due_date: '2025-11-16',
      line_items: [
        {
          id: 'li-002',
          description: 'Consulting Services',
          hsn_sac: '9989',
          qty: 1,
          rate: 75000,
          cgst_rate: 9,
          sgst_rate: 9,
          igst_rate: 0,
          amount: 75000
        }
      ],
      subtotal: 75000,
      cgst: 6750,
      sgst: 6750,
      igst: 0,
      total: 88500,
      currency: 'INR',
      reverse_charge: false,
      place_of_supply: 'INTRA',
      status: 'Part-paid',
      approval_status: 'Approved',
      approved_by: 'user-001',
      approved_at: '2025-11-02',
      notes_en: 'Payment due within 15 days',
      notes_hi: 'भुगतान 15 दिनों के भीतर देय है',
      created_at: '2025-11-02',
      updated_at: '2025-11-05',
      created_by: 'user-001',
      updated_by: 'user-001'
    },
    {
      id: 'inv-003',
      org_id: 'org-001',
      customer_id: 'cust-003',
      invoice_number: 'INV-2025-003',
      series: 'INV',
      issue_date: '2025-10-20',
      due_date: '2025-11-03',
      line_items: [
        {
          id: 'li-003',
          description: 'Product Sales',
          hsn_sac: '8471',
          qty: 5,
          rate: 50000,
          cgst_rate: 9,
          sgst_rate: 9,
          igst_rate: 0,
          amount: 250000
        }
      ],
      subtotal: 250000,
      cgst: 22500,
      sgst: 22500,
      igst: 0,
      total: 295000,
      currency: 'INR',
      reverse_charge: false,
      place_of_supply: 'INTRA',
      status: 'Overdue',
      approval_status: 'Approved',
      approved_by: 'user-001',
      approved_at: '2025-10-20',
      notes_en: 'Payment due within 15 days',
      notes_hi: 'भुगतान 15 दिनों के भीतर देय है',
      created_at: '2025-10-20',
      updated_at: '2025-11-08',
      created_by: 'user-001',
      updated_by: 'user-001'
    }
  ],

  receipts: [
    {
      id: 'rec-001',
      org_id: 'org-001',
      invoice_id: 'inv-001',
      amount: 118000,
      currency: 'INR',
      receipt_date: '2025-11-05',
      receipt_number: 'REC-2025-001',
      payment_method: 'NEFT',
      utr: 'NEFT123456789',
      bank_reference: 'BANK-REF-001',
      status: 'Reconciled',
      ledger_posted: true,
      ledger_posted_at: '2025-11-05',
      created_at: '2025-11-05',
      updated_at: '2025-11-05',
      created_by: 'user-001'
    },
    {
      id: 'rec-002',
      org_id: 'org-001',
      invoice_id: 'inv-002',
      amount: 44250,
      currency: 'INR',
      receipt_date: '2025-11-06',
      receipt_number: 'REC-2025-002',
      payment_method: 'UPI',
      utr: 'UPI123456789',
      bank_reference: 'UPI-REF-001',
      status: 'Reconciled',
      ledger_posted: true,
      ledger_posted_at: '2025-11-06',
      created_at: '2025-11-06',
      updated_at: '2025-11-06',
      created_by: 'user-001'
    }
  ],

  credit_notes: [
    {
      id: 'cn-001',
      org_id: 'org-001',
      invoice_id: 'inv-002',
      note_number: 'CN-2025-001',
      issue_date: '2025-11-07',
      reason: 'Service discount',
      amount: 10000,
      cgst: 900,
      sgst: 900,
      igst: 0,
      total: 11800,
      currency: 'INR',
      status: 'Applied',
      approval_status: 'Approved',
      approved_by: 'user-001',
      approved_at: '2025-11-07',
      ledger_posted: true,
      created_at: '2025-11-07',
      updated_at: '2025-11-07',
      created_by: 'user-001'
    }
  ],

  advance_receipts: [
    {
      id: 'adv-001',
      org_id: 'org-001',
      customer_id: 'cust-001',
      amount: 50000,
      currency: 'INR',
      receipt_date: '2025-10-15',
      applied_to_invoices: [
        {
          invoice_id: 'inv-001',
          amount: 50000,
          applied_date: '2025-11-01'
        }
      ],
      status: 'Applied',
      created_at: '2025-10-15',
      updated_at: '2025-11-01'
    }
  ]
};

module.exports = (app) => {
  // ==================== INVOICES ====================

  app.get('/api/v1/invoicing/invoices', (req, res) => {
    try {
      const org_id = req.query.org_id;
      let invoices = invoicingDatabase.invoices;
      
      if (org_id) {
        invoices = invoices.filter(i => i.org_id === org_id);
      }
      
      res.json({
        success: true,
        data: invoices,
        total: invoices.length,
        summary: {
          issued: invoices.filter(i => i.status === 'Issued').length,
          paid: invoices.filter(i => i.status === 'Paid').length,
          overdue: invoices.filter(i => i.status === 'Overdue').length,
          total_amount: invoices.reduce((sum, i) => sum + i.total, 0)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/invoicing/invoices/:id', (req, res) => {
    try {
      const invoice = invoicingDatabase.invoices.find(i => i.id === req.params.id);
      if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
      
      // Calculate payment details
      const receipts = invoicingDatabase.receipts.filter(r => r.invoice_id === req.params.id);
      const totalReceived = receipts.reduce((sum, r) => sum + r.amount, 0);
      const outstanding = Math.max(0, invoice.total - totalReceived);
      const paymentPercentage = (totalReceived / invoice.total * 100).toFixed(1);
      
      res.json({ 
        success: true, 
        data: {
          ...invoice,
          totalReceived,
          outstanding,
          paymentPercentage,
          receipts: receipts.length
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/invoicing/invoices', (req, res) => {
    try {
      const invoice = {
        id: `inv-${Date.now()}`,
        ...req.body,
        status: 'Draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      invoicingDatabase.invoices.push(invoice);
      res.status(201).json({ success: true, data: invoice });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/v1/invoicing/invoices/:id', (req, res) => {
    try {
      const invoice = invoicingDatabase.invoices.find(i => i.id === req.params.id);
      if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
      
      Object.assign(invoice, req.body, { updated_at: new Date().toISOString() });
      res.json({ success: true, data: invoice });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/invoicing/invoices/:id/issue', (req, res) => {
    try {
      const invoice = invoicingDatabase.invoices.find(i => i.id === req.params.id);
      if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
      
      invoice.status = 'Issued';
      invoice.approval_status = 'Approved';
      invoice.approved_by = req.body.approved_by || 'system';
      invoice.approved_at = new Date().toISOString();
      invoice.updated_at = new Date().toISOString();
      
      res.json({ success: true, data: invoice });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/invoicing/invoices/:id/mark-paid', (req, res) => {
    try {
      const invoice = invoicingDatabase.invoices.find(i => i.id === req.params.id);
      if (!invoice) return res.status(404).json({ error: 'Invoice not found' });
      
      invoice.status = 'Paid';
      invoice.updated_at = new Date().toISOString();
      
      res.json({ success: true, data: invoice });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== RECEIPTS ====================

  app.get('/api/v1/invoicing/receipts', (req, res) => {
    try {
      const org_id = req.query.org_id;
      let receipts = invoicingDatabase.receipts;
      
      if (org_id) {
        receipts = receipts.filter(r => r.org_id === org_id);
      }
      
      res.json({
        success: true,
        data: receipts,
        total: receipts.length,
        summary: {
          reconciled: receipts.filter(r => r.status === 'Reconciled').length,
          total_amount: receipts.reduce((sum, r) => sum + r.amount, 0)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/invoicing/receipts', (req, res) => {
    try {
      const receipt = {
        id: `rec-${Date.now()}`,
        ...req.body,
        status: 'Draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      invoicingDatabase.receipts.push(receipt);
      
      // Update invoice status based on payment amount
      const invoice = invoicingDatabase.invoices.find(i => i.id === receipt.invoice_id);
      if (invoice) {
        const totalReceived = invoicingDatabase.receipts
          .filter(r => r.invoice_id === receipt.invoice_id)
          .reduce((sum, r) => sum + r.amount, 0);
        
        if (totalReceived >= invoice.total) {
          invoice.status = 'Paid';
        } else if (totalReceived > 0) {
          invoice.status = 'Part-paid';
        }
      }
      
      res.status(201).json({ success: true, data: receipt });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/invoicing/receipts/:id/reconcile', (req, res) => {
    try {
      const receipt = invoicingDatabase.receipts.find(r => r.id === req.params.id);
      if (!receipt) return res.status(404).json({ error: 'Receipt not found' });
      
      receipt.status = 'Reconciled';
      receipt.ledger_posted = true;
      receipt.ledger_posted_at = new Date().toISOString();
      receipt.updated_at = new Date().toISOString();
      
      res.json({ success: true, data: receipt });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== CREDIT NOTES ====================

  app.get('/api/v1/invoicing/credit-notes', (req, res) => {
    try {
      const org_id = req.query.org_id;
      let notes = invoicingDatabase.credit_notes;
      
      if (org_id) {
        notes = notes.filter(n => n.org_id === org_id);
      }
      
      res.json({
        success: true,
        data: notes,
        total: notes.length,
        summary: {
          applied: notes.filter(n => n.status === 'Applied').length,
          total_amount: notes.reduce((sum, n) => sum + n.total, 0)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/invoicing/credit-notes', (req, res) => {
    try {
      const note = {
        id: `cn-${Date.now()}`,
        ...req.body,
        status: 'Draft',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      invoicingDatabase.credit_notes.push(note);
      res.status(201).json({ success: true, data: note });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== ADVANCE RECEIPTS ====================

  app.get('/api/v1/invoicing/advance-receipts', (req, res) => {
    try {
      const org_id = req.query.org_id;
      let advances = invoicingDatabase.advance_receipts;
      
      if (org_id) {
        advances = advances.filter(a => a.org_id === org_id);
      }
      
      res.json({
        success: true,
        data: advances,
        total: advances.length,
        summary: {
          unapplied: advances.filter(a => a.status === 'Unapplied').length,
          total_amount: advances.reduce((sum, a) => sum + a.amount, 0)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/invoicing/advance-receipts', (req, res) => {
    try {
      const advance = {
        id: `adv-${Date.now()}`,
        ...req.body,
        status: 'Unapplied',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      invoicingDatabase.advance_receipts.push(advance);
      res.status(201).json({ success: true, data: advance });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== INVOICING DASHBOARD ====================

  app.get('/api/v1/invoicing/dashboard', (req, res) => {
    try {
      const org_id = req.query.org_id;
      
      const invoices = invoicingDatabase.invoices.filter(i => i.org_id === org_id);
      const receipts = invoicingDatabase.receipts.filter(r => r.org_id === org_id);
      const credits = invoicingDatabase.credit_notes.filter(c => c.org_id === org_id);
      
      const dashboard = {
        total_invoiced: invoices.reduce((sum, i) => sum + i.total, 0),
        total_collected: receipts.reduce((sum, r) => sum + r.amount, 0),
        total_credits: credits.reduce((sum, c) => sum + c.total, 0),
        outstanding: invoices.reduce((sum, i) => sum + i.total, 0) - receipts.reduce((sum, r) => sum + r.amount, 0),
        invoices_issued: invoices.filter(i => i.status === 'Issued').length,
        invoices_paid: invoices.filter(i => i.status === 'Paid').length,
        invoices_overdue: invoices.filter(i => i.status === 'Overdue').length,
        collection_rate: invoices.length > 0 ? ((receipts.reduce((sum, r) => sum + r.amount, 0) / invoices.reduce((sum, i) => sum + i.total, 0)) * 100).toFixed(1) : 0
      };
      
      res.json({ success: true, data: dashboard });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
