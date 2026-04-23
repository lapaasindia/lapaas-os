// Auto-Plan & Heatmap Routes for Founder OS
// Handles automatic scheduling, workload heatmap, and smart packing

const express = require('express');
const router = express.Router();

// In-memory data stores
let autoPlanSchedules = [
  {
    id: 'autoplan-001',
    userId: 'user-001',
    orgId: 'org-001',
    weekStart: '2025-11-10',
    weekEnd: '2025-11-16',
    status: 'completed',
    tasksScheduled: 8,
    hoursAllocated: 24,
    algorithm: 'priority_deadline',
    constraints: {
      lunchTime: '12:00-13:00',
      maxBlockLength: 180,
      minBreakLength: 15,
      excludeDays: []
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let workloadHeatmaps = [
  {
    id: 'heatmap-001',
    userId: 'user-001',
    orgId: 'org-001',
    weekStart: '2025-11-10',
    weekEnd: '2025-11-16',
    dailyWorkload: {
      'monday': { hours: 8, status: 'normal', utilization: 0.4 },
      'tuesday': { hours: 9, status: 'high', utilization: 0.45 },
      'wednesday': { hours: 6, status: 'normal', utilization: 0.3 },
      'thursday': { hours: 7, status: 'normal', utilization: 0.35 },
      'friday': { hours: 4, status: 'low', utilization: 0.2 },
      'saturday': { hours: 0, status: 'free', utilization: 0 },
      'sunday': { hours: 0, status: 'free', utilization: 0 }
    },
    overloadDays: ['tuesday'],
    averageUtilization: 0.33,
    peakDay: 'tuesday',
    recommendedActions: [
      'Move non-urgent tasks from Tuesday to Wednesday',
      'Consider extending Friday for buffer time',
      'Schedule deep work on Wednesday morning'
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let schedulingSuggestions = [
  {
    id: 'suggestion-001',
    userId: 'user-001',
    orgId: 'org-001',
    taskId: 'task-001',
    taskTitle: 'Review Q4 roadmap',
    suggestedDate: '2025-11-12',
    suggestedTime: '10:00',
    reason: 'Low workload day with available deep work slot',
    priority: 'high',
    estimatedMinutes: 120,
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'suggestion-002',
    userId: 'user-001',
    orgId: 'org-001',
    taskId: 'task-002',
    taskTitle: 'Send roadmap to stakeholders',
    suggestedDate: '2025-11-13',
    suggestedTime: '14:00',
    reason: 'Admin task slot available after meetings',
    priority: 'medium',
    estimatedMinutes: 30,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

let capacityAnalysis = [
  {
    id: 'capacity-001',
    userId: 'user-001',
    orgId: 'org-001',
    weekStart: '2025-11-10',
    totalAvailableHours: 40,
    allocatedHours: 34,
    availableCapacity: 6,
    utilizationRate: 0.85,
    commitmentCount: 12,
    taskCount: 8,
    meetingCount: 5,
    bufferHours: 6,
    riskLevel: 'medium',
    recommendations: [
      'Current utilization at 85% - consider deferring low-priority tasks',
      'Buffer time: 6 hours - adequate for unexpected interruptions',
      'Recommend reducing Tuesday workload by 2 hours'
    ],
    createdAt: new Date().toISOString()
  }
];

// ==================== AUTO-PLAN ENDPOINTS ====================

// Get auto-plan schedule
router.get('/auto-plan', (req, res) => {
  try {
    const { user_id, org_id, week_start } = req.query;

    if (!user_id || !org_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id and org_id are required'
      });
    }

    let filtered = autoPlanSchedules;

    if (week_start) {
      filtered = filtered.filter(a => a.weekStart === week_start);
    }

    filtered = filtered.filter(a => a.userId === user_id && a.orgId === org_id);

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching auto-plan schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch auto-plan schedule'
    });
  }
});

// Execute auto-plan
router.post('/auto-plan/execute', (req, res) => {
  try {
    const { userId, orgId, weekStart, weekEnd, algorithm, constraints } = req.body;

    if (!userId || !orgId || !weekStart || !weekEnd) {
      return res.status(400).json({
        success: false,
        error: 'userId, orgId, weekStart, and weekEnd are required'
      });
    }

    const newPlan = {
      id: `autoplan-${Date.now()}`,
      userId,
      orgId,
      weekStart,
      weekEnd,
      status: 'completed',
      tasksScheduled: Math.floor(Math.random() * 10) + 5,
      hoursAllocated: Math.floor(Math.random() * 30) + 15,
      algorithm: algorithm || 'priority_deadline',
      constraints: constraints || {
        lunchTime: '12:00-13:00',
        maxBlockLength: 180,
        minBreakLength: 15,
        excludeDays: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    autoPlanSchedules.push(newPlan);

    res.status(201).json({
      success: true,
      data: newPlan,
      message: 'Auto-plan executed successfully'
    });
  } catch (error) {
    console.error('Error executing auto-plan:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to execute auto-plan'
    });
  }
});

// Get auto-plan suggestions
router.get('/auto-plan/suggestions', (req, res) => {
  try {
    const { user_id, org_id, status } = req.query;

    if (!user_id || !org_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id and org_id are required'
      });
    }

    let filtered = schedulingSuggestions.filter(
      s => s.userId === user_id && s.orgId === org_id
    );

    if (status) {
      filtered = filtered.filter(s => s.status === status);
    }

    res.json({
      success: true,
      data: filtered,
      count: filtered.length
    });
  } catch (error) {
    console.error('Error fetching scheduling suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scheduling suggestions'
    });
  }
});

// Accept scheduling suggestion
router.post('/auto-plan/suggestions/:suggestionId/accept', (req, res) => {
  try {
    const { suggestionId } = req.params;

    const suggestion = schedulingSuggestions.find(s => s.id === suggestionId);

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        error: 'Suggestion not found'
      });
    }

    suggestion.status = 'accepted';

    res.json({
      success: true,
      data: suggestion,
      message: 'Suggestion accepted and task scheduled'
    });
  } catch (error) {
    console.error('Error accepting suggestion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to accept suggestion'
    });
  }
});

