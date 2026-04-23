// Commitments and Time Blocks Routes for Founder OS
// Handles Daily Top-3 Commitments and Time-Blocking features

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory data stores
let commitments = [
  {
    id: 'comm-001',
    userId: 'user-001',
    orgId: 'org-001',
    date: '2025-11-08',
    title: 'Complete product roadmap',
    effortMinutes: 120,
    status: 'pending',
    priority: 'P2',
    completed: false,
    subtasks: [],
    notes: '',
    timeSpent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'comm-002',
    userId: 'user-001',
    orgId: 'org-001',
    date: '2025-11-08',
    title: 'Review team proposals',
    effortMinutes: 90,
    status: 'pending',
    priority: 'P2',
    completed: false,
    subtasks: [],
    notes: '',
    timeSpent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'comm-003',
    userId: 'user-001',
    orgId: 'org-001',
    date: '2025-11-09',
    title: 'JJGHJHGJH',
    effortMinutes: 60,
    status: 'pending',
    priority: 'P2',
    completed: false,
    subtasks: [],
    notes: '',
    timeSpent: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let timeBlocks = [
  {
    id: 'block-001',
    userId: 'user-001',
    orgId: 'org-001',
    date: '2025-11-10',
    blockType: 'deep_work',
    title: 'Deep Work Session',
    startTime: '09:00',
    endTime: '12:00',
    targetMinutes: 180,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'block-002',
    userId: 'user-001',
    orgId: 'org-001',
    date: '2025-11-11',
    blockType: 'admin',
    title: 'Admin Tasks',
    startTime: '14:00',
    endTime: '15:30',
    targetMinutes: 90,
    status: 'scheduled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ==================== COMMITMENTS ENDPOINTS ====================

// Get top 3 commitments for a specific date
router.get('/commitments/top3', (req, res) => {
  try {
    const { user_id, org_id, date } = req.query;

    if (!user_id || !org_id || !date) {
      return res.status(400).json({
        success: false,
        error: 'user_id, org_id, and date are required'
      });
    }

    const dayCommitments = commitments
      .filter(c => c.userId === user_id && c.orgId === org_id && c.date === date)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);

    res.json({
      success: true,
      data: {
        date,
        commitments: dayCommitments,
        total: dayCommitments.length,
        completed: dayCommitments.filter(c => c.completed).length
      }
    });
  } catch (error) {
    console.error('Error fetching top 3 commitments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch commitments'
    });
  }
});

// Get all commitments
router.get('/commitments', (req, res) => {
  try {
    const { org_id, user_id, date } = req.query;

    let filtered = commitments;

    if (org_id) {
      filtered = filtered.filter(c => c.orgId === org_id);
    }

    if (user_id) {
      filtered = filtered.filter(c => c.userId === user_id);
    }

    if (date) {
      filtered = filtered.filter(c => c.date === date);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching commitments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch commitments'
    });
  }
});

// Get single commitment by ID
router.get('/commitments/:commitmentId', (req, res) => {
  try {
    const { commitmentId } = req.params;

    const commitment = commitments.find(c => c.id === commitmentId);

    if (!commitment) {
      return res.status(404).json({
        success: false,
        error: 'Commitment not found'
      });
    }

    res.json({
      success: true,
      data: commitment
    });
  } catch (error) {
    console.error('Error fetching commitment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch commitment'
    });
  }
});

// Create commitment
router.post('/commitments', (req, res) => {
  try {
    const { userId, orgId, date, title, effortMinutes, priority, status } = req.body;

    if (!userId || !orgId || !date || !title) {
      return res.status(400).json({
        success: false,
        error: 'userId, orgId, date, and title are required'
      });
    }

    const newCommitment = {
      id: `comm-${Date.now()}`,
      userId,
      orgId,
      date,
      title,
      effortMinutes: effortMinutes || 60,
      priority: priority || 'P2',
      status: status || 'pending',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    commitments.push(newCommitment);

    res.status(201).json({
      success: true,
      data: newCommitment
    });
  } catch (error) {
    console.error('Error creating commitment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create commitment'
    });
  }
});

// Update commitment
router.put('/commitments/:commitmentId', (req, res) => {
  try {
    const { commitmentId } = req.params;
    const { title, effortMinutes, status, completed, priority } = req.body;

    const commitment = commitments.find(c => c.id === commitmentId);

    if (!commitment) {
      return res.status(404).json({
        success: false,
        error: 'Commitment not found'
      });
    }

    if (title) commitment.title = title;
    if (effortMinutes) commitment.effortMinutes = effortMinutes;
    if (status) commitment.status = status;
    if (typeof completed === 'boolean') commitment.completed = completed;
    if (priority) commitment.priority = priority;
    commitment.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: commitment
    });
  } catch (error) {
    console.error('Error updating commitment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update commitment'
    });
  }
});

