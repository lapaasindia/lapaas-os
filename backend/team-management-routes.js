// Team Management Routes - Task Assignment & Request Escalation
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

// In-memory storage
const taskAssignments = [];
const requestApprovals = [];
const teamMembers = [];
const notifications = [];

// Helper to filter by user access
const filterByUserAccess = (items, userId, userRole, teamId) => {
  if (userRole === 'admin') return items;
  if (userRole === 'team_leader' && teamId) {
    return items.filter(item => 
      item.user_id === userId || 
      item.assigned_to === userId ||
      item.created_by === userId ||
      (item.team_id && item.team_id === teamId)
    );
  }
  return items.filter(item => 
    item.user_id === userId || 
    item.assigned_to === userId ||
    item.created_by === userId
  );
};

// ============ TASK ASSIGNMENT ============

// Assign task to user
router.post('/tasks/:taskId/assign', (req, res) => {
  try {
    const { taskId } = req.params;
    const { assigned_to, due_at, notes } = req.body;
    const userId = req.user?.id || 'user-001';
    const userRole = req.user?.role || 'member';

    // Check permission
    if (userRole !== 'admin' && userRole !== 'team_leader') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admins and team leaders can assign tasks',
      });
    }

    const assignment = {
      id: uuidv4(),
      task_id: taskId,
      assigned_to,
      assigned_by: userId,
      due_at,
      notes,
      status: 'assigned',
      created_at: new Date().toISOString(),
    };

    taskAssignments.push(assignment);

    // Create notification
    notifications.push({
      id: uuidv4(),
      user_id: assigned_to,
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned a new task by ${req.user?.email || 'team leader'}`,
      data: { task_id: taskId, assignment_id: assignment.id },
      read: false,
      created_at: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Task assigned successfully',
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get task assignments
router.get('/tasks/assignments', (req, res) => {
  try {
    const userId = req.user?.id || 'user-001';
    const userRole = req.user?.role || 'member';
    const teamId = req.user?.teamId;

    const filtered = filterByUserAccess(taskAssignments, userId, userRole, teamId);

    res.json({
      success: true,
      data: filtered,
      total: filtered.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my assigned tasks
router.get('/tasks/assigned-to-me', (req, res) => {
  try {
    const userId = req.user?.id || 'user-001';
    const myTasks = taskAssignments.filter(a => a.assigned_to === userId);

    res.json({
      success: true,
      data: myTasks,
      total: myTasks.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get tasks assigned by me
router.get('/tasks/assigned-by-me', (req, res) => {
  try {
    const userId = req.user?.id || 'user-001';
    const myAssignments = taskAssignments.filter(a => a.assigned_by === userId);

    res.json({
      success: true,
      data: myAssignments,
      total: myAssignments.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update assignment status
router.put('/tasks/assignments/:assignmentId', (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { status, notes } = req.body;

    const assignment = taskAssignments.find(a => a.id === assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    assignment.status = status || assignment.status;
    assignment.notes = notes || assignment.notes;
    assignment.updated_at = new Date().toISOString();

    res.json({
      success: true,
      message: 'Assignment updated',
      data: assignment,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ REQUEST ESCALATION & APPROVAL ============

// Escalate request (raise to admin/team leader)
router.post('/requests/:requestId/escalate', (req, res) => {
  try {
    const { requestId } = req.params;
    const { escalate_to, reason, priority } = req.body;
    const userId = req.user?.id || 'user-001';

    const escalation = {
      id: uuidv4(),
      request_id: requestId,
      escalated_by: userId,
      escalated_to: escalate_to || 'admin',
      reason,
      priority: priority || 'P2',
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    requestApprovals.push(escalation);

    // Create notification for admin/team leader
    notifications.push({
      id: uuidv4(),
      user_id: escalate_to || 'admin',
      type: 'request_escalated',
      title: 'Request Escalated',
      message: `A request has been escalated to you: ${reason}`,
      data: { request_id: requestId, escalation_id: escalation.id },
      read: false,
      created_at: new Date().toISOString(),
    });

    res.status(201).json({
      success: true,
      message: 'Request escalated successfully',
      data: escalation,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve/Reject request
router.post('/requests/:requestId/approve', (req, res) => {
  try {
    const { requestId } = req.params;
    const { status, notes, approved_by } = req.body;
    const userId = req.user?.id || 'user-001';
    const userRole = req.user?.role || 'member';

    // Check permission
    if (userRole !== 'admin' && userRole !== 'team_leader') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admins and team leaders can approve requests',
      });
    }

    const approval = {
      id: uuidv4(),
      request_id: requestId,
      approved_by: approved_by || userId,
      status, // 'approved' or 'rejected'
      notes,
      created_at: new Date().toISOString(),
    };

    requestApprovals.push(approval);

    // Find the escalation and update it
    const escalation = requestApprovals.find(
      e => e.request_id === requestId && e.status === 'pending'
    );
    if (escalation) {
      escalation.status = status;
      escalation.resolved_at = new Date().toISOString();
      escalation.resolved_by = userId;
    }

    // Create notification for requester
    if (escalation) {
      notifications.push({
        id: uuidv4(),
        user_id: escalation.escalated_by,
        type: 'request_resolved',
        title: `Request ${status}`,
        message: `Your request has been ${status}. ${notes || ''}`,
        data: { request_id: requestId, approval_id: approval.id },
        read: false,
        created_at: new Date().toISOString(),
      });
    }

    res.status(201).json({
      success: true,
      message: `Request ${status} successfully`,
      data: approval,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get pending approvals (for admin/team leader)
router.get('/requests/pending-approvals', (req, res) => {
  try {
    const userId = req.user?.id || 'user-001';
    const userRole = req.user?.role || 'member';

    if (userRole !== 'admin' && userRole !== 'team_leader') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admins and team leaders can view pending approvals',
      });
    }

    const pending = requestApprovals.filter(
      a => a.status === 'pending' && (a.escalated_to === userId || userRole === 'admin')
    );

    res.json({
      success: true,
      data: pending,
      total: pending.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get my escalations
router.get('/requests/my-escalations', (req, res) => {
  try {
    const userId = req.user?.id || 'user-001';
    const myEscalations = requestApprovals.filter(a => a.escalated_by === userId);

    res.json({
      success: true,
      data: myEscalations,
      total: myEscalations.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ TEAM MEMBERS ============

// Get team members (for task assignment dropdown)
router.get('/team/members', (req, res) => {
  try {
    const userId = req.user?.id || 'user-001';
    const userRole = req.user?.role || 'member';
    const teamId = req.user?.teamId;

    if (userRole === 'member') {
      return res.json({
        success: true,
        data: [],
        message: 'Members cannot view team members',
      });
    }

    // For now, return sample team members
    // In production, this would query the database
    const members = [
      { id: 'user-001', name: 'Admin User', email: 'admin@lapaas.com', role: 'admin' },
      { id: 'user-002', name: 'Team Leader', email: 'leader@lapaas.com', role: 'team_leader' },
      { id: 'user-003', name: 'Member One', email: 'member1@lapaas.com', role: 'member' },
    ];

    res.json({
      success: true,
      data: members,
      total: members.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============ NOTIFICATIONS ============

// Get my notifications
router.get('/notifications', (req, res) => {
  try {
    const userId = req.user?.id || 'user-001';
    const myNotifications = notifications.filter(n => n.user_id === userId);

    res.json({
      success: true,
      data: myNotifications.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
      total: myNotifications.length,
      unread: myNotifications.filter(n => !n.read).length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mark notification as read
router.put('/notifications/:notificationId/read', (req, res) => {
  try {
    const { notificationId } = req.params;
    const notification = notifications.find(n => n.id === notificationId);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = true;
    notification.read_at = new Date().toISOString();

    res.json({
      success: true,
      data: notification,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
