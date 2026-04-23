// Daily Startup/Shutdown Routes for Founder OS
// Handles quick flows for setting Top-3, reconciling day, and journaling

const express = require('express');
const router = express.Router();

// In-memory data stores
let startupFlows = [
  {
    id: 'startup-001',
    userId: 'user-001',
    orgId: 'org-001',
    date: '2025-11-15',
    completedAt: new Date().toISOString(),
    duration: 45,
    top3Commitments: [
      {
        title: 'Complete product roadmap',
        effortMinutes: 120,
        priority: 'P1'
      },
      {
        title: 'Review team proposals',
        effortMinutes: 90,
        priority: 'P2'
      },
      {
        title: 'Budget review',
        effortMinutes: 60,
        priority: 'P1'
      }
    ],
    focusHoursTarget: 20,
    notes: 'Ready for productive day',
    status: 'completed',
    createdAt: new Date().toISOString()
  }
];

let shutdownFlows = [
  {
    id: 'shutdown-001',
    userId: 'user-001',
    orgId: 'org-001',
    date: '2025-11-14',
    completedAt: new Date(Date.now() - 86400000).toISOString(),
    duration: 30,
    focusHoursPlanned: 20,
    focusHoursActual: 16,
    completionRate: 0.8,
    tasksCompleted: 8,
    tasksTotal: 12,
    completionPercentage: 0.67,
    keyAccomplishments: [
      'Completed Q4 roadmap review',
      'Approved budget allocation',
      'Team sync meeting'
    ],
    challenges: [
      'More interruptions than expected',
      'Meeting ran over by 30 minutes'
    ],
    tomorrowPriorities: [
      'Follow up on budget decisions',
      'Prepare stakeholder presentation',
      'Review team feedback'
    ],
    journalEntry: 'Good day overall. Made progress on roadmap but had more interruptions than planned. Need to protect focus time better tomorrow.',
    status: 'completed',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

let dailyScores = [
  {
    id: 'score-001',
    userId: 'user-001',
    orgId: 'org-001',
    date: '2025-11-14',
    focusScore: 0.8,
    productivityScore: 0.75,
    wellbeingScore: 0.7,
    overallScore: 0.75,
    breakdown: {
      focusHours: { planned: 20, actual: 16, score: 0.8 },
      tasksCompleted: { planned: 12, actual: 8, score: 0.67 },
      interruptions: { target: 5, actual: 8, score: 0.63 },
      deepWork: { target: 10, actual: 8, score: 0.8 },
      meetings: { target: 5, actual: 6, score: 0.83 }
    },
    insights: [
      'Focus time was good but interrupted more than expected',
      'Task completion rate at 67% - consider breaking tasks smaller',
      'Deep work sessions were productive',
      'One extra meeting impacted schedule'
    ],
    recommendations: [
      'Block focus time earlier in day',
      'Set stricter meeting limits',
      'Use DND mode for deep work',
      'Batch interruptions into office hours'
    ],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

let weeklyRecaps = [
  {
    id: 'recap-001',
    userId: 'user-001',
    orgId: 'org-001',
    weekStart: '2025-11-10',
    weekEnd: '2025-11-16',
    focusHoursPlanned: 100,
    focusHoursActual: 80,
    completionRate: 0.8,
    tasksCompleted: 35,
    tasksTotal: 50,
    completionPercentage: 0.7,
    meetingHours: 12,
    interruptionCount: 28,
    topAccomplishments: [
      'Completed Q4 roadmap',
      'Approved budget',
      'Onboarded new team member'
    ],
    areasForImprovement: [
      'Reduce meeting time by 2 hours',
      'Protect focus time better',
      'Batch interruptions'
    ],
    nextWeekFocus: [
      'Implement roadmap changes',
      'Execute budget plan',
      'Team training sessions'
    ],
    createdAt: new Date().toISOString()
  }
];

// ==================== STARTUP FLOW ENDPOINTS ====================

// Get startup flow
router.get('/startup-flows', (req, res) => {
  try {
    const { user_id, org_id, date } = req.query;

    if (!user_id || !org_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id and org_id are required'
      });
    }

    let filtered = startupFlows.filter(s => s.userId === user_id && s.orgId === org_id);

    if (date) {
      filtered = filtered.filter(s => s.date === date);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching startup flows:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch startup flows'
    });
  }
});

// Start startup flow
router.post('/startup-flows/start', (req, res) => {
  try {
    const { userId, orgId, date } = req.body;

    if (!userId || !orgId || !date) {
      return res.status(400).json({
        success: false,
        error: 'userId, orgId, and date are required'
      });
    }

    const newFlow = {
      id: `startup-${Date.now()}`,
      userId,
      orgId,
      date,
      completedAt: null,
      duration: 0,
      top3Commitments: [],
      focusHoursTarget: 20,
      notes: '',
      status: 'in_progress',
      createdAt: new Date().toISOString()
    };

    startupFlows.push(newFlow);

    res.status(201).json({
      success: true,
      data: newFlow,
      message: 'Startup flow started'
    });
  } catch (error) {
    console.error('Error starting startup flow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start startup flow'
    });
  }
});

