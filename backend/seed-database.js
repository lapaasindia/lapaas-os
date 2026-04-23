/**
 * Database Seeding Script
 * Populates the database with sample data for testing
 */

const db = require('./db-helper');

async function seed() {
  console.log('🌱 Seeding database...\n');

  const orgId = 'org-001';
  const userId = 'user-001';
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  try {
    // ==================== MEETINGS ====================
    console.log('📅 Creating meetings...');
    
    const meetings = [
      {
        id: 'mtg-001',
        org_id: orgId,
        title: 'Weekly Team Sync',
        description: 'Regular weekly sync with the team',
        purpose: 'Align on weekly priorities and blockers',
        expected_outcomes: 'Clear action items for the week',
        location: 'Conference Room A',
        meeting_type: 'internal',
        status: 'scheduled',
        start_time: `${tomorrow}T10:00:00`,
        end_time: `${tomorrow}T11:00:00`,
        duration_minutes: 60,
        organizer_id: userId,
        organizer_name: 'Sahil Khanna',
        attendees: ['user-002', 'user-003', 'user-004'],
        agendaItems: [
          { title: 'Progress Updates', duration_minutes: 15 },
          { title: 'Blockers Discussion', duration_minutes: 20 },
          { title: 'Next Week Planning', duration_minutes: 20 },
          { title: 'Q&A', duration_minutes: 5 }
        ]
      },
      {
        id: 'mtg-002',
        org_id: orgId,
        title: 'Product Review',
        description: 'Review new product features',
        purpose: 'Get feedback on new features',
        expected_outcomes: 'Approved feature list for release',
        location: 'Virtual - Zoom',
        meeting_type: 'internal',
        status: 'scheduled',
        start_time: `${tomorrow}T14:00:00`,
        end_time: `${tomorrow}T15:00:00`,
        duration_minutes: 60,
        organizer_id: userId,
        organizer_name: 'Sahil Khanna',
        attendees: ['user-002', 'user-005'],
        agendaItems: [
          { title: 'Feature Demo', duration_minutes: 30 },
          { title: 'Feedback Collection', duration_minutes: 20 },
          { title: 'Next Steps', duration_minutes: 10 }
        ]
      }
    ];

    for (const meeting of meetings) {
      const existing = await db.getMeetingById(meeting.id);
      if (!existing) {
        await db.createMeeting(meeting);
        console.log(`  ✅ Meeting: ${meeting.title}`);
      }
    }

    // ==================== TASKS ====================
    console.log('\n📋 Creating tasks...');
    
    const tasks = [
      {
        id: 'task-001',
        org_id: orgId,
        user_id: userId,
        title: 'Complete Q4 roadmap',
        description: 'Finalize the product roadmap for Q4',
        priority: 'high',
        status: 'in_progress',
        due_date: tomorrow,
        estimated_minutes: 120,
        subtasks: [
          { title: 'Review market research', completed: true },
          { title: 'Draft feature list', completed: true },
          { title: 'Get stakeholder feedback', completed: false },
          { title: 'Finalize document', completed: false }
        ]
      },
      {
        id: 'task-002',
        org_id: orgId,
        user_id: userId,
        title: 'Review team performance',
        description: 'Quarterly performance review for team members',
        priority: 'medium',
        status: 'pending',
        due_date: tomorrow,
        estimated_minutes: 90,
        subtasks: [
          { title: 'Gather metrics', completed: false },
          { title: 'Schedule 1:1s', completed: false },
          { title: 'Prepare feedback', completed: false }
        ]
      },
      {
        id: 'task-003',
        org_id: orgId,
        user_id: userId,
        title: 'Update documentation',
        description: 'Update API documentation for new endpoints',
        priority: 'low',
        status: 'pending',
        due_date: tomorrow,
        estimated_minutes: 60
      }
    ];

    for (const task of tasks) {
      const existing = await db.getTaskById(task.id);
      if (!existing) {
        await db.createTask(task);
        console.log(`  ✅ Task: ${task.title}`);
      }
    }

    // ==================== COMMITMENTS ====================
    console.log('\n🎯 Creating commitments...');
    
    const commitments = [
      {
        id: 'comm-001',
        org_id: orgId,
        user_id: userId,
        title: 'Complete product roadmap',
        description: 'Finalize Q4 roadmap document',
        date: today,
        effort_minutes: 90,
        priority: 1,
        status: 'in_progress',
        subtasks: [
          { title: 'Review feedback', completed: true },
          { title: 'Update timeline', completed: false }
        ]
      },
      {
        id: 'comm-002',
        org_id: orgId,
        user_id: userId,
        title: 'Review team proposals',
        description: 'Go through pending proposals',
        date: today,
        effort_minutes: 60,
        priority: 2,
        status: 'pending'
      },
      {
        id: 'comm-003',
        org_id: orgId,
        user_id: userId,
        title: 'Prepare investor update',
        description: 'Monthly investor newsletter',
        date: today,
        effort_minutes: 45,
        priority: 3,
        status: 'pending'
      }
    ];

    for (const commitment of commitments) {
      const existing = await db.getCommitmentById(commitment.id);
      if (!existing) {
        await db.createCommitment(commitment);
        console.log(`  ✅ Commitment: ${commitment.title}`);
      }
    }

    // ==================== TIME BLOCKS ====================
    console.log('\n⏰ Creating time blocks...');
    
    const timeBlocks = [
      {
        id: 'tb-001',
        org_id: orgId,
        user_id: userId,
        title: 'Deep Work',
        block_type: 'deep_work',
        date: today,
        start_time: '09:00',
        end_time: '11:00',
        duration_minutes: 120,
        target_minutes: 120,
        color: '#FF6B6B',
        status: 'scheduled'
      },
      {
        id: 'tb-002',
        org_id: orgId,
        user_id: userId,
        title: 'Admin Tasks',
        block_type: 'admin',
        date: today,
        start_time: '14:00',
        end_time: '15:30',
        duration_minutes: 90,
        target_minutes: 90,
        color: '#4ECDC4',
        status: 'scheduled'
      },
      {
        id: 'tb-003',
        org_id: orgId,
        user_id: userId,
        title: 'Meetings',
        block_type: 'meetings',
        date: today,
        start_time: '16:00',
        end_time: '17:00',
        duration_minutes: 60,
        target_minutes: 60,
        color: '#45B7D1',
        status: 'scheduled'
      }
    ];

    for (const block of timeBlocks) {
      const existing = await db.dbGet('SELECT id FROM time_blocks WHERE id = ?', [block.id]);
      if (!existing) {
        await db.createTimeBlock(block);
        console.log(`  ✅ Time Block: ${block.title}`);
      }
    }

    // ==================== REQUESTS ====================
    console.log('\n📨 Creating requests...');
    
    const requests = [
      {
        id: 'req-001',
        org_id: orgId,
        requester_id: 'user-002',
        requester_name: 'John Smith',
        requester_email: 'john.smith@lapaas.com',
        category: 'Product',
        urgency: 'P2',
        description: 'Need approval on feature spec for the new dashboard',
        what_tried: 'Reviewed with team, prepared documentation',
        impact: 'Blocking sprint planning for next week',
        status: 'pending',
        routed_to_id: userId,
        routed_to_name: 'Sahil Khanna',
        routed_to_email: 'admin@lapaas.com',
        request_type: 'to_founder'
      },
      {
        id: 'req-002',
        org_id: orgId,
        requester_id: 'user-003',
        requester_name: 'Sarah Johnson',
        requester_email: 'sarah.johnson@lapaas.com',
        category: 'Budget',
        urgency: 'P3',
        description: 'Budget approval for new marketing campaign',
        what_tried: 'Prepared ROI analysis',
        impact: 'Campaign launch delayed',
        status: 'pending',
        routed_to_id: userId,
        routed_to_name: 'Sahil Khanna',
        routed_to_email: 'admin@lapaas.com',
        request_type: 'to_founder'
      }
    ];

    for (const request of requests) {
      const existing = await db.getRequestById(request.id);
      if (!existing) {
        await db.createRequest(request);
        console.log(`  ✅ Request: ${request.description.substring(0, 40)}...`);
      }
    }

    // ==================== KB CATEGORIES ====================
    console.log('\n📚 Creating KB categories...');
    
    const categories = [
      { id: 'cat-001', org_id: orgId, name: 'General', description: 'General information and FAQs', icon: '📋' },
      { id: 'cat-002', org_id: orgId, name: 'Account', description: 'Account and login related', icon: '👤' },
      { id: 'cat-003', org_id: orgId, name: 'Projects', description: 'Project management guides', icon: '📁' },
      { id: 'cat-004', org_id: orgId, name: 'Team', description: 'Team collaboration', icon: '👥' },
      { id: 'cat-005', org_id: orgId, name: 'Finance', description: 'Budget and financial processes', icon: '💰' },
      { id: 'cat-006', org_id: orgId, name: 'Technical', description: 'Technical documentation', icon: '⚙️' }
    ];

    for (const cat of categories) {
      const existing = await db.dbGet('SELECT id FROM kb_categories WHERE id = ?', [cat.id]);
      if (!existing) {
        await db.createKBCategory(cat);
        console.log(`  ✅ Category: ${cat.name}`);
      }
    }

    // ==================== KB ARTICLES ====================
    console.log('\n📄 Creating KB articles...');
    
    const articles = [
      {
        id: 'kb-001',
        org_id: orgId,
        category_id: 'cat-002',
        title: 'How to reset password',
        content: 'To reset your password:\\n\\n1. Go to the login page\\n2. Click "Forgot Password"\\n3. Enter your email address\\n4. Check your email for the reset link\\n5. Click the link and create a new password',
        tags: ['password', 'account', 'login'],
        created_by: userId
      },
      {
        id: 'kb-002',
        org_id: orgId,
        category_id: 'cat-003',
        title: 'How to create a new project',
        content: 'Creating a new project:\\n\\n1. Navigate to Projects section\\n2. Click "New Project"\\n3. Fill in project details\\n4. Add team members\\n5. Click "Create"',
        tags: ['project', 'create', 'setup'],
        created_by: userId
      },
      {
        id: 'kb-003',
        org_id: orgId,
        category_id: 'cat-004',
        title: 'How to invite team members',
        content: 'To invite team members:\\n\\n1. Go to Team Management\\n2. Click "Invite Members"\\n3. Enter email addresses\\n4. Select roles\\n5. Send invitations',
        tags: ['team', 'invite', 'members'],
        created_by: userId
      },
      {
        id: 'kb-004',
        org_id: orgId,
        category_id: 'cat-005',
        title: 'Budget approval process',
        content: 'Budget approval workflow:\\n\\n1. Submit request through Finance module\\n2. Include justification\\n3. Manager review\\n4. Finance team approval\\n5. Final approval for amounts over ₹50,000',
        tags: ['budget', 'finance', 'approval'],
        created_by: userId
      }
    ];

    for (const article of articles) {
      const existing = await db.dbGet('SELECT id FROM kb_articles WHERE id = ?', [article.id]);
      if (!existing) {
        await db.createKBArticle(article);
        console.log(`  ✅ Article: ${article.title}`);
      }
    }

    console.log('\n✅ Database seeding complete!\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

seed();
