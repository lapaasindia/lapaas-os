// Shared Data Routes - Allow Finance OS and Sales OS to share customers and products
// This enables cross-module data access and consistency

module.exports = (app, customersVendorsDB, productsDB) => {
  // ==================== SHARED CUSTOMERS ====================
  
  app.get('/api/v1/shared/customers', (req, res) => {
    try {
      const org_id = req.query.org_id;
      const type = req.query.type; // 'customer' or 'vendor'
      
      let customers = customersVendorsDB.customers;
      
      if (org_id) {
        customers = customers.filter(c => c.org_id === org_id);
      }
      
      if (type) {
        customers = customers.filter(c => c.type === type);
      }
      
      res.json({
        success: true,
        data: customers,
        total: customers.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/shared/customers/:id', (req, res) => {
    try {
      const customer = customersVendorsDB.customers.find(c => c.id === req.params.id);
      if (!customer) return res.status(404).json({ error: 'Customer not found' });
      
      res.json({ success: true, data: customer });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== SHARED PRODUCTS ====================

  app.get('/api/v1/shared/products', (req, res) => {
    try {
      const org_id = req.query.org_id;
      const type = req.query.type; // 'product' or 'service'
      
      let products = productsDB.products;
      
      if (org_id) {
        products = products.filter(p => p.org_id === org_id);
      }
      
      if (type) {
        products = products.filter(p => p.type === type);
      }
      
      res.json({
        success: true,
        data: products,
        total: products.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/shared/products/:id', (req, res) => {
    try {
      const product = productsDB.products.find(p => p.id === req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== CROSS-MODULE STATISTICS ====================

  app.get('/api/v1/shared/statistics', (req, res) => {
    try {
      const org_id = req.query.org_id || 'org-001';
      
      const customers = customersVendorsDB.customers.filter(c => c.org_id === org_id && c.type === 'customer');
      const vendors = customersVendorsDB.customers.filter(v => v.org_id === org_id && v.type === 'vendor');
      const products = productsDB.products.filter(p => p.org_id === org_id);
      
      res.json({
        success: true,
        data: {
          customers: {
            total: customers.length,
            active: customers.filter(c => c.status === 'active').length,
            kyc_verified: customers.filter(c => c.kyc_status === 'verified').length,
            total_credit: customers.reduce((sum, c) => sum + c.credit_limit, 0),
            total_outstanding: customers.reduce((sum, c) => sum + c.outstanding_amount, 0)
          },
          vendors: {
            total: vendors.length,
            active: vendors.filter(v => v.status === 'active').length,
            kyc_verified: vendors.filter(v => v.kyc_status === 'verified').length,
            total_outstanding: vendors.reduce((sum, v) => sum + v.outstanding_amount, 0)
          },
          products: {
            total: products.length,
            services: products.filter(p => p.type === 'service').length,
            physical_products: products.filter(p => p.type === 'product').length,
            total_inventory_value: products.reduce((sum, p) => sum + (p.stock_quantity * p.rate), 0)
          }
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