// Complete startup flow
router.post('/startup-flows/:flowId/complete', (req, res) => {
  try {
    const { flowId } = req.params;
    const { top3Commitments, focusHoursTarget, notes } = req.body;

    const flow = startupFlows.find(s => s.id === flowId);

    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Startup flow not found'
      });
    }

    flow.status = 'completed';
    flow.completedAt = new Date().toISOString();
    flow.duration = Math.round((new Date(flow.completedAt) - new Date(flow.createdAt)) / 60000);
    flow.top3Commitments = top3Commitments || [];
    flow.focusHoursTarget = focusHoursTarget || 20;
    flow.notes = notes || '';

    res.json({
      success: true,
      data: flow,
      message: 'Startup flow completed'
    });
  } catch (error) {
    console.error('Error completing startup flow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete startup flow'
    });
  }
});

// ==================== SHUTDOWN FLOW ENDPOINTS ====================

// Get shutdown flow
router.get('/shutdown-flows', (req, res) => {
  try {
    const { user_id, org_id, date } = req.query;

    if (!user_id || !org_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id and org_id are required'
      });
    }

    let filtered = shutdownFlows.filter(s => s.userId === user_id && s.orgId === org_id);

    if (date) {
      filtered = filtered.filter(s => s.date === date);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching shutdown flows:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shutdown flows'
    });
  }
});

// Start shutdown flow
router.post('/shutdown-flows/start', (req, res) => {
  try {
    const { userId, orgId, date, focusHoursPlanned, tasksTotal } = req.body;

    if (!userId || !orgId || !date) {
      return res.status(400).json({
        success: false,
        error: 'userId, orgId, and date are required'
      });
    }

    const newFlow = {
      id: `shutdown-${Date.now()}`,
      userId,
      orgId,
      date,
      completedAt: null,
      duration: 0,
      focusHoursPlanned: focusHoursPlanned || 20,
      focusHoursActual: 0,
      completionRate: 0,
      tasksCompleted: 0,
      tasksTotal: tasksTotal || 10,
      completionPercentage: 0,
      keyAccomplishments: [],
      challenges: [],
      tomorrowPriorities: [],
      journalEntry: '',
      status: 'in_progress',
      createdAt: new Date().toISOString()
    };

    shutdownFlows.push(newFlow);

    res.status(201).json({
      success: true,
      data: newFlow,
      message: 'Shutdown flow started'
    });
  } catch (error) {
    console.error('Error starting shutdown flow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start shutdown flow'
    });
  }
});

// Complete shutdown flow
router.post('/shutdown-flows/:flowId/complete', (req, res) => {
  try {
    const { flowId } = req.params;
    const { focusHoursActual, tasksCompleted, keyAccomplishments, challenges, tomorrowPriorities, journalEntry } = req.body;

    const flow = shutdownFlows.find(s => s.id === flowId);

    if (!flow) {
      return res.status(404).json({
        success: false,
        error: 'Shutdown flow not found'
      });
    }

    flow.status = 'completed';
    flow.completedAt = new Date().toISOString();
    flow.duration = Math.round((new Date(flow.completedAt) - new Date(flow.createdAt)) / 60000);
    flow.focusHoursActual = focusHoursActual || 0;
    flow.tasksCompleted = tasksCompleted || 0;
    flow.completionRate = flow.focusHoursPlanned > 0 ? flow.focusHoursActual / flow.focusHoursPlanned : 0;
    flow.completionPercentage = flow.tasksTotal > 0 ? flow.tasksCompleted / flow.tasksTotal : 0;
    flow.keyAccomplishments = keyAccomplishments || [];
    flow.challenges = challenges || [];
    flow.tomorrowPriorities = tomorrowPriorities || [];
    flow.journalEntry = journalEntry || '';

    res.json({
      success: true,
      data: flow,
      message: 'Shutdown flow completed'
    });
  } catch (error) {
    console.error('Error completing shutdown flow:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to complete shutdown flow'
    });
  }
});

// ==================== DAILY SCORE ENDPOINTS ====================

// Get daily score
router.get('/daily-scores', (req, res) => {
  try {
    const { user_id, org_id, date } = req.query;

    if (!user_id || !org_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id and org_id are required'
      });
    }

    let filtered = dailyScores.filter(s => s.userId === user_id && s.orgId === org_id);

    if (date) {
      filtered = filtered.filter(s => s.date === date);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching daily scores:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily scores'
    });
  }
});

