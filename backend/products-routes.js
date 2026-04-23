// Products & Services Management Routes
// Includes: Product/Service CRUD, Inventory Management, Stock Tracking

const productsDatabase = {
  products: [
    {
      id: 'prod-001',
      org_id: 'org-001',
      name: 'Web Development Service',
      type: 'service',
      description: 'Custom web application development',
      hsn_sac: '9989',
      unit: 'hours',
      rate: 5000,
      tax_rate: 18,
      tax_type: 'GST',
      cgst_rate: 9,
      sgst_rate: 9,
      igst_rate: 0,
      stock_quantity: 0,
      reorder_level: 0,
      status: 'active',
      created_at: '2025-11-01',
      updated_at: '2025-11-01'
    },
    {
      id: 'prod-002',
      org_id: 'org-001',
      name: 'Consulting Service',
      type: 'service',
      description: 'Business consulting and strategy',
      hsn_sac: '9989',
      unit: 'hours',
      rate: 3000,
      tax_rate: 18,
      tax_type: 'GST',
      cgst_rate: 9,
      sgst_rate: 9,
      igst_rate: 0,
      stock_quantity: 0,
      reorder_level: 0,
      status: 'active',
      created_at: '2025-11-01',
      updated_at: '2025-11-01'
    },
    {
      id: 'prod-003',
      org_id: 'org-001',
      name: 'Software License',
      type: 'product',
      description: 'Annual software license',
      hsn_sac: '8471',
      unit: 'license',
      rate: 50000,
      tax_rate: 18,
      tax_type: 'GST',
      cgst_rate: 9,
      sgst_rate: 9,
      igst_rate: 0,
      stock_quantity: 100,
      reorder_level: 20,
      status: 'active',
      created_at: '2025-11-01',
      updated_at: '2025-11-01'
    },
    {
      id: 'prod-004',
      org_id: 'org-001',
      name: 'Hardware Equipment',
      type: 'product',
      description: 'Computer hardware and equipment',
      hsn_sac: '8471',
      unit: 'piece',
      rate: 75000,
      tax_rate: 18,
      tax_type: 'GST',
      cgst_rate: 9,
      sgst_rate: 9,
      igst_rate: 0,
      stock_quantity: 50,
      reorder_level: 10,
      status: 'active',
      created_at: '2025-11-01',
      updated_at: '2025-11-01'
    }
  ],

  inventory_transactions: [
    {
      id: 'inv-trans-001',
      product_id: 'prod-003',
      org_id: 'org-001',
      type: 'purchase',
      quantity: 100,
      reference: 'PO-2025-001',
      notes: 'Initial stock purchase',
      created_at: '2025-10-01'
    },
    {
      id: 'inv-trans-002',
      product_id: 'prod-004',
      org_id: 'org-001',
      type: 'purchase',
      quantity: 50,
      reference: 'PO-2025-002',
      notes: 'Equipment purchase',
      created_at: '2025-10-05'
    }
  ]
};

