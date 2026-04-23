import express, { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// In-memory storage
const users: any[] = [];
const organizations: any[] = [];
const teams: any[] = [];
const roles: any[] = [];
const activities: any[] = [];

// Initialize default roles
const initializeRoles = () => {
  const defaultRoles = [
    { id: uuidv4(), name: 'Admin', permissions: ['create', 'read', 'update', 'delete'] },
    { id: uuidv4(), name: 'Manager', permissions: ['create', 'read', 'update'] },
    { id: uuidv4(), name: 'Member', permissions: ['read', 'update'] },
    { id: uuidv4(), name: 'Viewer', permissions: ['read'] },
  ];
  roles.push(...defaultRoles);
};

initializeRoles();

// Activity logging helper
const logActivity = (userId: string, action: string, resource: string, details: any) => {
  activities.push({
    id: uuidv4(),
    userId,
    action,
    resource,
    details,
    timestamp: new Date().toISOString(),
  });
};

// ==================== USER MANAGEMENT ====================

// Get user profile
router.get('/profile/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = users.find((u) => u.id === userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar || null,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update user profile
router.put('/profile/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, avatar } = req.body;

    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.avatar = avatar || user.avatar;

    logActivity(userId, 'UPDATE', 'USER_PROFILE', { firstName, lastName });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get user activity
router.get('/activity/:userId', (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const userActivities = activities.filter((a) => a.userId === userId);

    res.json({
      success: true,
      data: userActivities,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ORGANIZATION MANAGEMENT ====================

// Create organization
router.post('/organizations', (req: Request, res: Response) => {
  try {
    const { name, description, ownerId } = req.body;

    if (!name || !ownerId) {
      return res.status(400).json({ error: 'Name and ownerId required' });
    }

    const organization = {
      id: uuidv4(),
      name,
      description,
      ownerId,
      members: [{ userId: ownerId, role: 'Admin' }],
      createdAt: new Date().toISOString(),
    };

    organizations.push(organization);
    logActivity(ownerId, 'CREATE', 'ORGANIZATION', { name });

    res.json({
      success: true,
      message: 'Organization created successfully',
      data: organization,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get organizations
router.get('/organizations', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: organizations,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get organization by ID
router.get('/organizations/:orgId', (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    const organization = organizations.find((o) => o.id === orgId);

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json({
      success: true,
      data: organization,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update organization
router.put('/organizations/:orgId', (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    const { name, description } = req.body;

    const organization = organizations.find((o) => o.id === orgId);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    organization.name = name || organization.name;
    organization.description = description || organization.description;

    logActivity(req.body.userId, 'UPDATE', 'ORGANIZATION', { name });

    res.json({
      success: true,
      message: 'Organization updated successfully',
      data: organization,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add member to organization
router.post('/organizations/:orgId/members', (req: Request, res: Response) => {
  try {
    const { orgId } = req.params;
    const { userId, role } = req.body;

    const organization = organizations.find((o) => o.id === orgId);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const memberExists = organization.members.find((m: any) => m.userId === userId);
    if (memberExists) {
      return res.status(400).json({ error: 'Member already exists' });
    }

    organization.members.push({ userId, role: role || 'Member' });
    logActivity(req.body.addedBy, 'ADD_MEMBER', 'ORGANIZATION', { userId, role });

    res.json({
      success: true,
      message: 'Member added successfully',
      data: organization,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== TEAM MANAGEMENT ====================

// Create team
router.post('/teams', (req: Request, res: Response) => {
  try {
    const { name, description, organizationId, leaderId } = req.body;

    if (!name || !organizationId) {
      return res.status(400).json({ error: 'Name and organizationId required' });
    }

    const team = {
      id: uuidv4(),
      name,
      description,
      organizationId,
      leaderId,
      members: [{ userId: leaderId, role: 'Lead' }],
      createdAt: new Date().toISOString(),
    };

    teams.push(team);
    logActivity(leaderId, 'CREATE', 'TEAM', { name });

    res.json({
      success: true,
      message: 'Team created successfully',
      data: team,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get teams
router.get('/teams', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: teams,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get team by ID
router.get('/teams/:teamId', (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const team = teams.find((t) => t.id === teamId);

    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    res.json({
      success: true,
      data: team,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add member to team
router.post('/teams/:teamId/members', (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;
    const { userId, role } = req.body;

    const team = teams.find((t) => t.id === teamId);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const memberExists = team.members.find((m: any) => m.userId === userId);
    if (memberExists) {
      return res.status(400).json({ error: 'Member already exists' });
    }

    team.members.push({ userId, role: role || 'Member' });
    logActivity(req.body.addedBy, 'ADD_MEMBER', 'TEAM', { userId, role });

    res.json({
      success: true,
      message: 'Member added successfully',
      data: team,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== RBAC MANAGEMENT ====================

// Get roles
router.get('/roles', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: roles,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Assign role to user
router.post('/roles/assign', (req: Request, res: Response) => {
  try {
    const { userId, organizationId, role } = req.body;

    if (!userId || !organizationId || !role) {
      return res.status(400).json({ error: 'userId, organizationId, and role required' });
    }

    const organization = organizations.find((o) => o.id === organizationId);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const member = organization.members.find((m: any) => m.userId === userId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    member.role = role;
    logActivity(req.body.assignedBy, 'ASSIGN_ROLE', 'USER', { userId, role });

    res.json({
      success: true,
      message: 'Role assigned successfully',
      data: member,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Check permission
router.post('/permissions/check', (req: Request, res: Response) => {
  try {
    const { userId, organizationId, action } = req.body;

    if (!userId || !organizationId || !action) {
      return res.status(400).json({ error: 'userId, organizationId, and action required' });
    }

    const organization = organizations.find((o) => o.id === organizationId);
    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    const member = organization.members.find((m: any) => m.userId === userId);
    if (!member) {
      return res.json({ success: true, data: { hasPermission: false } });
    }

    const role = roles.find((r) => r.name === member.role);
    const hasPermission = role?.permissions.includes(action) || false;

    res.json({
      success: true,
      data: { hasPermission },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== ACTIVITY LOGGING ====================

// Get all activities
router.get('/activities', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: activities,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get activities by resource
router.get('/activities/:resource', (req: Request, res: Response) => {
  try {
    const { resource } = req.params;
    const resourceActivities = activities.filter((a) => a.resource === resource);

    res.json({
      success: true,
      data: resourceActivities,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