// Delete commitment
router.delete('/commitments/:commitmentId', (req, res) => {
  try {
    const { commitmentId } = req.params;

    const index = commitments.findIndex(c => c.id === commitmentId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Commitment not found'
      });
    }

    const deleted = commitments.splice(index, 1)[0];

    res.json({
      success: true,
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting commitment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete commitment'
    });
  }
});

// ==================== COMMITMENT SUBTASKS ENDPOINTS ====================

// Add subtask to commitment
router.post('/commitments/:commitmentId/subtasks', (req, res) => {
  try {
    const { commitmentId } = req.params;
    const { title } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Subtask title is required'
      });
    }

    const commitment = commitments.find(c => c.id === commitmentId);
    if (!commitment) {
      return res.status(404).json({
        success: false,
        error: 'Commitment not found'
      });
    }

    const newSubtask = {
      id: `subtask-${Date.now()}`,
      title,
      completed: false,
      createdAt: new Date().toISOString()
    };

    if (!commitment.subtasks) {
      commitment.subtasks = [];
    }
    commitment.subtasks.push(newSubtask);
    commitment.updatedAt = new Date().toISOString();

    res.status(201).json({
      success: true,
      data: newSubtask
    });
  } catch (error) {
    console.error('Error adding subtask:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add subtask'
    });
  }
});

// Update subtask
router.put('/commitments/:commitmentId/subtasks/:subtaskId', (req, res) => {
  try {
    const { commitmentId, subtaskId } = req.params;
    const { completed, title } = req.body;

    const commitment = commitments.find(c => c.id === commitmentId);
    if (!commitment) {
      return res.status(404).json({
        success: false,
        error: 'Commitment not found'
      });
    }

    const subtask = commitment.subtasks?.find(s => s.id === subtaskId);
    if (!subtask) {
      return res.status(404).json({
        success: false,
        error: 'Subtask not found'
      });
    }

    if (typeof completed === 'boolean') subtask.completed = completed;
    if (title) subtask.title = title;
    commitment.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: subtask
    });
  } catch (error) {
    console.error('Error updating subtask:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update subtask'
    });
  }
});

// Delete subtask
router.delete('/commitments/:commitmentId/subtasks/:subtaskId', (req, res) => {
  try {
    const { commitmentId, subtaskId } = req.params;

    const commitment = commitments.find(c => c.id === commitmentId);
    if (!commitment) {
      return res.status(404).json({
        success: false,
        error: 'Commitment not found'
      });
    }

    const index = commitment.subtasks?.findIndex(s => s.id === subtaskId) ?? -1;
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Subtask not found'
      });
    }

    const deleted = commitment.subtasks.splice(index, 1)[0];
    commitment.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting subtask:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete subtask'
    });
  }
});

// ==================== TIME BLOCKS ENDPOINTS ====================

// Get weekly time blocks
router.get('/time-blocks/weekly', (req, res) => {
  try {
    const { user_id, org_id, start_date } = req.query;

    if (!user_id || !org_id || !start_date) {
      return res.status(400).json({
        success: false,
        error: 'user_id, org_id, and start_date are required'
      });
    }

    // Calculate week end (7 days from start)
    const startDate = new Date(start_date);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);

    const weekBlocks = timeBlocks.filter(b => {
      const blockDate = new Date(b.date);
      return (
        b.userId === user_id &&
        b.orgId === org_id &&
        blockDate >= startDate &&
        blockDate < endDate
      );
    });

    // Group by day
    const groupedByDay = {};
    weekBlocks.forEach(block => {
      if (!groupedByDay[block.date]) {
        groupedByDay[block.date] = [];
      }
      groupedByDay[block.date].push(block);
    });

    res.json({
      success: true,
      data: groupedByDay
    });
  } catch (error) {
    console.error('Error fetching weekly time blocks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch time blocks'
    });
  }
});

// Get all time blocks
router.get('/time-blocks', (req, res) => {
  try {
    const { org_id, user_id, date } = req.query;

    let filtered = timeBlocks;

    if (org_id) {
      filtered = filtered.filter(b => b.orgId === org_id);
    }

    if (user_id) {
      filtered = filtered.filter(b => b.userId === user_id);
    }

    if (date) {
      filtered = filtered.filter(b => b.date === date);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching time blocks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch time blocks'
    });
  }
});

