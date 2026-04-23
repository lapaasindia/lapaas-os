// Customers & Vendors Management Routes
// Includes: Customer/Vendor CRUD, Contact Management, KYC, Credit Limits, Payment Terms

const customersVendorsDatabase = {
  customers: [
    {
      id: 'cust-001',
      org_id: 'org-001',
      type: 'customer',
      name: 'Acme Corporation',
      email: 'contact@acmecorp.com',
      phone: '+91-9876543210',
      gstin: '18AABCT1234H1Z0',
      pan: 'AAACT1234H',
      address: '123 Business Street, Mumbai, Maharashtra 400001',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postal_code: '400001',
      billing_address: '123 Business Street, Mumbai, Maharashtra 400001',
      shipping_address: '123 Business Street, Mumbai, Maharashtra 400001',
      contact_person: 'John Smith',
      contact_designation: 'Finance Manager',
      contact_phone: '+91-9876543210',
      contact_email: 'john@acmecorp.com',
      credit_limit: 500000,
      credit_used: 120000,
      credit_available: 380000,
      payment_terms: 'Net 30',
      payment_method: 'Bank Transfer',
      bank_name: 'HDFC Bank',
      account_number: '1234567890123456',
      ifsc_code: 'HDFC0000123',
      kyc_status: 'verified',
      kyc_documents: ['PAN', 'GSTIN', 'Address Proof'],
      status: 'active',
      rating: 4.5,
      total_invoices: 15,
      total_amount: 2500000,
      outstanding_amount: 120000,
      notes: 'Preferred customer - 10% discount applicable',
      created_at: '2025-10-01',
      updated_at: '2025-11-08'
    },
    {
      id: 'cust-002',
      org_id: 'org-001',
      type: 'customer',
      name: 'TechVision Ltd',
      email: 'sales@techvision.com',
      phone: '+91-8765432109',
      gstin: '27AABCT5678H1Z0',
      pan: 'AABCT5678H',
      address: '456 Tech Park, Bangalore, Karnataka 560001',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      postal_code: '560001',
      billing_address: '456 Tech Park, Bangalore, Karnataka 560001',
      shipping_address: '456 Tech Park, Bangalore, Karnataka 560001',
      contact_person: 'Sarah Johnson',
      contact_designation: 'Procurement Head',
      contact_phone: '+91-8765432109',
      contact_email: 'sarah@techvision.com',
      credit_limit: 300000,
      credit_used: 75000,
      credit_available: 225000,
      payment_terms: 'Net 45',
      payment_method: 'Cheque',
      bank_name: 'ICICI Bank',
      account_number: '9876543210987654',
      ifsc_code: 'ICIC0000456',
      kyc_status: 'verified',
      kyc_documents: ['PAN', 'GSTIN'],
      status: 'active',
      rating: 4.0,
      total_invoices: 8,
      total_amount: 1200000,
      outstanding_amount: 75000,
      notes: 'Regular customer',
      created_at: '2025-10-15',
      updated_at: '2025-11-08'
    },
    {
      id: 'cust-003',
      org_id: 'org-001',
      type: 'customer',
      name: 'Global Solutions Inc',
      email: 'info@globalsolutions.com',
      phone: '+91-7654321098',
      gstin: '06AABCT9012H1Z0',
      pan: 'AABCT9012H',
      address: '789 Enterprise Avenue, Delhi, Delhi 110001',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      postal_code: '110001',
      billing_address: '789 Enterprise Avenue, Delhi, Delhi 110001',
      shipping_address: '789 Enterprise Avenue, Delhi, Delhi 110001',
      contact_person: 'Michael Brown',
      contact_designation: 'Operations Manager',
      contact_phone: '+91-7654321098',
      contact_email: 'michael@globalsolutions.com',
      credit_limit: 200000,
      credit_used: 0,
      credit_available: 200000,
      payment_terms: 'Net 15',
      payment_method: 'UPI',
      bank_name: 'Axis Bank',
      account_number: '5432109876543210',
      ifsc_code: 'UTIB0000789',
      kyc_status: 'pending',
      kyc_documents: ['PAN'],
      status: 'active',
      rating: 3.5,
      total_invoices: 2,
      total_amount: 300000,
      outstanding_amount: 0,
      notes: 'New customer - KYC pending',
      created_at: '2025-11-01',
      updated_at: '2025-11-08'
    }
  ],

  vendors: [
    {
      id: 'vend-001',
      org_id: 'org-001',
      type: 'vendor',
      name: 'Premium Supplies Ltd',
      email: 'sales@premiumsupplies.com',
      phone: '+91-9123456789',
      gstin: '09AABCT3456H1Z0',
      pan: 'AABCT3456H',
      address: '321 Supply Street, Pune, Maharashtra 411001',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      postal_code: '411001',
      billing_address: '321 Supply Street, Pune, Maharashtra 411001',
      shipping_address: '321 Supply Street, Pune, Maharashtra 411001',
      contact_person: 'Rajesh Kumar',
      contact_designation: 'Sales Manager',
      contact_phone: '+91-9123456789',
      contact_email: 'rajesh@premiumsupplies.com',
      payment_terms: 'Net 30',
      payment_method: 'Bank Transfer',
      bank_name: 'SBI Bank',
      account_number: '3210987654321098',
      ifsc_code: 'SBIN0000321',
      kyc_status: 'verified',
      kyc_documents: ['PAN', 'GSTIN', 'Address Proof'],
      status: 'active',
      rating: 4.8,
      total_bills: 12,
      total_amount: 1800000,
      outstanding_amount: 250000,
      payment_history: 'Excellent',
      notes: 'Preferred vendor - Best quality products',
      created_at: '2025-09-01',
      updated_at: '2025-11-08'
    },
    {
      id: 'vend-002',
      org_id: 'org-001',
      type: 'vendor',
      name: 'Tech Hardware Co',
      email: 'orders@techhardware.com',
      phone: '+91-8234567890',
      gstin: '33AABCT7890H1Z0',
      pan: 'AABCT7890H',
      address: '654 Hardware Lane, Chennai, Tamil Nadu 600001',
      city: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      postal_code: '600001',
      billing_address: '654 Hardware Lane, Chennai, Tamil Nadu 600001',
      shipping_address: '654 Hardware Lane, Chennai, Tamil Nadu 600001',
      contact_person: 'Priya Sharma',
      contact_designation: 'Account Manager',
      contact_phone: '+91-8234567890',
      contact_email: 'priya@techhardware.com',
      payment_terms: 'Net 45',
      payment_method: 'NEFT',
      bank_name: 'Kotak Bank',
      account_number: '9876543210123456',
      ifsc_code: 'KKBK0000654',
      kyc_status: 'verified',
      kyc_documents: ['PAN', 'GSTIN'],
      status: 'active',
      rating: 4.2,
      total_bills: 8,
      total_amount: 950000,
      outstanding_amount: 150000,
      payment_history: 'Good',
      notes: 'Reliable vendor for hardware supplies',
      created_at: '2025-09-15',
      updated_at: '2025-11-08'
    }
  ],

  kyc_documents: [
    {
      id: 'kyc-001',
      customer_vendor_id: 'cust-001',
      type: 'PAN',
      document_number: 'AAACT1234H',
      issue_date: '2020-01-15',
      expiry_date: null,
      verified: true,
      verified_by: 'admin-001',
      verified_at: '2025-10-01'
    },
    {
      id: 'kyc-002',
      customer_vendor_id: 'cust-001',
      type: 'GSTIN',
      document_number: '18AABCT1234H1Z0',
      issue_date: '2018-06-01',
      expiry_date: null,
      verified: true,
      verified_by: 'admin-001',
      verified_at: '2025-10-01'
    }
  ]
};

