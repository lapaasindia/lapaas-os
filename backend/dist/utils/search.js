"use strict";
/**
 * Search and Pagination Utilities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.parsePaginationParams = parsePaginationParams;
exports.createPaginatedResponse = createPaginatedResponse;
exports.searchInArray = searchInArray;
exports.sortArray = sortArray;
exports.paginateArray = paginateArray;
exports.searchSortPaginate = searchSortPaginate;
/**
 * Parse pagination parameters
 */
function parsePaginationParams(query) {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
    const offset = (page - 1) * limit;
    const sort = query.sort || 'createdAt';
    const order = (query.order || 'desc').toLowerCase() === 'asc' ? 'asc' : 'desc';
    return { limit, offset, sort, order };
}
/**
 * Create paginated response
 */
function createPaginatedResponse(data, total, page, limit) {
    return {
        data,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
        },
    };
}
/**
 * Search in array
 */
function searchInArray(items, query, searchFields) {
    if (!query)
        return items;
    const lowerQuery = query.toLowerCase();
    return items.filter(item => searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
            return value.toLowerCase().includes(lowerQuery);
        }
        return false;
    }));
}
/**
 * Sort array
 */
function sortArray(items, sortField, order = 'desc') {
    return items.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (aVal < bVal)
            return order === 'asc' ? -1 : 1;
        if (aVal > bVal)
            return order === 'asc' ? 1 : -1;
        return 0;
    });
}
/**
 * Paginate array
 */
function paginateArray(items, limit, offset) {
    return items.slice(offset, offset + limit);
}
/**
 * Search, sort, and paginate
 */
function searchSortPaginate(items, query, searchFields, sortField, order, limit, offset) {
    // Search
    let filtered = searchInArray(items, query, searchFields);
    // Sort
    filtered = sortArray(filtered, sortField, order);
    // Get total count
    const total = filtered.length;
    // Paginate
    const data = paginateArray(filtered, limit, offset);
    return { data, total };
}
//# sourceMappingURL=search.js.map