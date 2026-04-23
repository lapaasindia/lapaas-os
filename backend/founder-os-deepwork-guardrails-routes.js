// Deep-Work Guardrails Routes for Founder OS
// Handles focus mode, notifications, website blocking, DND, and breach logging

const express = require('express');
const router = express.Router();

// In-memory data stores
let focusSessions = [
  {
    id: 'focus-001',
    userId: 'user-001',
    orgId: 'org-001',
    startTime: new Date(Date.now() - 30 * 60000).toISOString(),
    endTime: null,
    status: 'active',
    targetMinutes: 120,
    actualMinutes: 30,
    blockedWebsites: ['twitter.com', 'facebook.com', 'youtube.com'],
    p1Whitelist: ['user-002', 'user-003'],
    dndEnabled: true,
    breachCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let dndSettings = [
  {
    id: 'dnd-001',
    userId: 'user-001',
    orgId: 'org-001',
    enabled: true,
    startTime: '09:00',
    endTime: '12:00',
    allowP1: true,
    allowWhitelist: true,
    whitelistUsers: ['user-002', 'user-003'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let breachLogs = [
  {
    id: 'breach-001',
    userId: 'user-001',
    orgId: 'org-001',
    focusSessionId: 'focus-001',
    breachType: 'notification',
    source: 'Slack',
    timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
    reason: 'P2 message from team',
    overrideReason: 'Important update',
    createdAt: new Date().toISOString()
  }
];

let websiteBlocklist = [
  {
    id: 'block-001',
    userId: 'user-001',
    orgId: 'org-001',
    website: 'twitter.com',
    category: 'social_media',
    severity: 'high',
    createdAt: new Date().toISOString()
  },
  {
    id: 'block-002',
    userId: 'user-001',
    orgId: 'org-001',
    website: 'facebook.com',
    category: 'social_media',
    severity: 'high',
    createdAt: new Date().toISOString()
  },
  {
    id: 'block-003',
    userId: 'user-001',
    orgId: 'org-001',
    website: 'youtube.com',
    category: 'video',
    severity: 'medium',
    createdAt: new Date().toISOString()
  }
];

let p1Whitelists = [
  {
    id: 'whitelist-001',
    userId: 'user-001',
    orgId: 'org-001',
    whitelistUsers: ['user-002', 'user-003'],
    whitelistEmails: ['ceo@company.com', 'cfo@company.com'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let focusMetrics = {
  'user-001': {
    userId: 'user-001',
    orgId: 'org-001',
    totalFocusHours: 24,
    targetFocusHours: 20,
    completionRate: 1.2,
    breachCount: 1,
    averageSessionLength: 120,
    longestStreak: 5,
    lastUpdated: new Date().toISOString()
  }
};

// ==================== FOCUS SESSIONS ENDPOINTS ====================

// Get active focus session
router.get('/focus-sessions/active', (req, res) => {
  try {
    const { user_id, org_id } = req.query;

    if (!user_id || !org_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id and org_id are required'
      });
    }

    const activeSession = focusSessions.find(
      s => s.userId === user_id && s.orgId === org_id && s.status === 'active'
    );

    res.json({
      success: true,
      data: activeSession || null
    });
  } catch (error) {
    console.error('Error fetching active focus session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch focus session'
    });
  }
});

// Get all focus sessions
router.get('/focus-sessions', (req, res) => {
  try {
    const { user_id, org_id, status } = req.query;

    let filtered = focusSessions;

    if (user_id) {
      filtered = filtered.filter(s => s.userId === user_id);
    }

    if (org_id) {
      filtered = filtered.filter(s => s.orgId === org_id);
    }

    if (status) {
      filtered = filtered.filter(s => s.status === status);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching focus sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch focus sessions'
    });
  }
});

// Start focus session
router.post('/focus-sessions/start', (req, res) => {
  try {
    const { userId, orgId, targetMinutes, blockedWebsites, p1Whitelist } = req.body;

    if (!userId || !orgId || !targetMinutes) {
      return res.status(400).json({
        success: false,
        error: 'userId, orgId, and targetMinutes are required'
      });
    }

    // End any active session
    const activeSession = focusSessions.find(
      s => s.userId === userId && s.orgId === orgId && s.status === 'active'
    );
    if (activeSession) {
      activeSession.status = 'completed';
      activeSession.endTime = new Date().toISOString();
    }

    const newSession = {
      id: `focus-${Date.now()}`,
      userId,
      orgId,
      startTime: new Date().toISOString(),
      endTime: null,
      status: 'active',
      targetMinutes,
      actualMinutes: 0,
      blockedWebsites: blockedWebsites || [],
      p1Whitelist: p1Whitelist || [],
      dndEnabled: true,
      breachCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    focusSessions.push(newSession);

    res.status(201).json({
      success: true,
      data: newSession
    });
  } catch (error) {
    console.error('Error starting focus session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start focus session'
    });
  }
});

// End focus session
router.post('/focus-sessions/:sessionId/end', (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = focusSessions.find(s => s.id === sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Focus session not found'
      });
    }

    session.status = 'completed';
    session.endTime = new Date().toISOString();
    session.actualMinutes = Math.round((new Date(session.endTime) - new Date(session.startTime)) / 60000);
    session.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error ending focus session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to end focus session'
    });
  }
});

