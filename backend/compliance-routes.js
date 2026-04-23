// Compliance Management Routes
// Includes: GST returns, TDS, EPF/ESI, ROC/MCA, Evidence vault, Notices

const complianceDatabase = {
  gst_returns: [
    {
      id: 'GST-2025-Q1',
      org_id: 'org-001',
      quarter: 'Q1',
      year: 2025,
      return_type: 'GSTR-1', // GSTR-1, GSTR-2, GSTR-3B
      status: 'filed', // draft, ready, filed, rejected
      filing_date: '2025-04-20',
      due_date: '2025-04-20',
      total_taxable_value: 500000,
      total_tax: 90000,
      igst: 0,
      cgst: 45000,
      sgst: 45000,
      filed_by: 'admin@company.com',
      filed_at: '2025-04-20',
      created_at: '2025-03-01',
      updated_at: '2025-04-20'
    },
    {
      id: 'GST-2025-Q2',
      org_id: 'org-001',
      quarter: 'Q2',
      year: 2025,
      return_type: 'GSTR-1',
      status: 'draft',
      filing_date: null,
      due_date: '2025-07-20',
      total_taxable_value: 450000,
      total_tax: 81000,
      igst: 0,
      cgst: 40500,
      sgst: 40500,
      filed_by: null,
      filed_at: null,
      created_at: '2025-06-01',
      updated_at: '2025-06-01'
    }
  ],

  tds_records: [
    {
      id: 'TDS-2025-001',
      org_id: 'org-001',
      tds_type: 'TDS-194J', // TDS-194J (Professional fees), TDS-194O (Rent)
      financial_year: '2024-25',
      deductee_name: 'ABC Consultants',
      deductee_pan: 'ABCDE1234F',
      amount: 50000,
      tds_rate: 10,
      tds_amount: 5000,
      deduction_date: '2025-01-15',
      challan_number: 'CHN-2025-001',
      status: 'deposited', // pending, deposited, reconciled
      created_at: '2025-01-15',
      updated_at: '2025-01-15'
    },
    {
      id: 'TDS-2025-002',
      org_id: 'org-001',
      tds_type: 'TDS-194O',
      financial_year: '2024-25',
      deductee_name: 'Property Owner',
      deductee_pan: 'XYZ1234567',
      amount: 100000,
      tds_rate: 5,
      tds_amount: 5000,
      deduction_date: '2025-02-01',
      challan_number: 'CHN-2025-002',
      status: 'pending',
      created_at: '2025-02-01',
      updated_at: '2025-02-01'
    }
  ],

  epf_esi_records: [
    {
      id: 'EPF-2025-001',
      org_id: 'org-001',
      month: 'November',
      year: 2025,
      epf_type: 'EPF', // EPF, ESI
      employee_contribution: 50000,
      employer_contribution: 50000,
      total_contribution: 100000,
      status: 'submitted', // draft, submitted, reconciled
      submission_date: '2025-11-05',
      reference_number: 'EPF-REF-001',
      created_at: '2025-11-01',
      updated_at: '2025-11-05'
    },
    {
      id: 'ESI-2025-001',
      org_id: 'org-001',
      month: 'November',
      year: 2025,
      epf_type: 'ESI',
      employee_contribution: 25000,
      employer_contribution: 75000,
      total_contribution: 100000,
      status: 'submitted',
      submission_date: '2025-11-05',
      reference_number: 'ESI-REF-001',
      created_at: '2025-11-01',
      updated_at: '2025-11-05'
    }
  ],

  roc_mca_filings: [
    {
      id: 'ROC-2025-001',
      org_id: 'org-001',
      filing_type: 'Annual Return', // Annual Return, Form INC-22A, Form INC-23AC
      financial_year: '2024-25',
      due_date: '2025-09-30',
      filing_date: '2025-09-15',
      status: 'filed', // draft, ready, filed, rejected
      reference_number: 'ROC-REF-001',
      created_at: '2025-08-01',
      updated_at: '2025-09-15'
    },
    {
      id: 'ROC-2025-002',
      org_id: 'org-001',
      filing_type: 'Form INC-22A',
      financial_year: '2024-25',
      due_date: '2025-11-30',
      filing_date: null,
      status: 'pending',
      reference_number: null,
      created_at: '2025-10-01',
      updated_at: '2025-10-01'
    }
  ],

  evidence_vault: [
    {
      id: 'EV-2025-001',
      org_id: 'org-001',
      document_type: 'GST Certificate',
      document_name: 'GST_Certificate_2025.pdf',
      file_size: 2048,
      uploaded_date: '2025-01-15',
      expiry_date: '2026-01-15',
      status: 'valid', // valid, expired, pending
      uploaded_by: 'admin@company.com',
      created_at: '2025-01-15',
      updated_at: '2025-01-15'
    },
    {
      id: 'EV-2025-002',
      org_id: 'org-001',
      document_type: 'PAN Certificate',
      document_name: 'PAN_Certificate.pdf',
      file_size: 1024,
      uploaded_date: '2024-06-01',
      expiry_date: null,
      status: 'valid',
      uploaded_by: 'admin@company.com',
      created_at: '2024-06-01',
      updated_at: '2024-06-01'
    }
  ],

  notices: [
    {
      id: 'NOTICE-2025-001',
      org_id: 'org-001',
      notice_type: 'GST Notice', // GST Notice, Income Tax Notice, Labor Notice
      notice_number: 'GST-NOTICE-001',
      issued_date: '2025-10-15',
      due_date: '2025-11-15',
      subject: 'GST Compliance Review',
      description: 'Please submit GST returns for Q1 and Q2 2025',
      status: 'open', // open, in_progress, resolved, closed
      priority: 'high', // low, medium, high, critical
      assigned_to: 'compliance@company.com',
      created_at: '2025-10-15',
      updated_at: '2025-10-15'
    },
    {
      id: 'NOTICE-2025-002',
      org_id: 'org-001',
      notice_type: 'Income Tax Notice',
      notice_number: 'IT-NOTICE-001',
      issued_date: '2025-09-01',
      due_date: '2025-10-01',
      subject: 'Income Tax Audit',
      description: 'Audit notice for FY 2023-24',
      status: 'resolved',
      priority: 'high',
      assigned_to: 'compliance@company.com',
      created_at: '2025-09-01',
      updated_at: '2025-10-05'
    }
  ]
};