module.exports = (app) => {
  // ==================== CUSTOMERS ====================

  app.get('/api/v1/customers', (req, res) => {
    try {
      const org_id = req.query.org_id;
      const status = req.query.status;
      const kyc_status = req.query.kyc_status;

      let customers = customersVendorsDatabase.customers.filter(c => c.type === 'customer');

      if (org_id) {
        customers = customers.filter(c => c.org_id === org_id);
      }

      if (status) {
        customers = customers.filter(c => c.status === status);
      }

      if (kyc_status) {
        customers = customers.filter(c => c.kyc_status === kyc_status);
      }

      res.json({
        success: true,
        data: customers,
        total: customers.length,
        summary: {
          total_customers: customers.length,
          active: customers.filter(c => c.status === 'active').length,
          inactive: customers.filter(c => c.status === 'inactive').length,
          kyc_verified: customers.filter(c => c.kyc_status === 'verified').length,
          kyc_pending: customers.filter(c => c.kyc_status === 'pending').length,
          total_credit_limit: customers.reduce((sum, c) => sum + c.credit_limit, 0),
          total_outstanding: customers.reduce((sum, c) => sum + c.outstanding_amount, 0)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/customers/:id', (req, res) => {
    try {
      const customer = customersVendorsDatabase.customers.find(
        c => c.id === req.params.id && c.type === 'customer'
      );
      if (!customer) return res.status(404).json({ error: 'Customer not found' });

      res.json({ success: true, data: customer });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/customers', (req, res) => {
    try {
      const customer = {
        id: `cust-${Date.now()}`,
        org_id: 'org-001',
        type: 'customer',
        ...req.body,
        credit_used: 0,
        credit_available: req.body.credit_limit || 0,
        status: 'active',
        kyc_status: 'pending',
        kyc_documents: [],
        total_invoices: 0,
        total_amount: 0,
        outstanding_amount: 0,
        rating: 0,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      };

      customersVendorsDatabase.customers.push(customer);
      res.status(201).json({ success: true, data: customer });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/v1/customers/:id', (req, res) => {
    try {
      const customer = customersVendorsDatabase.customers.find(
        c => c.id === req.params.id && c.type === 'customer'
      );
      if (!customer) return res.status(404).json({ error: 'Customer not found' });

      Object.assign(customer, req.body, { updated_at: new Date().toISOString().split('T')[0] });
      res.json({ success: true, data: customer });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/v1/customers/:id', (req, res) => {
    try {
      const index = customersVendorsDatabase.customers.findIndex(
        c => c.id === req.params.id && c.type === 'customer'
      );
      if (index === -1) return res.status(404).json({ error: 'Customer not found' });

      const deleted = customersVendorsDatabase.customers.splice(index, 1);
      res.json({ success: true, data: deleted[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== VENDORS ====================

  app.get('/api/v1/vendors', (req, res) => {
    try {
      const org_id = req.query.org_id;
      const status = req.query.status;
      const kyc_status = req.query.kyc_status;

      let vendors = customersVendorsDatabase.customers.filter(v => v.type === 'vendor');

      if (org_id) {
        vendors = vendors.filter(v => v.org_id === org_id);
      }

      if (status) {
        vendors = vendors.filter(v => v.status === status);
      }

      if (kyc_status) {
        vendors = vendors.filter(v => v.kyc_status === kyc_status);
      }

      res.json({
        success: true,
        data: vendors,
        total: vendors.length,
        summary: {
          total_vendors: vendors.length,
          active: vendors.filter(v => v.status === 'active').length,
          inactive: vendors.filter(v => v.status === 'inactive').length,
          kyc_verified: vendors.filter(v => v.kyc_status === 'verified').length,
          kyc_pending: vendors.filter(v => v.kyc_status === 'pending').length,
          total_outstanding: vendors.reduce((sum, v) => sum + v.outstanding_amount, 0)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/vendors/:id', (req, res) => {
    try {
      const vendor = customersVendorsDatabase.customers.find(
        v => v.id === req.params.id && v.type === 'vendor'
      );
      if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

      res.json({ success: true, data: vendor });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/vendors', (req, res) => {
    try {
      const vendor = {
        id: `vend-${Date.now()}`,
        org_id: 'org-001',
        type: 'vendor',
        ...req.body,
        status: 'active',
        kyc_status: 'pending',
        kyc_documents: [],
        total_bills: 0,
        total_amount: 0,
        outstanding_amount: 0,
        payment_history: 'New',
        rating: 0,
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      };

      customersVendorsDatabase.customers.push(vendor);
      res.status(201).json({ success: true, data: vendor });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/v1/vendors/:id', (req, res) => {
    try {
      const vendor = customersVendorsDatabase.customers.find(
        v => v.id === req.params.id && v.type === 'vendor'
      );
      if (!vendor) return res.status(404).json({ error: 'Vendor not found' });

      Object.assign(vendor, req.body, { updated_at: new Date().toISOString().split('T')[0] });
      res.json({ success: true, data: vendor });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/v1/vendors/:id', (req, res) => {
    try {
      const index = customersVendorsDatabase.customers.findIndex(
        v => v.id === req.params.id && v.type === 'vendor'
      );
      if (index === -1) return res.status(404).json({ error: 'Vendor not found' });

      const deleted = customersVendorsDatabase.customers.splice(index, 1);
      res.json({ success: true, data: deleted[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== KYC MANAGEMENT ====================

  app.get('/api/v1/kyc/:customer_vendor_id', (req, res) => {
    try {
      const documents = customersVendorsDatabase.kyc_documents.filter(
        d => d.customer_vendor_id === req.params.customer_vendor_id
      );

      res.json({
        success: true,
        data: documents,
        total: documents.length,
        verified: documents.filter(d => d.verified).length,
        pending: documents.filter(d => !d.verified).length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/kyc', (req, res) => {
    try {
      const kyc = {
        id: `kyc-${Date.now()}`,
        ...req.body,
        verified: false,
        created_at: new Date().toISOString().split('T')[0]
      };

      customersVendorsDatabase.kyc_documents.push(kyc);
      res.status(201).json({ success: true, data: kyc });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/v1/kyc/:id/verify', (req, res) => {
    try {
      const kyc = customersVendorsDatabase.kyc_documents.find(d => d.id === req.params.id);
      if (!kyc) return res.status(404).json({ error: 'KYC document not found' });

      kyc.verified = true;
      kyc.verified_by = req.body.verified_by || 'admin-001';
      kyc.verified_at = new Date().toISOString().split('T')[0];

      res.json({ success: true, data: kyc });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== CREDIT MANAGEMENT ====================

  app.put('/api/v1/customers/:id/credit', (req, res) => {
    try {
      const customer = customersVendorsDatabase.customers.find(
        c => c.id === req.params.id && c.type === 'customer'
      );
      if (!customer) return res.status(404).json({ error: 'Customer not found' });

      customer.credit_limit = req.body.credit_limit || customer.credit_limit;
      customer.credit_available = customer.credit_limit - customer.credit_used;

      res.json({
        success: true,
        data: {
          credit_limit: customer.credit_limit,
          credit_used: customer.credit_used,
          credit_available: customer.credit_available
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== CONTACT MANAGEMENT ====================

  app.get('/api/v1/contacts', (req, res) => {
    try {
      const org_id = req.query.org_id;
      const type = req.query.type; // 'customer' or 'vendor'

      let items = customersVendorsDatabase.customers;

      if (org_id) {
        items = items.filter(i => i.org_id === org_id);
      }

      if (type) {
        items = items.filter(i => i.type === type);
      }

      const contacts = items.map(item => ({
        id: item.id,
        name: item.name,
        type: item.type,
        contact_person: item.contact_person,
        contact_email: item.contact_email,
        contact_phone: item.contact_phone,
        contact_designation: item.contact_designation,
        email: item.email,
        phone: item.phone
      }));

      res.json({
        success: true,
        data: contacts,
        total: contacts.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== SUMMARY DASHBOARD ====================

  app.get('/api/v1/customers-vendors/summary', (req, res) => {
    try {
      const org_id = req.query.org_id;

      let customers = customersVendorsDatabase.customers.filter(c => c.type === 'customer');
      let vendors = customersVendorsDatabase.customers.filter(v => v.type === 'vendor');

      if (org_id) {
        customers = customers.filter(c => c.org_id === org_id);
        vendors = vendors.filter(v => v.org_id === org_id);
      }

      res.json({
        success: true,
        data: {
          customers: {
            total: customers.length,
            active: customers.filter(c => c.status === 'active').length,
            kyc_verified: customers.filter(c => c.kyc_status === 'verified').length,
            total_credit_limit: customers.reduce((sum, c) => sum + c.credit_limit, 0),
            total_outstanding: customers.reduce((sum, c) => sum + c.outstanding_amount, 0),
            total_invoices: customers.reduce((sum, c) => sum + c.total_invoices, 0)
          },
          vendors: {
            total: vendors.length,
            active: vendors.filter(v => v.status === 'active').length,
            kyc_verified: vendors.filter(v => v.kyc_status === 'verified').length,
            total_outstanding: vendors.reduce((sum, v) => sum + v.outstanding_amount, 0),
            total_bills: vendors.reduce((sum, v) => sum + v.total_bills, 0)
          }
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