// Generate daily score
router.post('/daily-scores/generate', (req, res) => {
  try {
    const { userId, orgId, date, focusHoursPlanned, focusHoursActual, tasksPlanned, tasksCompleted, interruptionCount } = req.body;

    if (!userId || !orgId || !date) {
      return res.status(400).json({
        success: false,
        error: 'userId, orgId, and date are required'
      });
    }

    const focusScore = focusHoursPlanned > 0 ? Math.min(1, focusHoursActual / focusHoursPlanned) : 0;
    const taskScore = tasksPlanned > 0 ? tasksCompleted / tasksPlanned : 0;
    const interruptionScore = Math.max(0, 1 - (interruptionCount || 0) / 10);
    const wellbeingScore = (focusScore + taskScore + interruptionScore) / 3;

    const newScore = {
      id: `score-${Date.now()}`,
      userId,
      orgId,
      date,
      focusScore: parseFloat(focusScore.toFixed(2)),
      productivityScore: parseFloat(taskScore.toFixed(2)),
      wellbeingScore: parseFloat(wellbeingScore.toFixed(2)),
      overallScore: parseFloat(((focusScore + taskScore + wellbeingScore) / 3).toFixed(2)),
      breakdown: {
        focusHours: { planned: focusHoursPlanned || 0, actual: focusHoursActual || 0, score: parseFloat(focusScore.toFixed(2)) },
        tasksCompleted: { planned: tasksPlanned || 0, actual: tasksCompleted || 0, score: parseFloat(taskScore.toFixed(2)) },
        interruptions: { target: 5, actual: interruptionCount || 0, score: parseFloat(interruptionScore.toFixed(2)) }
      },
      insights: [],
      recommendations: [],
      createdAt: new Date().toISOString()
    };

    // Generate insights
    if (focusScore < 0.7) newScore.insights.push('Focus time was below target');
    if (taskScore < 0.7) newScore.insights.push('Task completion rate was below target');
    if (interruptionCount > 8) newScore.insights.push('More interruptions than expected');

    // Generate recommendations
    if (focusScore < 0.7) newScore.recommendations.push('Block focus time earlier in day');
    if (taskScore < 0.7) newScore.recommendations.push('Break tasks into smaller chunks');
    if (interruptionCount > 8) newScore.recommendations.push('Use DND mode for deep work');

    dailyScores.push(newScore);

    res.status(201).json({
      success: true,
      data: newScore,
      message: 'Daily score generated'
    });
  } catch (error) {
    console.error('Error generating daily score:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate daily score'
    });
  }
});

// ==================== WEEKLY RECAP ENDPOINTS ====================

// Get weekly recap
router.get('/weekly-recaps', (req, res) => {
  try {
    const { user_id, org_id, week_start } = req.query;

    if (!user_id || !org_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id and org_id are required'
      });
    }

    let filtered = weeklyRecaps.filter(r => r.userId === user_id && r.orgId === org_id);

    if (week_start) {
      filtered = filtered.filter(r => r.weekStart === week_start);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching weekly recaps:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch weekly recaps'
    });
  }
});

// Generate weekly recap
router.post('/weekly-recaps/generate', (req, res) => {
  try {
    const { userId, orgId, weekStart, weekEnd, focusHoursPlanned, focusHoursActual, tasksCompleted, tasksTotal, meetingHours, interruptionCount } = req.body;

    if (!userId || !orgId || !weekStart || !weekEnd) {
      return res.status(400).json({
        success: false,
        error: 'userId, orgId, weekStart, and weekEnd are required'
      });
    }

    const completionRate = focusHoursPlanned > 0 ? focusHoursActual / focusHoursPlanned : 0;
    const completionPercentage = tasksTotal > 0 ? tasksCompleted / tasksTotal : 0;

    const newRecap = {
      id: `recap-${Date.now()}`,
      userId,
      orgId,
      weekStart,
      weekEnd,
      focusHoursPlanned: focusHoursPlanned || 100,
      focusHoursActual: focusHoursActual || 80,
      completionRate: parseFloat(completionRate.toFixed(2)),
      tasksCompleted: tasksCompleted || 35,
      tasksTotal: tasksTotal || 50,
      completionPercentage: parseFloat(completionPercentage.toFixed(2)),
      meetingHours: meetingHours || 10,
      interruptionCount: interruptionCount || 25,
      topAccomplishments: [],
      areasForImprovement: [],
      nextWeekFocus: [],
      createdAt: new Date().toISOString()
    };

    // Generate insights
    if (completionRate < 0.8) newRecap.areasForImprovement.push('Increase focus time by 20%');
    if (completionPercentage < 0.7) newRecap.areasForImprovement.push('Improve task completion rate');
    if (meetingHours > 12) newRecap.areasForImprovement.push('Reduce meeting time');

    weeklyRecaps.push(newRecap);

    res.status(201).json({
      success: true,
      data: newRecap,
      message: 'Weekly recap generated'
    });
  } catch (error) {
    console.error('Error generating weekly recap:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate weekly recap'
    });
  }
});

module.exports = router;
