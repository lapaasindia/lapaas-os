"use strict";
/**
 * Search and Pagination Routes - Week 6
 * Handles search and pagination for all resources
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// In-memory data (will be replaced with database)
const organizations = [];
const teams = [];
const users = [];
/**
 * Search Organizations
 * GET /api/v1/search/organizations?q=query&page=1&limit=10&sort=name&order=asc
 */
router.get('/organizations', (req, res) => {
    try {
        const { q = '', page = '1', limit = '10', sort = 'createdAt', order = 'desc' } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const offset = (pageNum - 1) * limitNum;
        // Filter organizations
        let filtered = organizations.filter(org => org.name.toLowerCase().includes(q.toLowerCase()) ||
            org.description?.toLowerCase().includes(q.toLowerCase()));
        // Sort organizations
        filtered.sort((a, b) => {
            const aVal = a[sort];
            const bVal = b[sort];
            if (aVal < bVal)
                return order === 'asc' ? -1 : 1;
            if (aVal > bVal)
                return order === 'asc' ? 1 : -1;
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
    }
    catch (error) {
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
router.get('/teams', (req, res) => {
    try {
        const { q = '', page = '1', limit = '10', sort = 'createdAt', order = 'desc' } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const offset = (pageNum - 1) * limitNum;
        // Filter teams
        let filtered = teams.filter(team => team.name.toLowerCase().includes(q.toLowerCase()) ||
            team.description?.toLowerCase().includes(q.toLowerCase()));
        // Sort teams
        filtered.sort((a, b) => {
            const aVal = a[sort];
            const bVal = b[sort];
            if (aVal < bVal)
                return order === 'asc' ? -1 : 1;
            if (aVal > bVal)
                return order === 'asc' ? 1 : -1;
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
    }
    catch (error) {
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
router.get('/users', (req, res) => {
    try {
        const { q = '', page = '1', limit = '10', sort = 'email', order = 'asc' } = req.query;
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
        const offset = (pageNum - 1) * limitNum;
        // Filter users
        let filtered = users.filter(user => user.email.toLowerCase().includes(q.toLowerCase()) ||
            user.firstName?.toLowerCase().includes(q.toLowerCase()) ||
            user.lastName?.toLowerCase().includes(q.toLowerCase()));
        // Sort users
        filtered.sort((a, b) => {
            const aVal = a[sort];
            const bVal = b[sort];
            if (aVal < bVal)
                return order === 'asc' ? -1 : 1;
            if (aVal > bVal)
                return order === 'asc' ? 1 : -1;
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
    }
    catch (error) {
        res.status(500).json({
            error: 'Search failed',
            message: error.message,
        });
    }
});
exports.default = router;
//# sourceMappingURL=searchAndPagination.js.map