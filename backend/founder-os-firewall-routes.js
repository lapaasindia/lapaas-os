// Interruption Firewall Routes for Founder OS
// Handles request intake, escalation matrix, office hours, and KB deflection

const express = require('express');
const router = express.Router();

// Database helper for persistent storage
const dbHelper = require('./db-helper');

// In-memory data stores
let requests = [
  {
    id: 'req-001',
    userId: 'user-001',
    orgId: 'org-001',
    title: 'Need approval on feature spec',
    description: 'Need approval on feature spec',
    category: 'product',
    urgency: 'P2',
    status: 'open',
    whatTried: 'Sent email',
    impact: 'Blocks feature development',
    deadline: '2025-11-09',
    slaAt: '2025-11-09T17:30:00Z',
    routedToId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'req-002',
    userId: 'user-001',
    orgId: 'org-001',
    title: 'Urgent: Budget approval needed',
    description: 'Urgent: Budget approval needed',
    category: 'finance',
    urgency: 'P1',
    status: 'open',
    whatTried: 'Called finance',
    impact: 'Critical - blocks vendor payment',
    deadline: '2025-11-08',
    slaAt: '2025-11-08T17:30:00Z',
    routedToId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'req-003',
    userId: 'user-001',
    orgId: 'org-001',
    title: 'Test request for Phase 1 validation',
    description: 'Test request for Phase 1 validation',
    category: 'general',
    urgency: 'P3',
    status: 'open',
    whatTried: 'Self-service',
    impact: 'Low priority',
    deadline: '2025-11-10',
    slaAt: '2025-11-10T17:30:00Z',
    routedToId: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let officeHours = [
  {
    id: 'office-001',
    orgId: 'org-001',
    ownerId: 'user-001',
    dayOfWeek: 'monday',
    startTime: '14:00',
    endTime: '15:00',
    capacity: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: 'office-002',
    orgId: 'org-001',
    ownerId: 'user-001',
    dayOfWeek: 'wednesday',
    startTime: '14:00',
    endTime: '15:00',
    capacity: 5,
    createdAt: new Date().toISOString()
  },
  {
    id: 'office-003',
    orgId: 'org-001',
    ownerId: 'user-001',
    dayOfWeek: 'friday',
    startTime: '14:00',
    endTime: '15:00',
    capacity: 5,
    createdAt: new Date().toISOString()
  }
];

let escalationMatrix = [
  {
    id: 'esc-001',
    orgId: 'org-001',
    urgency: 'P1',
    route: 'immediate',
    owner: 'user-001',
    requiresJustification: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'esc-002',
    orgId: 'org-001',
    urgency: 'P2',
    route: 'manager',
    owner: 'user-002',
    requiresJustification: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'esc-003',
    orgId: 'org-001',
    urgency: 'P3',
    route: 'office_hours',
    owner: 'user-001',
    requiresJustification: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'esc-004',
    orgId: 'org-001',
    urgency: 'P4',
    route: 'faq',
    owner: null,
    requiresJustification: false,
    createdAt: new Date().toISOString()
  }
];

// KB Categories
let kbCategories = [
  { id: 'cat-001', orgId: 'org-001', name: 'General', description: 'General information and FAQs', icon: '📋', order: 1 },
  { id: 'cat-002', orgId: 'org-001', name: 'Account', description: 'Account and login related', icon: '👤', order: 2 },
  { id: 'cat-003', orgId: 'org-001', name: 'Projects', description: 'Project management guides', icon: '📁', order: 3 },
  { id: 'cat-004', orgId: 'org-001', name: 'Team', description: 'Team collaboration and management', icon: '👥', order: 4 },
  { id: 'cat-005', orgId: 'org-001', name: 'Finance', description: 'Budget and financial processes', icon: '💰', order: 5 },
  { id: 'cat-006', orgId: 'org-001', name: 'Technical', description: 'Technical documentation and guides', icon: '⚙️', order: 6 }
];

let knowledgeBase = [
  {
    id: 'kb-001',
    orgId: 'org-001',
    title: 'How to reset password',
    categoryId: 'cat-002',
    category: 'Account',
    content: 'To reset your password:\n\n1. Go to the login page\n2. Click "Forgot Password"\n3. Enter your email address\n4. Check your email for the reset link\n5. Click the link and create a new password\n\nIf you don\'t receive the email, check your spam folder or contact support.',
    tags: ['password', 'account', 'login', 'reset'],
    viewCount: 45,
    helpfulCount: 12,
    createdBy: 'user-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'kb-002',
    orgId: 'org-001',
    title: 'How to create a new project',
    categoryId: 'cat-003',
    category: 'Projects',
    content: 'Creating a new project is easy:\n\n1. Navigate to the Projects section from the main menu\n2. Click the "New Project" button in the top right\n3. Fill in the project details:\n   - Project name (required)\n   - Description\n   - Start and end dates\n   - Team members\n4. Click "Create Project"\n\nYour project will be created and you can start adding tasks immediately.',
    tags: ['project', 'create', 'new', 'setup'],
    viewCount: 78,
    helpfulCount: 23,
    createdBy: 'user-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'kb-003',
    orgId: 'org-001',
    title: 'How to invite team members',
    categoryId: 'cat-004',
    category: 'Team',
    content: 'To invite new team members:\n\n1. Go to Team Management in the settings\n2. Click "Invite Members"\n3. Enter the email addresses of people you want to invite\n4. Select their role (Admin, Manager, or Member)\n5. Click "Send Invitations"\n\nInvited members will receive an email with instructions to join your organization.',
    tags: ['team', 'invite', 'members', 'onboarding'],
    viewCount: 56,
    helpfulCount: 18,
    createdBy: 'user-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'kb-004',
    orgId: 'org-001',
    title: 'Budget approval process',
    categoryId: 'cat-005',
    category: 'Finance',
    content: 'Budget approval workflow:\n\n1. Submit your budget request through the Finance module\n2. Include detailed justification and breakdown\n3. Your request goes to your manager for initial review\n4. If approved, it escalates to Finance team\n5. Final approval from Founder for amounts over ₹50,000\n\nTimeline: Most requests are processed within 3-5 business days.',
    tags: ['budget', 'finance', 'approval', 'process'],
    viewCount: 34,
    helpfulCount: 9,
    createdBy: 'user-001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let deflectionStats = {
  'org-001': {
    totalRequests: 3,
    deflectedByKB: 0,
    deflectionRate: 0,
    lastUpdated: new Date().toISOString()
  }
};

// ==================== REQUESTS ENDPOINTS - Using Database ====================

// Get all requests
router.get('/requests', async (req, res) => {
  try {
    const org_id = req.query.org_id || 'org-001';
    const { status, requester_id } = req.query;

    const requests = await dbHelper.getRequests(org_id, { status, requester_id });

    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch requests'
    });
  }
});

// Get request by ID
router.get('/requests/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await dbHelper.getRequestById(requestId);

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch request'
    });
  }
});

