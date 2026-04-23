// Meeting OS Routes for Founder OS
// Handles meeting agendas, decisions, timers, and meeting management

const express = require('express');
const router = express.Router();

// In-memory data stores
let meetings = [
  {
    id: 'meet-001',
    userId: 'user-001',
    orgId: 'org-001',
    title: 'Weekly Leadership Sync',
    description: 'Sync on weekly priorities and blockers',
    startAt: '2025-11-10T10:00:00Z',
    endAt: '2025-11-10T11:00:00Z',
    duration: 60,
    attendees: ['user-001', 'user-002', 'user-003'],
    owner: 'user-001',
    status: 'scheduled',
    hasAgenda: true,
    agendaItems: [],
    decisions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'meet-002',
    userId: 'user-001',
    orgId: 'org-001',
    title: 'Product Review',
    description: 'Review Q4 product roadmap',
    startAt: '2025-11-12T14:00:00Z',
    endAt: '2025-11-12T15:00:00Z',
    duration: 60,
    attendees: ['user-001', 'user-004'],
    owner: 'user-001',
    status: 'scheduled',
    hasAgenda: false,
    agendaItems: [],
    decisions: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let agendaItems = [
  {
    id: 'agenda-001',
    meetingId: 'meet-001',
    title: 'Q4 Priorities',
    duration: 15,
    owner: 'user-001',
    order: 1,
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'agenda-002',
    meetingId: 'meet-001',
    title: 'Blockers & Dependencies',
    duration: 20,
    owner: 'user-002',
    order: 2,
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'agenda-003',
    meetingId: 'meet-001',
    title: 'Action Items Review',
    duration: 15,
    owner: 'user-001',
    order: 3,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

let decisions = [
  {
    id: 'decision-001',
    meetingId: 'meet-001',
    title: 'Approve Q4 roadmap',
    rationale: 'Aligns with company strategy',
    owner: 'user-001',
    reviewDate: '2025-11-17',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

let meetingTimers = [
  {
    id: 'timer-001',
    meetingId: 'meet-001',
    agendaItemId: 'agenda-001',
    startTime: null,
    endTime: null,
    elapsedSeconds: 0,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

let meetingNotes = [
  {
    id: 'note-001',
    meetingId: 'meet-001',
    userId: 'user-001',
    content: 'Initial notes',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ==================== MEETINGS ENDPOINTS ====================

// Get all meetings
router.get('/meetings', (req, res) => {
  try {
    const { org_id, user_id, status } = req.query;

    let filtered = meetings;

    if (org_id) {
      filtered = filtered.filter(m => m.orgId === org_id);
    }

    if (user_id) {
      filtered = filtered.filter(m => m.attendees.includes(user_id) || m.owner === user_id);
    }

    if (status) {
      filtered = filtered.filter(m => m.status === status);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching meetings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch meetings'
    });
  }
});

// Get meeting by ID
router.get('/meetings/:meetingId', (req, res) => {
  try {
    const { meetingId } = req.params;

    const meeting = meetings.find(m => m.id === meetingId);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }

    // Get related data
    const items = agendaItems.filter(a => a.meetingId === meetingId);
    const meetingDecisions = decisions.filter(d => d.meetingId === meetingId);
    const notes = meetingNotes.filter(n => n.meetingId === meetingId);

    res.json({
      success: true,
      data: {
        ...meeting,
        agendaItems: items,
        decisions: meetingDecisions,
        notes: notes
      }
    });
  } catch (error) {
    console.error('Error fetching meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch meeting'
    });
  }
});

// Create meeting
router.post('/meetings', (req, res) => {
  try {
    const { userId, orgId, title, description, startAt, endAt, attendees } = req.body;

    if (!userId || !orgId || !title || !startAt) {
      return res.status(400).json({
        success: false,
        error: 'userId, orgId, title, and startAt are required'
      });
    }

    const start = new Date(startAt);
    const end = endAt ? new Date(endAt) : new Date(start.getTime() + 60 * 60000);
    const duration = Math.round((end - start) / 60000);

    const newMeeting = {
      id: `meet-${Date.now()}`,
      userId,
      orgId,
      title,
      description: description || '',
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      duration,
      attendees: attendees || [userId],
      owner: userId,
      status: 'scheduled',
      hasAgenda: false,
      agendaItems: [],
      decisions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    meetings.push(newMeeting);

    res.status(201).json({
      success: true,
      data: newMeeting
    });
  } catch (error) {
    console.error('Error creating meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create meeting'
    });
  }
});

// Update meeting
router.put('/meetings/:meetingId', (req, res) => {
  try {
    const { meetingId } = req.params;
    const { title, description, startAt, endAt, status, attendees } = req.body;

    const meeting = meetings.find(m => m.id === meetingId);

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }

    if (title) meeting.title = title;
    if (description) meeting.description = description;
    if (status) meeting.status = status;
    if (attendees) meeting.attendees = attendees;

    if (startAt || endAt) {
      const start = startAt ? new Date(startAt) : new Date(meeting.startAt);
      const end = endAt ? new Date(endAt) : new Date(meeting.endAt);
      meeting.startAt = start.toISOString();
      meeting.endAt = end.toISOString();
      meeting.duration = Math.round((end - start) / 60000);
    }

    meeting.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: meeting
    });
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update meeting'
    });
  }
});

// Delete meeting
router.delete('/meetings/:meetingId', (req, res) => {
  try {
    const { meetingId } = req.params;

    const index = meetings.findIndex(m => m.id === meetingId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }

    // Delete related data
    agendaItems = agendaItems.filter(a => a.meetingId !== meetingId);
    decisions = decisions.filter(d => d.meetingId !== meetingId);
    meetingNotes = meetingNotes.filter(n => n.meetingId !== meetingId);

    const deleted = meetings.splice(index, 1)[0];

    res.json({
      success: true,
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting meeting:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete meeting'
    });
  }
});

// ==================== AGENDA ITEMS ENDPOINTS ====================

// Get agenda items for meeting
router.get('/meetings/:meetingId/agenda', (req, res) => {
  try {
    const { meetingId } = req.params;

    const items = agendaItems
      .filter(a => a.meetingId === meetingId)
      .sort((a, b) => a.order - b.order);

    res.json({
      success: true,
      data: items
    });
  } catch (error) {
    console.error('Error fetching agenda items:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agenda items'
    });
  }
});

// Create agenda item
router.post('/meetings/:meetingId/agenda', (req, res) => {
  try {
    const { meetingId } = req.params;
    const { title, duration, owner, order } = req.body;

    if (!title || !owner) {
      return res.status(400).json({
        success: false,
        error: 'title and owner are required'
      });
    }

    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }

    const newItem = {
      id: `agenda-${Date.now()}`,
      meetingId,
      title,
      duration: duration || 15,
      owner,
      order: order || agendaItems.filter(a => a.meetingId === meetingId).length + 1,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    agendaItems.push(newItem);
    meeting.hasAgenda = true;
    meeting.updatedAt = new Date().toISOString();

    res.status(201).json({
      success: true,
      data: newItem
    });
  } catch (error) {
    console.error('Error creating agenda item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create agenda item'
    });
  }
});

