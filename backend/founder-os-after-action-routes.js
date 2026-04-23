// After-Action Packet Routes for Founder OS
// Handles meeting summaries, email delivery, micro-NPS, and attendee packets

const express = require('express');
const router = express.Router();

// In-memory data stores
let afterActionPackets = [
  {
    id: 'aap-001',
    meetingId: 'meet-001',
    userId: 'user-001',
    orgId: 'org-001',
    title: 'Weekly Leadership Sync - After-Action Packet',
    meetingTitle: 'Weekly Leadership Sync',
    meetingDate: '2025-11-10',
    attendees: ['user-001', 'user-002', 'user-003'],
    status: 'sent',
    createdAt: new Date().toISOString(),
    sentAt: new Date().toISOString(),
    deliveryStatus: 'delivered'
  }
];

let packetSummaries = [
  {
    id: 'summary-001',
    packetId: 'aap-001',
    meetingId: 'meet-001',
    duration: 3600,
    attendeeCount: 3,
    summary: `Meeting: Weekly Leadership Sync
Date: November 10, 2025
Duration: 1 hour
Attendees: 3

KEY DECISIONS:
1. Focus on Q4 product roadmap completion
2. Approve budget allocation for Q4
3. Schedule follow-up meeting for Monday

ACTION ITEMS:
1. User-003: Complete budget review by Friday
2. User-002: Prepare roadmap implementation plan
3. User-001: Send stakeholder communication

RISKS IDENTIFIED:
1. Tight timeline for roadmap completion
2. Budget constraints may limit resources
3. Team capacity concerns

NEXT STEPS:
- Reconvene Monday with progress updates
- Budget review completion by Friday
- Roadmap implementation planning`,
    keyDecisions: 2,
    actionItems: 3,
    risks: 3,
    createdAt: new Date().toISOString()
  }
];

let packetAttendees = [
  {
    id: 'attendee-001',
    packetId: 'aap-001',
    userId: 'user-001',
    email: 'user-001@company.com',
    name: 'User 001',
    role: 'Organizer',
    status: 'delivered',
    openedAt: new Date().toISOString(),
    npsScore: null,
    feedback: '',
    createdAt: new Date().toISOString()
  },
  {
    id: 'attendee-002',
    packetId: 'aap-001',
    userId: 'user-002',
    email: 'user-002@company.com',
    name: 'User 002',
    role: 'Participant',
    status: 'delivered',
    openedAt: new Date().toISOString(),
    npsScore: 8,
    feedback: 'Good meeting, clear action items',
    createdAt: new Date().toISOString()
  }
];

let microNPS = [
  {
    id: 'nps-001',
    packetId: 'aap-001',
    meetingId: 'meet-001',
    userId: 'user-002',
    score: 8,
    feedback: 'Good meeting, clear action items',
    sentiment: 'positive',
    createdAt: new Date().toISOString()
  }
];

let emailDeliveries = [
  {
    id: 'email-001',
    packetId: 'aap-001',
    meetingId: 'meet-001',
    recipientEmail: 'user-001@company.com',
    recipientName: 'User 001',
    subject: 'Meeting Summary: Weekly Leadership Sync',
    status: 'delivered',
    sentAt: new Date().toISOString(),
    openedAt: new Date().toISOString(),
    clickCount: 2,
    createdAt: new Date().toISOString()
  },
  {
    id: 'email-002',
    packetId: 'aap-001',
    meetingId: 'meet-001',
    recipientEmail: 'user-002@company.com',
    recipientName: 'User 002',
    subject: 'Meeting Summary: Weekly Leadership Sync',
    status: 'delivered',
    sentAt: new Date().toISOString(),
    openedAt: new Date().toISOString(),
    clickCount: 1,
    createdAt: new Date().toISOString()
  }
];

let guestLinks = [
  {
    id: 'guest-001',
    packetId: 'aap-001',
    meetingId: 'meet-001',
    guestEmail: 'guest@external.com',
    guestName: 'External Guest',
    token: 'guest_token_abc123xyz',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    accessCount: 0,
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

// ==================== AFTER-ACTION PACKET ENDPOINTS ====================

// Get after-action packets
router.get('/after-action-packets', (req, res) => {
  try {
    const { meeting_id, user_id, org_id, status } = req.query;

    let filtered = afterActionPackets;

    if (meeting_id) {
      filtered = filtered.filter(p => p.meetingId === meeting_id);
    }

    if (user_id) {
      filtered = filtered.filter(p => p.userId === user_id);
    }

    if (org_id) {
      filtered = filtered.filter(p => p.orgId === org_id);
    }

    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching after-action packets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch after-action packets'
    });
  }
});

// Create after-action packet
router.post('/after-action-packets', (req, res) => {
  try {
    const { meetingId, userId, orgId, title, meetingTitle, meetingDate, attendees } = req.body;

    if (!meetingId || !userId || !orgId) {
      return res.status(400).json({
        success: false,
        error: 'meetingId, userId, and orgId are required'
      });
    }

    const newPacket = {
      id: `aap-${Date.now()}`,
      meetingId,
      userId,
      orgId,
      title: title || `After-Action Packet - ${meetingTitle}`,
      meetingTitle: meetingTitle || 'Meeting',
      meetingDate: meetingDate || new Date().toISOString().split('T')[0],
      attendees: attendees || [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      sentAt: null,
      deliveryStatus: 'pending'
    };

    afterActionPackets.push(newPacket);

    res.status(201).json({
      success: true,
      data: newPacket,
      message: 'After-action packet created'
    });
  } catch (error) {
    console.error('Error creating after-action packet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create after-action packet'
    });
  }
});