// Create request
router.post('/requests', async (req, res) => {
  try {
    const { userId, orgId, title, description, category, urgency, whatTried, impact, deadline, routed_to_id, routed_to_name } = req.body;

    if (!title || !category || !urgency) {
      return res.status(400).json({
        success: false,
        error: 'title, category, and urgency are required'
      });
    }

    const request = await dbHelper.createRequest({
      org_id: orgId || 'org-001',
      requester_id: userId || 'user-001',
      requester_name: req.body.requester_name || 'User',
      requester_email: req.body.requester_email || '',
      category,
      urgency,
      description: description || title,
      what_tried: whatTried || '',
      impact: impact || '',
      deadline,
      routed_to_id: routed_to_id || 'user-001',
      routed_to_name: routed_to_name || 'Admin',
      request_type: req.body.request_type || 'to_founder'
    });

    res.status(201).json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create request'
    });
  }
});

// Update request
router.put('/requests/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, response, routed_to_id, routed_to_name } = req.body;

    const request = await dbHelper.updateRequest(requestId, {
      status,
      response,
      responded_at: response ? new Date().toISOString() : undefined,
      routed_to_id,
      routed_to_name
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }

    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update request'
    });
  }
});

// Delete request
router.delete('/requests/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    await dbHelper.deleteRequest(requestId);

    res.json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete request'
    });
  }
});

// ==================== OFFICE HOURS ENDPOINTS ====================

// Get office hours
router.get('/office-hours', (req, res) => {
  try {
    const { org_id, owner_id } = req.query;

    let filtered = officeHours;

    if (org_id) {
      filtered = filtered.filter(o => o.orgId === org_id);
    }

    if (owner_id) {
      filtered = filtered.filter(o => o.ownerId === owner_id);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching office hours:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch office hours'
    });
  }
});