// Pause focus session
router.post('/focus-sessions/:sessionId/pause', (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = focusSessions.find(s => s.id === sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Focus session not found'
      });
    }

    session.status = 'paused';
    session.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error pausing focus session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to pause focus session'
    });
  }
});

// Resume focus session
router.post('/focus-sessions/:sessionId/resume', (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = focusSessions.find(s => s.id === sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Focus session not found'
      });
    }

    session.status = 'active';
    session.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Error resuming focus session:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resume focus session'
    });
  }
});

// ==================== DND SETTINGS ENDPOINTS ====================

// Get DND settings
router.get('/dnd-settings', (req, res) => {
  try {
    const { user_id, org_id } = req.query;

    let filtered = dndSettings;

    if (user_id) {
      filtered = filtered.filter(d => d.userId === user_id);
    }

    if (org_id) {
      filtered = filtered.filter(d => d.orgId === org_id);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching DND settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch DND settings'
    });
  }
});

// Update DND settings
router.put('/dnd-settings/:dndId', (req, res) => {
  try {
    const { dndId } = req.params;
    const { enabled, startTime, endTime, allowP1, allowWhitelist, whitelistUsers } = req.body;

    const dnd = dndSettings.find(d => d.id === dndId);

    if (!dnd) {
      return res.status(404).json({
        success: false,
        error: 'DND settings not found'
      });
    }

    if (typeof enabled === 'boolean') dnd.enabled = enabled;
    if (startTime) dnd.startTime = startTime;
    if (endTime) dnd.endTime = endTime;
    if (typeof allowP1 === 'boolean') dnd.allowP1 = allowP1;
    if (typeof allowWhitelist === 'boolean') dnd.allowWhitelist = allowWhitelist;
    if (whitelistUsers) dnd.whitelistUsers = whitelistUsers;
    dnd.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: dnd
    });
  } catch (error) {
    console.error('Error updating DND settings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update DND settings'
    });
  }
});

// ==================== WEBSITE BLOCKLIST ENDPOINTS ====================

// Get website blocklist
router.get('/website-blocklist', (req, res) => {
  try {
    const { user_id, org_id, category } = req.query;

    let filtered = websiteBlocklist;

    if (user_id) {
      filtered = filtered.filter(w => w.userId === user_id);
    }

    if (org_id) {
      filtered = filtered.filter(w => w.orgId === org_id);
    }

    if (category) {
      filtered = filtered.filter(w => w.category === category);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching website blocklist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch website blocklist'
    });
  }
});

// Add website to blocklist
router.post('/website-blocklist', (req, res) => {
  try {
    const { userId, orgId, website, category, severity } = req.body;

    if (!userId || !orgId || !website || !category) {
      return res.status(400).json({
        success: false,
        error: 'userId, orgId, website, and category are required'
      });
    }

    const newBlock = {
      id: `block-${Date.now()}`,
      userId,
      orgId,
      website,
      category,
      severity: severity || 'medium',
      createdAt: new Date().toISOString()
    };

    websiteBlocklist.push(newBlock);

    res.status(201).json({
      success: true,
      data: newBlock
    });
  } catch (error) {
    console.error('Error adding website to blocklist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add website to blocklist'
    });
  }
});

// Remove website from blocklist
router.delete('/website-blocklist/:blockId', (req, res) => {
  try {
    const { blockId } = req.params;

    const index = websiteBlocklist.findIndex(w => w.id === blockId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Website block not found'
      });
    }

    const deleted = websiteBlocklist.splice(index, 1)[0];

    res.json({
      success: true,
      data: deleted
    });
  } catch (error) {
    console.error('Error removing website from blocklist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove website from blocklist'
    });
  }
});