// Update agenda item
router.put('/agenda/:agendaId', (req, res) => {
  try {
    const { agendaId } = req.params;
    const { title, duration, status, order } = req.body;

    const item = agendaItems.find(a => a.id === agendaId);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Agenda item not found'
      });
    }

    if (title) item.title = title;
    if (duration) item.duration = duration;
    if (status) item.status = status;
    if (order) item.order = order;

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Error updating agenda item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update agenda item'
    });
  }
});

// Delete agenda item
router.delete('/agenda/:agendaId', (req, res) => {
  try {
    const { agendaId } = req.params;

    const index = agendaItems.findIndex(a => a.id === agendaId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Agenda item not found'
      });
    }

    const deleted = agendaItems.splice(index, 1)[0];

    res.json({
      success: true,
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting agenda item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete agenda item'
    });
  }
});

// Delete agenda item (alternative path for consistency)
router.delete('/meetings/:meetingId/agenda/:agendaId', (req, res) => {
  try {
    const { agendaId } = req.params;

    const index = agendaItems.findIndex(a => a.id === agendaId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Agenda item not found'
      });
    }

    const deleted = agendaItems.splice(index, 1)[0];

    res.json({
      success: true,
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting agenda item:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete agenda item'
    });
  }
});

// ==================== DECISIONS ENDPOINTS ====================

// Get decisions for meeting
router.get('/meetings/:meetingId/decisions', (req, res) => {
  try {
    const { meetingId } = req.params;

    const meetingDecisions = decisions.filter(d => d.meetingId === meetingId);

    res.json({
      success: true,
      data: meetingDecisions
    });
  } catch (error) {
    console.error('Error fetching decisions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch decisions'
    });
  }
});

// Create decision
router.post('/meetings/:meetingId/decisions', (req, res) => {
  try {
    const { meetingId } = req.params;
    const { title, rationale, owner, reviewDate } = req.body;

    if (!title || !owner) {
      return res.status(400).json({
        success: false,
        error: 'title and owner are required'
      });
    }

    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }

    const newDecision = {
      id: `decision-${Date.now()}`,
      meetingId,
      title,
      rationale: rationale || '',
      owner,
      reviewDate: reviewDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    decisions.push(newDecision);

    res.status(201).json({
      success: true,
      data: newDecision
    });
  } catch (error) {
    console.error('Error creating decision:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create decision'
    });
  }
});