// Create office hour
router.post('/office-hours', (req, res) => {
  try {
    const { orgId, ownerId, dayOfWeek, startTime, endTime, capacity } = req.body;

    if (!orgId || !ownerId || !dayOfWeek || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        error: 'orgId, ownerId, dayOfWeek, startTime, and endTime are required'
      });
    }

    const newOfficeHour = {
      id: `office-${Date.now()}`,
      orgId,
      ownerId,
      dayOfWeek,
      startTime,
      endTime,
      capacity: capacity || 5,
      createdAt: new Date().toISOString()
    };

    officeHours.push(newOfficeHour);

    res.status(201).json({
      success: true,
      data: newOfficeHour
    });
  } catch (error) {
    console.error('Error creating office hour:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create office hour'
    });
  }
});

// Update office hour
router.put('/office-hours/:officeHourId', (req, res) => {
  try {
    const { officeHourId } = req.params;
    const { startTime, endTime, capacity } = req.body;

    const officeHour = officeHours.find(o => o.id === officeHourId);

    if (!officeHour) {
      return res.status(404).json({
        success: false,
        error: 'Office hour not found'
      });
    }

    if (startTime) officeHour.startTime = startTime;
    if (endTime) officeHour.endTime = endTime;
    if (capacity) officeHour.capacity = capacity;

    res.json({
      success: true,
      data: officeHour
    });
  } catch (error) {
    console.error('Error updating office hour:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update office hour'
    });
  }
});

// Delete office hour
router.delete('/office-hours/:officeHourId', (req, res) => {
  try {
    const { officeHourId } = req.params;

    const index = officeHours.findIndex(o => o.id === officeHourId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Office hour not found'
      });
    }

    const deleted = officeHours.splice(index, 1)[0];

    res.json({
      success: true,
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting office hour:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete office hour'
    });
  }
});

// ==================== ESCALATION MATRIX ENDPOINTS ====================

// Get escalation matrix
router.get('/escalation-matrix', (req, res) => {
  try {
    const { org_id } = req.query;

    let filtered = escalationMatrix;

    if (org_id) {
      filtered = filtered.filter(e => e.orgId === org_id);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching escalation matrix:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch escalation matrix'
    });
  }
});

// Update escalation rule
router.put('/escalation-matrix/:ruleId', (req, res) => {
  try {
    const { ruleId } = req.params;
    const { route, owner, requiresJustification } = req.body;

    const rule = escalationMatrix.find(e => e.id === ruleId);

    if (!rule) {
      return res.status(404).json({
        success: false,
        error: 'Escalation rule not found'
      });
    }

    if (route) rule.route = route;
    if (owner) rule.owner = owner;
    if (typeof requiresJustification === 'boolean') rule.requiresJustification = requiresJustification;

    res.json({
      success: true,
      data: rule
    });
  } catch (error) {
    console.error('Error updating escalation rule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update escalation rule'
    });
  }
});

// ==================== KNOWLEDGE BASE ENDPOINTS - Using Database ====================

// Get KB categories
router.get('/kb-categories', async (req, res) => {
  try {
    const org_id = req.query.org_id || 'org-001';
    const categories = await dbHelper.getKBCategories(org_id);
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error('Error fetching KB categories:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch KB categories' });
  }
});

// Create KB category
router.post('/kb-categories', async (req, res) => {
  try {
    const { orgId, name, description, icon } = req.body;
    
    if (!orgId || !name) {
      return res.status(400).json({ success: false, error: 'orgId and name are required' });
    }
    
    const category = await dbHelper.createKBCategory({
      org_id: orgId,
      name,
      description: description || '',
      icon: icon || '📄'
    });
    
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    console.error('Error creating KB category:', error);
    res.status(500).json({ success: false, error: 'Failed to create KB category' });
  }
});

// Update KB category
router.put('/kb-categories/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, icon, order } = req.body;
    
    const category = await dbHelper.updateKBCategory(categoryId, { name, description, icon, order_index: order });
    if (!category) {
      return res.status(404).json({ success: false, error: 'Category not found' });
    }
    
    res.json({ success: true, data: category });
  } catch (error) {
    console.error('Error updating KB category:', error);
    res.status(500).json({ success: false, error: 'Failed to update KB category' });
  }
});

// Delete KB category
router.delete('/kb-categories/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    await dbHelper.deleteKBCategory(categoryId);
    res.json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting KB category:', error);
    if (error.message.includes('Cannot delete')) {
      return res.status(400).json({ success: false, error: error.message });
    }
    res.status(500).json({ success: false, error: 'Failed to delete KB category' });
  }
});