module.exports = (app) => {
  // ==================== GST RETURNS ====================

  app.get('/api/v1/gst-returns', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const status = req.query.status;

      let returns = complianceDatabase.gst_returns.filter(r => r.org_id === org_id);

      if (status) {
        returns = returns.filter(r => r.status === status);
      }

      res.json({
        success: true,
        data: returns,
        total: returns.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/gst-returns/:id', (req, res) => {
    try {
      const gstReturn = complianceDatabase.gst_returns.find(r => r.id === req.params.id);
      if (!gstReturn) return res.status(404).json({ error: 'GST return not found' });

      res.json({ success: true, data: gstReturn });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/gst-returns', (req, res) => {
    try {
      const { quarter, year, return_type, total_taxable_value } = req.body;

      const total_tax = total_taxable_value * 0.18;

      const gstReturn = {
        id: `GST-${year}-${quarter}`,
        org_id: 'org-001',
        quarter,
        year,
        return_type,
        status: 'draft',
        filing_date: null,
        due_date: new Date().toISOString().split('T')[0],
        total_taxable_value,
        total_tax,
        igst: 0,
        cgst: total_tax / 2,
        sgst: total_tax / 2,
        filed_by: null,
        filed_at: null,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      };

      complianceDatabase.gst_returns.push(gstReturn);
      res.status(201).json({ success: true, data: gstReturn });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/v1/gst-returns/:id', (req, res) => {
    try {
      const gstReturn = complianceDatabase.gst_returns.find(r => r.id === req.params.id);
      if (!gstReturn) return res.status(404).json({ error: 'GST return not found' });

      Object.assign(gstReturn, req.body, { updated_at: new Date().toISOString().split('T')[0] });
      res.json({ success: true, data: gstReturn });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== TDS RECORDS ====================

  app.get('/api/v1/tds-records', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const status = req.query.status;

      let records = complianceDatabase.tds_records.filter(r => r.org_id === org_id);

      if (status) {
        records = records.filter(r => r.status === status);
      }

      res.json({
        success: true,
        data: records,
        total: records.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/tds-records', (req, res) => {
    try {
      const { tds_type, deductee_name, deductee_pan, amount, tds_rate } = req.body;

      const tds_amount = (amount * tds_rate) / 100;

      const record = {
        id: `TDS-${Date.now()}`,
        org_id: 'org-001',
        tds_type,
        financial_year: '2024-25',
        deductee_name,
        deductee_pan,
        amount,
        tds_rate,
        tds_amount,
        deduction_date: new Date().toISOString().split('T')[0],
        challan_number: null,
        status: 'pending',
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      };

      complianceDatabase.tds_records.push(record);
      res.status(201).json({ success: true, data: record });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== EPF/ESI RECORDS ====================

  app.get('/api/v1/epf-esi-records', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const epf_type = req.query.epf_type;

      let records = complianceDatabase.epf_esi_records.filter(r => r.org_id === org_id);

      if (epf_type) {
        records = records.filter(r => r.epf_type === epf_type);
      }

      res.json({
        success: true,
        data: records,
        total: records.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/epf-esi-records', (req, res) => {
    try {
      const { month, year, epf_type, employee_contribution, employer_contribution } = req.body;

      const record = {
        id: `${epf_type}-${Date.now()}`,
        org_id: 'org-001',
        month,
        year,
        epf_type,
        employee_contribution,
        employer_contribution,
        total_contribution: employee_contribution + employer_contribution,
        status: 'draft',
        submission_date: null,
        reference_number: null,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      };

      complianceDatabase.epf_esi_records.push(record);
      res.status(201).json({ success: true, data: record });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== ROC/MCA FILINGS ====================

  app.get('/api/v1/roc-mca-filings', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const status = req.query.status;

      let filings = complianceDatabase.roc_mca_filings.filter(f => f.org_id === org_id);

      if (status) {
        filings = filings.filter(f => f.status === status);
      }

      res.json({
        success: true,
        data: filings,
        total: filings.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== EVIDENCE VAULT ====================

  app.get('/api/v1/evidence-vault', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';

      let documents = complianceDatabase.evidence_vault.filter(d => d.org_id === org_id);

      res.json({
        success: true,
        data: documents,
        total: documents.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/evidence-vault', (req, res) => {
    try {
      const { document_type, document_name, file_size, expiry_date } = req.body;

      const document = {
        id: `EV-${Date.now()}`,
        org_id: 'org-001',
        document_type,
        document_name,
        file_size,
        uploaded_date: new Date().toISOString().split('T')[0],
        expiry_date,
        status: 'valid',
        uploaded_by: 'admin@company.com',
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      };

      complianceDatabase.evidence_vault.push(document);
      res.status(201).json({ success: true, data: document });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== NOTICES ====================

  app.get('/api/v1/notices', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      const status = req.query.status;

      let notices = complianceDatabase.notices.filter(n => n.org_id === org_id);

      if (status) {
        notices = notices.filter(n => n.status === status);
      }

      res.json({
        success: true,
        data: notices,
        total: notices.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/notices', (req, res) => {
    try {
      const { notice_type, notice_number, subject, description, due_date, priority } = req.body;

      const notice = {
        id: `NOTICE-${Date.now()}`,
        org_id: 'org-001',
        notice_type,
        notice_number,
        issued_date: new Date().toISOString().split('T')[0],
        due_date,
        subject,
        description,
        status: 'open',
        priority,
        assigned_to: 'compliance@company.com',
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      };

      complianceDatabase.notices.push(notice);
      res.status(201).json({ success: true, data: notice });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/v1/notices/:id', (req, res) => {
    try {
      const notice = complianceDatabase.notices.find(n => n.id === req.params.id);
      if (!notice) return res.status(404).json({ error: 'Notice not found' });

      Object.assign(notice, req.body, { updated_at: new Date().toISOString().split('T')[0] });
      res.json({ success: true, data: notice });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== COMPLIANCE SUMMARY ====================

  app.get('/api/v1/compliance/summary', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';

      const gst_returns = complianceDatabase.gst_returns.filter(r => r.org_id === org_id);
      const tds_records = complianceDatabase.tds_records.filter(r => r.org_id === org_id);
      const epf_esi = complianceDatabase.epf_esi_records.filter(r => r.org_id === org_id);
      const roc_mca = complianceDatabase.roc_mca_filings.filter(f => f.org_id === org_id);
      const notices = complianceDatabase.notices.filter(n => n.org_id === org_id);
      const documents = complianceDatabase.evidence_vault.filter(d => d.org_id === org_id);

      const summary = {
        gst_returns_filed: gst_returns.filter(r => r.status === 'filed').length,
        gst_returns_pending: gst_returns.filter(r => r.status !== 'filed').length,
        tds_deposited: tds_records.filter(r => r.status === 'deposited').length,
        tds_pending: tds_records.filter(r => r.status === 'pending').length,
        epf_esi_submitted: epf_esi.filter(r => r.status === 'submitted').length,
        epf_esi_pending: epf_esi.filter(r => r.status !== 'submitted').length,
        roc_mca_filed: roc_mca.filter(f => f.status === 'filed').length,
        roc_mca_pending: roc_mca.filter(f => f.status !== 'filed').length,
        open_notices: notices.filter(n => n.status === 'open').length,
        critical_notices: notices.filter(n => n.priority === 'critical').length,
        documents_valid: documents.filter(d => d.status === 'valid').length,
        documents_expired: documents.filter(d => d.status === 'expired').length
      };

      res.json({ success: true, data: summary });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