// Send after-action packet
router.post('/after-action-packets/:packetId/send', (req, res) => {
  try {
    const { packetId } = req.params;

    const packet = afterActionPackets.find(p => p.id === packetId);

    if (!packet) {
      return res.status(404).json({
        success: false,
        error: 'After-action packet not found'
      });
    }

    packet.status = 'sent';
    packet.sentAt = new Date().toISOString();
    packet.deliveryStatus = 'delivered';

    res.json({
      success: true,
      data: packet,
      message: 'After-action packet sent to all attendees'
    });
  } catch (error) {
    console.error('Error sending after-action packet:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send after-action packet'
    });
  }
});

// ==================== PACKET SUMMARY ENDPOINTS ====================

// Get packet summary
router.get('/packet-summaries/:packetId', (req, res) => {
  try {
    const { packetId } = req.params;

    const summary = packetSummaries.find(s => s.packetId === packetId);

    if (!summary) {
      return res.status(404).json({
        success: false,
        error: 'Packet summary not found'
      });
    }

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching packet summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch packet summary'
    });
  }
});

// ==================== ATTENDEE ENDPOINTS ====================

// Get packet attendees
router.get('/packet-attendees/:packetId', (req, res) => {
  try {
    const { packetId } = req.params;

    const attendees = packetAttendees.filter(a => a.packetId === packetId);

    res.json({
      success: true,
      data: attendees
    });
  } catch (error) {
    console.error('Error fetching packet attendees:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch packet attendees'
    });
  }
});

// ==================== MICRO-NPS ENDPOINTS ====================

// Get micro-NPS responses
router.get('/micro-nps', (req, res) => {
  try {
    const { packet_id, meeting_id } = req.query;

    let filtered = microNPS;

    if (packet_id) {
      filtered = filtered.filter(n => n.packetId === packet_id);
    }

    if (meeting_id) {
      filtered = filtered.filter(n => n.meetingId === meeting_id);
    }

    res.json({
      success: true,
      data: filtered,
      averageScore: filtered.length > 0 ? (filtered.reduce((sum, n) => sum + n.score, 0) / filtered.length).toFixed(1) : 0
    });
  } catch (error) {
    console.error('Error fetching micro-NPS:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch micro-NPS'
    });
  }
});

// Submit micro-NPS
router.post('/micro-nps', (req, res) => {
  try {
    const { packetId, meetingId, userId, score, feedback } = req.body;

    if (!packetId || !meetingId || !userId || score === undefined) {
      return res.status(400).json({
        success: false,
        error: 'packetId, meetingId, userId, and score are required'
      });
    }

    if (score < 0 || score > 10) {
      return res.status(400).json({
        success: false,
        error: 'Score must be between 0 and 10'
      });
    }

    const sentiment = score >= 8 ? 'positive' : score >= 5 ? 'neutral' : 'negative';

    const newNPS = {
      id: `nps-${Date.now()}`,
      packetId,
      meetingId,
      userId,
      score,
      feedback: feedback || '',
      sentiment,
      createdAt: new Date().toISOString()
    };

    microNPS.push(newNPS);

    res.status(201).json({
      success: true,
      data: newNPS,
      message: 'Micro-NPS response recorded'
    });
  } catch (error) {
    console.error('Error submitting micro-NPS:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit micro-NPS'
    });
  }
});

// ==================== EMAIL DELIVERY ENDPOINTS ====================

// Get email deliveries
router.get('/email-deliveries', (req, res) => {
  try {
    const { packet_id, meeting_id, status } = req.query;

    let filtered = emailDeliveries;

    if (packet_id) {
      filtered = filtered.filter(e => e.packetId === packet_id);
    }

    if (meeting_id) {
      filtered = filtered.filter(e => e.meetingId === meeting_id);
    }

    if (status) {
      filtered = filtered.filter(e => e.status === status);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching email deliveries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch email deliveries'
    });
  }
});

// ==================== GUEST LINK ENDPOINTS ====================

// Get guest links
router.get('/guest-links', (req, res) => {
  try {
    const { packet_id, meeting_id } = req.query;

    let filtered = guestLinks;

    if (packet_id) {
      filtered = filtered.filter(g => g.packetId === packet_id);
    }

    if (meeting_id) {
      filtered = filtered.filter(g => g.meetingId === meeting_id);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching guest links:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch guest links'
    });
  }
});

// Create guest link
router.post('/guest-links', (req, res) => {
  try {
    const { packetId, meetingId, guestEmail, guestName, expirationDays } = req.body;

    if (!packetId || !meetingId || !guestEmail) {
      return res.status(400).json({
        success: false,
        error: 'packetId, meetingId, and guestEmail are required'
      });
    }

    const token = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date(Date.now() + (expirationDays || 7) * 24 * 60 * 60 * 1000).toISOString();

    const newLink = {
      id: `guest-${Date.now()}`,
      packetId,
      meetingId,
      guestEmail,
      guestName: guestName || 'Guest',
      token,
      expiresAt,
      accessCount: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    guestLinks.push(newLink);

    res.status(201).json({
      success: true,
      data: newLink,
      guestUrl: `http://localhost:5174/meeting-summary/${token}`,
      message: 'Guest link created'
    });
  } catch (error) {
    console.error('Error creating guest link:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create guest link'
    });
  }
});

module.exports = router;