module.exports = (app) => {
  // ==================== PRODUCTS ====================

  app.get('/api/v1/products', (req, res) => {
    try {
      const org_id = req.query.org_id;
      const type = req.query.type; // 'product', 'service', or undefined for all
      
      let products = productsDatabase.products;
      
      if (org_id) {
        products = products.filter(p => p.org_id === org_id);
      }
      
      if (type) {
        products = products.filter(p => p.type === type);
      }
      
      res.json({
        success: true,
        data: products,
        total: products.length,
        summary: {
          total_products: products.filter(p => p.type === 'product').length,
          total_services: products.filter(p => p.type === 'service').length,
          active: products.filter(p => p.status === 'active').length,
          inactive: products.filter(p => p.status === 'inactive').length
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/products/:id', (req, res) => {
    try {
      const product = productsDatabase.products.find(p => p.id === req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/products', (req, res) => {
    try {
      const product = {
        id: `prod-${Date.now()}`,
        org_id: 'org-001',
        ...req.body,
        status: 'active',
        stock_quantity: req.body.type === 'service' ? 0 : (req.body.stock_quantity || 0),
        created_at: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString().split('T')[0]
      };
      
      productsDatabase.products.push(product);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.put('/api/v1/products/:id', (req, res) => {
    try {
      const product = productsDatabase.products.find(p => p.id === req.params.id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      
      Object.assign(product, req.body, { updated_at: new Date().toISOString().split('T')[0] });
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/v1/products/:id', (req, res) => {
    try {
      const index = productsDatabase.products.findIndex(p => p.id === req.params.id);
      if (index === -1) return res.status(404).json({ error: 'Product not found' });
      
      const deleted = productsDatabase.products.splice(index, 1);
      res.json({ success: true, data: deleted[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== INVENTORY ====================

  app.get('/api/v1/inventory', (req, res) => {
    try {
      const org_id = req.query.org_id;
      
      let inventory = productsDatabase.products.filter(p => p.type === 'product');
      
      if (org_id) {
        inventory = inventory.filter(p => p.org_id === org_id);
      }
      
      const inventoryData = inventory.map(p => ({
        product_id: p.id,
        name: p.name,
        unit: p.unit,
        quantity: p.stock_quantity,
        reorder_level: p.reorder_level,
        status: p.stock_quantity <= p.reorder_level ? 'low' : 'ok',
        rate: p.rate
      }));
      
      res.json({
        success: true,
        data: inventoryData,
        total: inventoryData.length,
        summary: {
          total_items: inventoryData.length,
          low_stock: inventoryData.filter(i => i.status === 'low').length,
          total_value: inventoryData.reduce((sum, i) => sum + (i.quantity * i.rate), 0)
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/v1/inventory/adjust', (req, res) => {
    try {
      const { product_id, quantity, type, reference, notes } = req.body;
      
      const product = productsDatabase.products.find(p => p.id === product_id);
      if (!product) return res.status(404).json({ error: 'Product not found' });
      
      // Record transaction
      const transaction = {
        id: `inv-trans-${Date.now()}`,
        product_id,
        org_id: 'org-001',
        type, // 'purchase', 'sale', 'adjustment', 'return'
        quantity,
        reference,
        notes,
        created_at: new Date().toISOString().split('T')[0]
      };
      
      productsDatabase.inventory_transactions.push(transaction);
      
      // Update stock
      if (type === 'purchase' || type === 'return') {
        product.stock_quantity += quantity;
      } else if (type === 'sale' || type === 'adjustment') {
        product.stock_quantity = Math.max(0, product.stock_quantity - quantity);
      }
      
      product.updated_at = new Date().toISOString().split('T')[0];
      
      res.json({ 
        success: true, 
        data: {
          product,
          transaction
        }
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get('/api/v1/inventory/transactions', (req, res) => {
    try {
      const org_id = req.query.org_id;
      const product_id = req.query.product_id;
      
      let transactions = productsDatabase.inventory_transactions;
      
      if (org_id) {
        transactions = transactions.filter(t => t.org_id === org_id);
      }
      
      if (product_id) {
        transactions = transactions.filter(t => t.product_id === product_id);
      }
      
      res.json({
        success: true,
        data: transactions,
        total: transactions.length
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== PRODUCT CATEGORIES ====================

  app.get('/api/v1/products/categories', (req, res) => {
    try {
      const categories = [
        { id: 'cat-001', name: 'Software Services', type: 'service' },
        { id: 'cat-002', name: 'Consulting Services', type: 'service' },
        { id: 'cat-003', name: 'Hardware', type: 'product' },
        { id: 'cat-004', name: 'Software Licenses', type: 'product' },
        { id: 'cat-005', name: 'Maintenance Services', type: 'service' }
      ];
      
      res.json({ success: true, data: categories });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // ==================== HSN/SAC CODES ====================

  app.get('/api/v1/hsn-sac-codes', (req, res) => {
    try {
      const codes = [
        { code: '8471', description: 'Electronic data processing machines', type: 'product' },
        { code: '8517', description: 'Telephone apparatus', type: 'product' },
        { code: '9989', description: 'Services not elsewhere specified', type: 'service' },
        { code: '9990', description: 'Professional services', type: 'service' },
        { code: '9991', description: 'Consulting services', type: 'service' }
      ];
      
      res.json({ success: true, data: codes });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
};