// Get KB articles
router.get('/knowledge-base', async (req, res) => {
  try {
    const org_id = req.query.org_id || 'org-001';
    const { category_id, search } = req.query;

    const articles = await dbHelper.getKBArticles(org_id, { category_id, search });

    res.json({
      success: true,
      data: articles,
      total: articles.length
    });
  } catch (error) {
    console.error('Error fetching KB articles:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch KB articles'
    });
  }
});

// Get single KB article - Using Database
router.get('/knowledge-base/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    const article = await dbHelper.getKBArticleById(articleId, true); // true = increment view
    
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }
    
    res.json({ success: true, data: article });
  } catch (error) {
    console.error('Error fetching KB article:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch KB article' });
  }
});

// Create KB article - Using Database
router.post('/knowledge-base', async (req, res) => {
  try {
    const { orgId, title, categoryId, content, tags, createdBy } = req.body;

    if (!orgId || !title || !categoryId || !content) {
      return res.status(400).json({
        success: false,
        error: 'orgId, title, categoryId, and content are required'
      });
    }

    const article = await dbHelper.createKBArticle({
      org_id: orgId,
      category_id: categoryId,
      title,
      content,
      tags: tags || [],
      created_by: createdBy || 'user-001'
    });

    res.status(201).json({ success: true, data: article });
  } catch (error) {
    console.error('Error creating KB article:', error);
    res.status(500).json({ success: false, error: 'Failed to create KB article' });
  }
});

// Update KB article - Using Database
router.put('/knowledge-base/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    const { title, categoryId, content, tags } = req.body;
    
    const article = await dbHelper.updateKBArticle(articleId, {
      title,
      category_id: categoryId,
      content,
      tags
    });
    
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }
    
    res.json({ success: true, data: article });
  } catch (error) {
    console.error('Error updating KB article:', error);
    res.status(500).json({ success: false, error: 'Failed to update KB article' });
  }
});

// Delete KB article - Using Database
router.delete('/knowledge-base/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    await dbHelper.deleteKBArticle(articleId);
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (error) {
    console.error('Error deleting KB article:', error);
    res.status(500).json({ success: false, error: 'Failed to delete KB article' });
  }
});

// Mark article as helpful - Using Database
router.post('/knowledge-base/:articleId/helpful', async (req, res) => {
  try {
    const { articleId } = req.params;
    const article = await dbHelper.markKBArticleHelpful(articleId);
    
    if (!article) {
      return res.status(404).json({ success: false, error: 'Article not found' });
    }
    
    res.json({ success: true, data: article });
  } catch (error) {
    console.error('Error marking article helpful:', error);
    res.status(500).json({ success: false, error: 'Failed to mark article helpful' });
  }
});

// Search KB articles (for autocomplete/deflection) - Using Database
router.get('/knowledge-base/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const org_id = req.query.org_id || 'org-001';
    
    if (!query || query.length < 2) {
      return res.json({ success: true, data: [] });
    }
    
    const results = await dbHelper.getKBArticles(org_id, { search: query });
    
    res.json({ success: true, data: results.slice(0, 5) });
  } catch (error) {
    console.error('Error searching KB:', error);
    res.status(500).json({ success: false, error: 'Failed to search KB' });
  }
});

// ==================== DEFLECTION STATS ENDPOINTS ====================

// Get deflection stats
router.get('/deflection-stats', (req, res) => {
  try {
    const { org_id } = req.query;

    if (!org_id) {
      return res.status(400).json({
        success: false,
        error: 'org_id is required'
      });
    }

    const stats = deflectionStats[org_id] || {
      totalRequests: 0,
      deflectedByKB: 0,
      deflectionRate: 0,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching deflection stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch deflection stats'
    });
  }
});

// Update deflection stats
router.post('/deflection-stats', (req, res) => {
  try {
    const { orgId, deflected } = req.body;

    if (!orgId) {
      return res.status(400).json({
        success: false,
        error: 'orgId is required'
      });
    }

    if (!deflectionStats[orgId]) {
      deflectionStats[orgId] = {
        totalRequests: 0,
        deflectedByKB: 0,
        deflectionRate: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    if (deflected) {
      deflectionStats[orgId].deflectedByKB += 1;
    }

    deflectionStats[orgId].deflectionRate = Math.round(
      (deflectionStats[orgId].deflectedByKB / deflectionStats[orgId].totalRequests) * 100
    );
    deflectionStats[orgId].lastUpdated = new Date().toISOString();

    res.json({
      success: true,
      data: deflectionStats[orgId]
    });
  } catch (error) {
    console.error('Error updating deflection stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update deflection stats'
    });
  }
});

module.exports = router;