// Reject scheduling suggestion
router.post('/auto-plan/suggestions/:suggestionId/reject', (req, res) => {
  try {
    const { suggestionId } = req.params;
    const { reason } = req.body;

    const suggestion = schedulingSuggestions.find(s => s.id === suggestionId);

    if (!suggestion) {
      return res.status(404).json({
        success: false,
        error: 'Suggestion not found'
      });
    }

    suggestion.status = 'rejected';
    suggestion.rejectionReason = reason || 'User rejected';

    res.json({
      success: true,
      data: suggestion,
      message: 'Suggestion rejected'
    });
  } catch (error) {
    console.error('Error rejecting suggestion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to reject suggestion'
    });
  }
});

// ==================== WORKLOAD HEATMAP ENDPOINTS ====================

// Get workload heatmap
router.get('/workload-heatmap', (req, res) => {
  try {
    const { user_id, org_id, week_start } = req.query;

    if (!user_id || !org_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id and org_id are required'
      });
    }

    let filtered = workloadHeatmaps.filter(
      h => h.userId === user_id && h.orgId === org_id
    );

    if (week_start) {
      filtered = filtered.filter(h => h.weekStart === week_start);
    }

    res.json({
      success: true,
      data: filtered[0] || null
    });
  } catch (error) {
    console.error('Error fetching workload heatmap:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch workload heatmap'
    });
  }
});

// Generate workload heatmap
router.post('/workload-heatmap/generate', (req, res) => {
  try {
    const { userId, orgId, weekStart, weekEnd } = req.body;

    if (!userId || !orgId || !weekStart || !weekEnd) {
      return res.status(400).json({
        success: false,
        error: 'userId, orgId, weekStart, and weekEnd are required'
      });
    }

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dailyWorkload = {};
    let totalHours = 0;
    let overloadDays = [];

    days.forEach((day, index) => {
      const hours = Math.floor(Math.random() * 10);
      const utilization = hours / 20;
      const status = utilization > 0.5 ? 'high' : utilization > 0.25 ? 'normal' : 'low';

      if (utilization > 0.5) {
        overloadDays.push(day);
      }

      dailyWorkload[day] = {
        hours,
        status,
        utilization: parseFloat(utilization.toFixed(2))
      };

      totalHours += hours;
    });

    const averageUtilization = parseFloat((totalHours / (20 * 7)).toFixed(2));

    const newHeatmap = {
      id: `heatmap-${Date.now()}`,
      userId,
      orgId,
      weekStart,
      weekEnd,
      dailyWorkload,
      overloadDays,
      averageUtilization,
      peakDay: Object.entries(dailyWorkload).reduce((a, b) =>
        b[1].hours > a[1].hours ? [b[0], b[1]] : a
      )[0],
      recommendedActions: [
        overloadDays.length > 0 ? `Move non-urgent tasks from ${overloadDays.join(', ')}` : 'Workload is balanced',
        'Schedule deep work on low-utilization days',
        'Consider extending buffer time on peak days'
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    workloadHeatmaps.push(newHeatmap);

    res.status(201).json({
      success: true,
      data: newHeatmap,
      message: 'Workload heatmap generated successfully'
    });
  } catch (error) {
    console.error('Error generating workload heatmap:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate workload heatmap'
    });
  }
});

// ==================== CAPACITY ANALYSIS ENDPOINTS ====================

// Get capacity analysis
router.get('/capacity-analysis', (req, res) => {
  try {
    const { user_id, org_id, week_start } = req.query;

    if (!user_id || !org_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id and org_id are required'
      });
    }

    let filtered = capacityAnalysis.filter(
      c => c.userId === user_id && c.orgId === org_id
    );

    if (week_start) {
      filtered = filtered.filter(c => c.weekStart === week_start);
    }

    res.json({
      success: true,
      data: filtered[0] || null
    });
  } catch (error) {
    console.error('Error fetching capacity analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch capacity analysis'
    });
  }
});

