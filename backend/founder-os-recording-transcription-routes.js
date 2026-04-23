// Recording, Transcription & Summarization Routes for Founder OS
// Handles meeting recordings, transcriptions, AI summaries, and action extraction

const express = require('express');
const router = express.Router();

// In-memory data stores
let audioRecordings = [
  {
    id: 'recording-001',
    meetingId: 'meet-001',
    userId: 'user-001',
    orgId: 'org-001',
    title: 'Weekly Leadership Sync Recording',
    duration: 3600,
    fileSize: 45000000,
    status: 'completed',
    startTime: '2025-11-10T10:00:00Z',
    endTime: '2025-11-10T11:00:00Z',
    transcriptionStatus: 'completed',
    summaryStatus: 'completed',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let transcriptions = [
  {
    id: 'transcript-001',
    recordingId: 'recording-001',
    meetingId: 'meet-001',
    userId: 'user-001',
    orgId: 'org-001',
    status: 'completed',
    language: 'en',
    accuracy: 0.94,
    content: `[00:00] User-001: Good morning everyone, let's start with Q4 priorities.
[00:30] User-002: We need to focus on product roadmap completion.
[01:15] User-003: I agree, and we should also consider the budget constraints.
[02:00] User-001: Let's discuss the timeline and resource allocation.
[03:30] User-002: We have 3 weeks to complete the initial phase.
[04:15] User-001: That's tight but achievable. Let's break it down into tasks.
[05:00] User-003: I'll handle the budget review by end of week.
[05:45] User-001: Great. Let's reconvene next Monday with updates.`,
    wordCount: 1250,
    speakerCount: 3,
    speakers: ['user-001', 'user-002', 'user-003'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let meetingSummaries = [
  {
    id: 'summary-001',
    recordingId: 'recording-001',
    meetingId: 'meet-001',
    userId: 'user-001',
    orgId: 'org-001',
    status: 'completed',
    summary: `Meeting: Weekly Leadership Sync
Duration: 1 hour
Attendees: User-001, User-002, User-003

Key Discussion Points:
1. Q4 Priorities and Product Roadmap
   - Focus on product roadmap completion
   - 3-week timeline for initial phase
   - Resource allocation discussion

2. Budget Constraints
   - Budget review needed by end of week
   - Tight timeline but achievable
   - Task breakdown required

3. Action Items
   - User-003: Budget review by end of week
   - All: Prepare updates for next Monday meeting
   - Team: Break down roadmap into specific tasks

Next Meeting: Monday (next week) with progress updates`,
    keyTopics: ['Q4 Priorities', 'Product Roadmap', 'Budget Review', 'Timeline'],
    sentiment: 'positive',
    duration: 3600,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

let extractedDecisions = [
  {
    id: 'decision-extract-001',
    recordingId: 'recording-001',
    meetingId: 'meet-001',
    userId: 'user-001',
    orgId: 'org-001',
    decision: 'Focus on product roadmap completion in Q4',
    rationale: 'Strategic priority for company growth',
    owner: 'user-001',
    dueDate: '2025-11-30',
    priority: 'P1',
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'decision-extract-002',
    recordingId: 'recording-001',
    meetingId: 'meet-001',
    userId: 'user-001',
    orgId: 'org-001',
    decision: 'Complete budget review',
    rationale: 'Required for resource allocation planning',
    owner: 'user-003',
    dueDate: '2025-11-15',
    priority: 'P1',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

let extractedActions = [
  {
    id: 'action-extract-001',
    recordingId: 'recording-001',
    meetingId: 'meet-001',
    userId: 'user-001',
    orgId: 'org-001',
    action: 'Budget review',
    owner: 'user-003',
    dueDate: '2025-11-15',
    priority: 'P1',
    status: 'pending',
    createdAt: new Date().toISOString()
  },
  {
    id: 'action-extract-002',
    recordingId: 'recording-001',
    meetingId: 'meet-001',
    userId: 'user-001',
    orgId: 'org-001',
    action: 'Prepare roadmap updates',
    owner: 'user-002',
    dueDate: '2025-11-17',
    priority: 'P2',
    status: 'pending',
    createdAt: new Date().toISOString()
  }
];

let extractedRisks = [
  {
    id: 'risk-extract-001',
    recordingId: 'recording-001',
    meetingId: 'meet-001',
    userId: 'user-001',
    orgId: 'org-001',
    risk: 'Tight 3-week timeline for initial phase',
    severity: 'medium',
    mitigation: 'Break down into smaller tasks, allocate resources',
    owner: 'user-001',
    createdAt: new Date().toISOString()
  },
  {
    id: 'risk-extract-002',
    recordingId: 'recording-001',
    meetingId: 'meet-001',
    userId: 'user-001',
    orgId: 'org-001',
    risk: 'Budget constraints may limit resource allocation',
    severity: 'high',
    mitigation: 'Complete budget review by end of week',
    owner: 'user-003',
    createdAt: new Date().toISOString()
  }
];

// ==================== RECORDING ENDPOINTS ====================

// Get recordings
router.get('/recordings', (req, res) => {
  try {
    const { meeting_id, user_id, org_id, status } = req.query;

    let filtered = audioRecordings;

    if (meeting_id) {
      filtered = filtered.filter(r => r.meetingId === meeting_id);
    }

    if (user_id) {
      filtered = filtered.filter(r => r.userId === user_id);
    }

    if (org_id) {
      filtered = filtered.filter(r => r.orgId === org_id);
    }

    if (status) {
      filtered = filtered.filter(r => r.status === status);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching recordings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recordings'
    });
  }
});

// Start recording
router.post('/recordings/start', (req, res) => {
  try {
    const { meetingId, userId, orgId, title } = req.body;

    if (!meetingId || !userId || !orgId) {
      return res.status(400).json({
        success: false,
        error: 'meetingId, userId, and orgId are required'
      });
    }

    const newRecording = {
      id: `recording-${Date.now()}`,
      meetingId,
      userId,
      orgId,
      title: title || 'Meeting Recording',
      duration: 0,
      fileSize: 0,
      status: 'recording',
      startTime: new Date().toISOString(),
      endTime: null,
      transcriptionStatus: 'pending',
      summaryStatus: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    audioRecordings.push(newRecording);

    res.status(201).json({
      success: true,
      data: newRecording,
      message: 'Recording started'
    });
  } catch (error) {
    console.error('Error starting recording:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start recording'
    });
  }
});

// Stop recording
router.post('/recordings/:recordingId/stop', (req, res) => {
  try {
    const { recordingId } = req.params;

    const recording = audioRecordings.find(r => r.id === recordingId);

    if (!recording) {
      return res.status(404).json({
        success: false,
        error: 'Recording not found'
      });
    }

    recording.status = 'completed';
    recording.endTime = new Date().toISOString();
    recording.duration = Math.round((new Date(recording.endTime) - new Date(recording.startTime)) / 1000);
    recording.fileSize = recording.duration * 12500;
    recording.transcriptionStatus = 'processing';
    recording.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      data: recording,
      message: 'Recording stopped and transcription started'
    });
  } catch (error) {
    console.error('Error stopping recording:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to stop recording'
    });
  }
});

// ==================== TRANSCRIPTION ENDPOINTS ====================

// Get transcription
router.get('/transcriptions/:recordingId', (req, res) => {
  try {
    const { recordingId } = req.params;

    const transcript = transcriptions.find(t => t.recordingId === recordingId);

    if (!transcript) {
      return res.status(404).json({
        success: false,
        error: 'Transcription not found'
      });
    }

    res.json({
      success: true,
      data: transcript
    });
  } catch (error) {
    console.error('Error fetching transcription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transcription'
    });
  }
});

// Get all transcriptions
router.get('/transcriptions', (req, res) => {
  try {
    const { meeting_id, user_id, org_id } = req.query;

    let filtered = transcriptions;

    if (meeting_id) {
      filtered = filtered.filter(t => t.meetingId === meeting_id);
    }

    if (user_id) {
      filtered = filtered.filter(t => t.userId === user_id);
    }

    if (org_id) {
      filtered = filtered.filter(t => t.orgId === org_id);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching transcriptions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch transcriptions'
    });
  }
});

// ==================== SUMMARY ENDPOINTS ====================

// Get meeting summary
router.get('/summaries/:recordingId', (req, res) => {
  try {
    const { recordingId } = req.params;

    const summary = meetingSummaries.find(s => s.recordingId === recordingId);

    if (!summary) {
      return res.status(404).json({
        success: false,
        error: 'Summary not found'
      });
    }

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch summary'
    });
  }
});

// Get all summaries
router.get('/summaries', (req, res) => {
  try {
    const { meeting_id, user_id, org_id } = req.query;

    let filtered = meetingSummaries;

    if (meeting_id) {
      filtered = filtered.filter(s => s.meetingId === meeting_id);
    }

    if (user_id) {
      filtered = filtered.filter(s => s.userId === user_id);
    }

    if (org_id) {
      filtered = filtered.filter(s => s.orgId === org_id);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching summaries:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch summaries'
    });
  }
});