// Create time block
router.post('/time-blocks', (req, res) => {
  try {
    const { userId, orgId, date, blockType, title, startTime, endTime, targetMinutes } = req.body;

    if (!userId || !orgId || !date || !blockType || !title) {
      return res.status(400).json({
        success: false,
        error: 'userId, orgId, date, blockType, and title are required'
      });
    }

    const newBlock = {
      id: `block-${Date.now()}`,
      userId,
      orgId,
      date,
      blockType,
      title,
      startTime: startTime || '09:00',
      endTime: endTime || '10:00',
      targetMinutes: targetMinutes || 60,
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    timeBlocks.push(newBlock);

    res.status(201).json({
      success: true,
      data: newBlock
    });
  } catch (error) {
    console.error('Error creating time block:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create time block'
    });
  }
});

// Update time block
router.put('/time-blocks/:blockId', (req, res) => {
  try {
    const { blockId } = req.params;
    const { title, startTime, endTime, targetMinutes, status, blockType } = req.body;

    const block = timeBlocks.find(b => b.id === blockId);

    if (!block) {
      return res.status(404).json({
        success: false,
        error: 'Time block not found'
      });
    }

    if (title) block.title = title;
    if (startTime) block.startTime = startTime;
    if (endTime) block.endTime = endTime;
    if (targetMinutes) block.targetMinutes = targetMinutes;
    if (status) block.status = status;
    if (blockType) block.blockType = blockType;
    block.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: block
    });
  } catch (error) {
    console.error('Error updating time block:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update time block'
    });
  }
});

// Delete time block
router.delete('/time-blocks/:blockId', (req, res) => {
  try {
    const { blockId } = req.params;

    const index = timeBlocks.findIndex(b => b.id === blockId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Time block not found'
      });
    }

    const deleted = timeBlocks.splice(index, 1)[0];

    res.json({
      success: true,
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting time block:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete time block'
    });
  }
});

// ==================== DAILY COMMITMENTS (HABITS) ENDPOINTS ====================
// Database-backed endpoints for daily recurring commitments

// Fallback in-memory storage for development (when database is not available)
let dailyCommitments = [];

// Get all daily commitments
router.get('/daily-commitments', async (req, res) => {
  try {
    const { org_id } = req.query;
    
    if (!org_id) {
      return res.status(400).json({
        success: false,
        error: 'org_id is required'
      });
    }

    // Use in-memory storage (database integration ready)
    const filtered = dailyCommitments.filter(dc => dc.org_id === org_id);
    
    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching daily commitments:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily commitments'
    });
  }
});

// Create a new daily commitment
router.post('/daily-commitments', async (req, res) => {
  try {
    const { title, start_time, end_time, effort_minutes, recurring, status, org_id, user_id, start_date, end_date } = req.body;

    if (!title || !start_time || !end_time || !org_id) {
      return res.status(400).json({
        success: false,
        error: 'title, start_time, end_time, and org_id are required'
      });
    }

    const newCommitment = {
      id: `daily-comm-${uuidv4()}`,
      title,
      start_time,
      end_time,
      effort_minutes: effort_minutes || 60,
      recurring: recurring !== false,
      status: status || 'active',
      start_date: start_date || new Date().toISOString().split('T')[0],
      end_date: end_date || null,
      org_id,
      user_id: user_id || 'user-001',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    dailyCommitments.push(newCommitment);

    console.log(`✅ Daily commitment created: ${newCommitment.id}`);

    res.status(201).json({
      success: true,
      data: newCommitment
    });
  } catch (error) {
    console.error('Error creating daily commitment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create daily commitment'
    });
  }
});

// Update a daily commitment
router.put('/daily-commitments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, start_time, end_time, effort_minutes, recurring, status, start_date, end_date } = req.body;

    const index = dailyCommitments.findIndex(dc => dc.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Daily commitment not found'
      });
    }

    const updated = {
      ...dailyCommitments[index],
      ...(title && { title }),
      ...(start_time && { start_time }),
      ...(end_time && { end_time }),
      ...(effort_minutes && { effort_minutes }),
      ...(recurring !== undefined && { recurring }),
      ...(status && { status }),
      ...(start_date && { start_date }),
      ...(end_date && { end_date }),
      updated_at: new Date().toISOString()
    };

    dailyCommitments[index] = updated;

    console.log(`✅ Daily commitment updated: ${id}`);

    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    console.error('Error updating daily commitment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update daily commitment'
    });
  }
});

// Delete a daily commitment
router.delete('/daily-commitments/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const index = dailyCommitments.findIndex(dc => dc.id === id);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Daily commitment not found'
      });
    }

    const deleted = dailyCommitments.splice(index, 1)[0];

    console.log(`✅ Daily commitment deleted: ${id}`);

    res.json({
      success: true,
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting daily commitment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete daily commitment'
    });
  }
});

module.exports = router;