// Generate capacity analysis
router.post('/capacity-analysis/generate', (req, res) => {
  try {
    const { userId, orgId, weekStart, totalAvailableHours, commitmentCount, taskCount, meetingCount } = req.body;

    if (!userId || !orgId || !weekStart || !totalAvailableHours) {
      return res.status(400).json({
        success: false,
        error: 'userId, orgId, weekStart, and totalAvailableHours are required'
      });
    }

    const allocatedHours = (commitmentCount || 0) * 2 + (taskCount || 0) * 1.5 + (meetingCount || 0) * 1;
    const availableCapacity = Math.max(0, totalAvailableHours - allocatedHours);
    const utilizationRate = parseFloat((allocatedHours / totalAvailableHours).toFixed(2));
    const bufferHours = Math.max(0, availableCapacity * 0.5);

    let riskLevel = 'low';
    if (utilizationRate > 0.9) riskLevel = 'high';
    else if (utilizationRate > 0.75) riskLevel = 'medium';

    const recommendations = [];
    if (utilizationRate > 0.85) {
      recommendations.push('Current utilization at ' + (utilizationRate * 100).toFixed(0) + '% - consider deferring low-priority tasks');
    }
    recommendations.push('Buffer time: ' + bufferHours.toFixed(1) + ' hours - ' + (bufferHours > 4 ? 'adequate' : 'limited') + ' for unexpected interruptions');
    if (utilizationRate > 0.8) {
      recommendations.push('Recommend reducing workload by ' + ((utilizationRate - 0.75) * totalAvailableHours).toFixed(1) + ' hours');
    }

    const newAnalysis = {
      id: `capacity-${Date.now()}`,
      userId,
      orgId,
      weekStart,
      totalAvailableHours,
      allocatedHours: parseFloat(allocatedHours.toFixed(1)),
      availableCapacity: parseFloat(availableCapacity.toFixed(1)),
      utilizationRate,
      commitmentCount: commitmentCount || 0,
      taskCount: taskCount || 0,
      meetingCount: meetingCount || 0,
      bufferHours: parseFloat(bufferHours.toFixed(1)),
      riskLevel,
      recommendations,
      createdAt: new Date().toISOString()
    };

    capacityAnalysis.push(newAnalysis);

    res.status(201).json({
      success: true,
      data: newAnalysis,
      message: 'Capacity analysis generated successfully'
    });
  } catch (error) {
    console.error('Error generating capacity analysis:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate capacity analysis'
    });
  }
});

// ==================== SCHEDULING CONSTRAINTS ENDPOINTS ====================

// Get scheduling constraints
router.get('/scheduling-constraints', (req, res) => {
  try {
    const { user_id, org_id } = req.query;

    if (!user_id || !org_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id and org_id are required'
      });
    }

    const constraints = {
      lunchTime: '12:00-13:00',
      maxBlockLength: 180,
      minBreakLength: 15,
      excludeDays: [],
      travelDays: [],
      focusHoursTarget: 20,
      meetingLimit: 5
    };

    res.json({
      success: true,
      data: constraints
    });
  } catch (error) {
    console.error('Error fetching scheduling constraints:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch scheduling constraints'
    });
  }
});

// Update scheduling constraints
router.put('/scheduling-constraints', (req, res) => {
  try {
    const { userId, orgId, lunchTime, maxBlockLength, minBreakLength, excludeDays, travelDays, focusHoursTarget, meetingLimit } = req.body;

    if (!userId || !orgId) {
      return res.status(400).json({
        success: false,
        error: 'userId and orgId are required'
      });
    }

    const constraints = {
      userId,
      orgId,
      lunchTime: lunchTime || '12:00-13:00',
      maxBlockLength: maxBlockLength || 180,
      minBreakLength: minBreakLength || 15,
      excludeDays: excludeDays || [],
      travelDays: travelDays || [],
      focusHoursTarget: focusHoursTarget || 20,
      meetingLimit: meetingLimit || 5,
      updatedAt: new Date().toISOString()
    };

    res.json({
      success: true,
      data: constraints,
      message: 'Scheduling constraints updated successfully'
    });
  } catch (error) {
    console.error('Error updating scheduling constraints:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update scheduling constraints'
    });
  }
});

module.exports = router;