// ==================== P1 WHITELIST ENDPOINTS ====================

// Get P1 whitelist
router.get('/p1-whitelist', (req, res) => {
  try {
    const { user_id, org_id } = req.query;

    let filtered = p1Whitelists;

    if (user_id) {
      filtered = filtered.filter(w => w.userId === user_id);
    }

    if (org_id) {
      filtered = filtered.filter(w => w.orgId === org_id);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching P1 whitelist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch P1 whitelist'
    });
  }
});

// Update P1 whitelist
router.put('/p1-whitelist/:whitelistId', (req, res) => {
  try {
    const { whitelistId } = req.params;
    const { whitelistUsers, whitelistEmails } = req.body;

    const whitelist = p1Whitelists.find(w => w.id === whitelistId);

    if (!whitelist) {
      return res.status(404).json({
        success: false,
        error: 'P1 whitelist not found'
      });
    }

    if (whitelistUsers) whitelist.whitelistUsers = whitelistUsers;
    if (whitelistEmails) whitelist.whitelistEmails = whitelistEmails;
    whitelist.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: whitelist
    });
  } catch (error) {
    console.error('Error updating P1 whitelist:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update P1 whitelist'
    });
  }
});

// ==================== BREACH LOG ENDPOINTS ====================

// Get breach logs
router.get('/breach-logs', (req, res) => {
  try {
    const { user_id, org_id, session_id } = req.query;

    let filtered = breachLogs;

    if (user_id) {
      filtered = filtered.filter(b => b.userId === user_id);
    }

    if (org_id) {
      filtered = filtered.filter(b => b.orgId === org_id);
    }

    if (session_id) {
      filtered = filtered.filter(b => b.focusSessionId === session_id);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching breach logs:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch breach logs'
    });
  }
});

// Log breach
router.post('/breach-logs', (req, res) => {
  try {
    const { userId, orgId, focusSessionId, breachType, source, reason, overrideReason } = req.body;

    if (!userId || !orgId || !focusSessionId || !breachType || !source) {
      return res.status(400).json({
        success: false,
        error: 'userId, orgId, focusSessionId, breachType, and source are required'
      });
    }

    const newBreach = {
      id: `breach-${Date.now()}`,
      userId,
      orgId,
      focusSessionId,
      breachType,
      source,
      timestamp: new Date().toISOString(),
      reason: reason || '',
      overrideReason: overrideReason || '',
      createdAt: new Date().toISOString()
    };

    breachLogs.push(newBreach);

    // Increment breach count in session
    const session = focusSessions.find(s => s.id === focusSessionId);
    if (session) {
      session.breachCount += 1;
    }

    res.status(201).json({
      success: true,
      data: newBreach
    });
  } catch (error) {
    console.error('Error logging breach:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log breach'
    });
  }
});

// ==================== FOCUS METRICS ENDPOINTS ====================

// Get focus metrics
router.get('/focus-metrics', (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'user_id is required'
      });
    }

    const metrics = focusMetrics[user_id] || {
      userId: user_id,
      totalFocusHours: 0,
      targetFocusHours: 20,
      completionRate: 0,
      breachCount: 0,
      averageSessionLength: 0,
      longestStreak: 0,
      lastUpdated: new Date().toISOString()
    };

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching focus metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch focus metrics'
    });
  }
});

// Update focus metrics
router.put('/focus-metrics/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { totalFocusHours, targetFocusHours, longestStreak } = req.body;

    if (!focusMetrics[userId]) {
      focusMetrics[userId] = {
        userId,
        totalFocusHours: 0,
        targetFocusHours: 20,
        completionRate: 0,
        breachCount: 0,
        averageSessionLength: 0,
        longestStreak: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    const metrics = focusMetrics[userId];

    if (totalFocusHours !== undefined) metrics.totalFocusHours = totalFocusHours;
    if (targetFocusHours !== undefined) metrics.targetFocusHours = targetFocusHours;
    if (longestStreak !== undefined) metrics.longestStreak = longestStreak;

    metrics.completionRate = metrics.targetFocusHours > 0 
      ? (metrics.totalFocusHours / metrics.targetFocusHours).toFixed(2)
      : 0;
    metrics.lastUpdated = new Date().toISOString();

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error updating focus metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update focus metrics'
    });
  }
});

module.exports = router;
