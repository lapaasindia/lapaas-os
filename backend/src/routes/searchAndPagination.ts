/**
 * Search and Pagination Routes - Week 6
 * Handles search and pagination for all resources
 */

import express, { Router, Request, Response } from 'express';

const router = Router();

// In-memory data (will be replaced with database)
const organizations: any[] = [];
const teams: any[] = [];
const users: any[] = [];

/**
 * Search Organizations
 * GET /api/v1/search/organizations?q=query&page=1&limit=10&sort=name&order=asc
 */
router.get('/organizations', (req: Request, res: Response) => {
  try {
    const { q = '', page = '1', limit = '10', sort = 'createdAt', order = 'desc' } = req.query;
    
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Filter organizations
    let filtered = organizations.filter(org =>
      org.name.toLowerCase().includes((q as string).toLowerCase()) ||
      org.description?.toLowerCase().includes((q as string).toLowerCase())
    );

    // Sort organizations
    filtered.sort((a: any, b: any) => {
      const aVal = a[sort as string];
      const bVal = b[sort as string];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });

    // Get total count
    const total = filtered.length;

    // Paginate
    const data = filtered.slice(offset, offset + limitNum);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Search failed',
      message: error.message,
    });
  }
});

/**
 * Search Teams
 * GET /api/v1/search/teams?q=query&page=1&limit=10&sort=name&order=asc
 */
router.get('/teams', (req: Request, res: Response) => {
  try {
    const { q = '', page = '1', limit = '10', sort = 'createdAt', order = 'desc' } = req.query;
    
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Filter teams
    let filtered = teams.filter(team =>
      team.name.toLowerCase().includes((q as string).toLowerCase()) ||
      team.description?.toLowerCase().includes((q as string).toLowerCase())
    );

    // Sort teams
    filtered.sort((a: any, b: any) => {
      const aVal = a[sort as string];
      const bVal = b[sort as string];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });

    // Get total count
    const total = filtered.length;

    // Paginate
    const data = filtered.slice(offset, offset + limitNum);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Search failed',
      message: error.message,
    });
  }
});

/**
 * Search Users
 * GET /api/v1/search/users?q=query&page=1&limit=10&sort=email&order=asc
 */
router.get('/users', (req: Request, res: Response) => {
  try {
    const { q = '', page = '1', limit = '10', sort = 'email', order = 'asc' } = req.query;
    
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 10));
    const offset = (pageNum - 1) * limitNum;

    // Filter users
    let filtered = users.filter(user =>
      user.email.toLowerCase().includes((q as string).toLowerCase()) ||
      user.firstName?.toLowerCase().includes((q as string).toLowerCase()) ||
      user.lastName?.toLowerCase().includes((q as string).toLowerCase())
    );

    // Sort users
    filtered.sort((a: any, b: any) => {
      const aVal = a[sort as string];
      const bVal = b[sort as string];
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1;
      if (aVal > bVal) return order === 'asc' ? 1 : -1;
      return 0;
    });

    // Get total count
    const total = filtered.length;

    // Paginate
    const data = filtered.slice(offset, offset + limitNum);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: 'Search failed',
      message: error.message,
    });
  }
});

export default router;