// Update decision
router.put('/decisions/:decisionId', (req, res) => {
  try {
    const { decisionId } = req.params;
    const { title, rationale, status, owner, reviewDate } = req.body;

    const decision = decisions.find(d => d.id === decisionId);

    if (!decision) {
      return res.status(404).json({
        success: false,
        error: 'Decision not found'
      });
    }

    if (title) decision.title = title;
    if (rationale) decision.rationale = rationale;
    if (status) decision.status = status;
    if (owner) decision.owner = owner;
    if (reviewDate) decision.reviewDate = reviewDate;

    res.json({
      success: true,
      data: decision
    });
  } catch (error) {
    console.error('Error updating decision:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update decision'
    });
  }
});

// Delete decision
router.delete('/decisions/:decisionId', (req, res) => {
  try {
    const { decisionId } = req.params;

    const index = decisions.findIndex(d => d.id === decisionId);

    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Decision not found'
      });
    }

    const deleted = decisions.splice(index, 1)[0];

    res.json({
      success: true,
      data: deleted
    });
  } catch (error) {
    console.error('Error deleting decision:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete decision'
    });
  }
});

// ==================== MEETING NOTES ENDPOINTS ====================

// Get notes for meeting
router.get('/meetings/:meetingId/notes', (req, res) => {
  try {
    const { meetingId } = req.params;

    const notes = meetingNotes.filter(n => n.meetingId === meetingId);

    res.json({
      success: true,
      data: notes
    });
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch notes'
    });
  }
});

// Create or update note
router.post('/meetings/:meetingId/notes', (req, res) => {
  try {
    const { meetingId } = req.params;
    const { userId, content } = req.body;

    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        error: 'userId and content are required'
      });
    }

    const meeting = meetings.find(m => m.id === meetingId);
    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }

    // Check if note exists
    let note = meetingNotes.find(n => n.meetingId === meetingId && n.userId === userId);

    if (note) {
      note.content = content;
      note.updatedAt = new Date().toISOString();
    } else {
      note = {
        id: `note-${Date.now()}`,
        meetingId,
        userId,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      meetingNotes.push(note);
    }

    res.status(201).json({
      success: true,
      data: note
    });
  } catch (error) {
    console.error('Error creating/updating note:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create/update note'
    });
  }
});

// ==================== MEETING TIMERS ENDPOINTS ====================

// Start timer for agenda item
router.post('/agenda/:agendaId/timer/start', (req, res) => {
  try {
    const { agendaId } = req.params;

    const agendaItem = agendaItems.find(a => a.id === agendaId);
    if (!agendaItem) {
      return res.status(404).json({
        success: false,
        error: 'Agenda item not found'
      });
    }

    let timer = meetingTimers.find(t => t.agendaItemId === agendaId);

    if (!timer) {
      timer = {
        id: `timer-${Date.now()}`,
        meetingId: agendaItem.meetingId,
        agendaItemId: agendaId,
        startTime: new Date().toISOString(),
        endTime: null,
        elapsedSeconds: 0,
        status: 'running',
        createdAt: new Date().toISOString()
      };
      meetingTimers.push(timer);
    } else {
      timer.startTime = new Date().toISOString();
      timer.status = 'running';
    }

    res.json({
      success: true,
      data: timer
    });
  } catch (error) {
    console.error('Error starting timer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start timer'
    });
  }
});

// Stop timer for agenda item
router.post('/agenda/:agendaId/timer/stop', (req, res) => {
  try {
    const { agendaId } = req.params;

    const timer = meetingTimers.find(t => t.agendaItemId === agendaId);

    if (!timer) {
      return res.status(404).json({
        success: false,
        error: 'Timer not found'
      });
    }

    if (timer.startTime) {
      const elapsed = Math.round((new Date() - new Date(timer.startTime)) / 1000);
      timer.elapsedSeconds += elapsed;
    }

    timer.endTime = new Date().toISOString();
    timer.status = 'stopped';

    res.json({
      success: true,
      data: timer
    });
  } catch (error) {
    console.error('Error stopping timer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop timer'
    });
  }
});

// Get timer for agenda item
router.get('/agenda/:agendaId/timer', (req, res) => {
  try {
    const { agendaId } = req.params;

    const timer = meetingTimers.find(t => t.agendaItemId === agendaId);

    if (!timer) {
      return res.status(404).json({
        success: false,
        error: 'Timer not found'
      });
    }

    res.json({
      success: true,
      data: timer
    });
  } catch (error) {
    console.error('Error fetching timer:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch timer'
    });
  }
});

module.exports = router;