// ==================== EXTRACTED DECISIONS ENDPOINTS ====================

// Get extracted decisions
router.get('/extracted-decisions', (req, res) => {
  try {
    const { recording_id, meeting_id, org_id } = req.query;

    let filtered = extractedDecisions;

    if (recording_id) {
      filtered = filtered.filter(d => d.recordingId === recording_id);
    }

    if (meeting_id) {
      filtered = filtered.filter(d => d.meetingId === meeting_id);
    }

    if (org_id) {
      filtered = filtered.filter(d => d.orgId === org_id);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching extracted decisions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch extracted decisions'
    });
  }
});

// ==================== EXTRACTED ACTIONS ENDPOINTS ====================

// Get extracted actions
router.get('/extracted-actions', (req, res) => {
  try {
    const { recording_id, meeting_id, org_id } = req.query;

    let filtered = extractedActions;

    if (recording_id) {
      filtered = filtered.filter(a => a.recordingId === recording_id);
    }

    if (meeting_id) {
      filtered = filtered.filter(a => a.meetingId === meeting_id);
    }

    if (org_id) {
      filtered = filtered.filter(a => a.orgId === org_id);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching extracted actions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch extracted actions'
    });
  }
});

// ==================== EXTRACTED RISKS ENDPOINTS ====================

// Get extracted risks
router.get('/extracted-risks', (req, res) => {
  try {
    const { recording_id, meeting_id, org_id } = req.query;

    let filtered = extractedRisks;

    if (recording_id) {
      filtered = filtered.filter(r => r.recordingId === recording_id);
    }

    if (meeting_id) {
      filtered = filtered.filter(r => r.meetingId === meeting_id);
    }

    if (org_id) {
      filtered = filtered.filter(r => r.orgId === org_id);
    }

    res.json({
      success: true,
      data: filtered
    });
  } catch (error) {
    console.error('Error fetching extracted risks:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch extracted risks'
    });
  }
});

module.exports = router;
