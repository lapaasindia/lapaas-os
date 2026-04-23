/**
 * Search and Pagination Utilities
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

/**
 * Parse pagination parameters
 */
export function parsePaginationParams(query: any): { limit: number; offset: number; sort?: string; order: 'asc' | 'desc' } {
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
export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number,
  limit: number
): PaginatedResponse<T> {
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
export function searchInArray<T>(
  items: T[],
  query: string,
  searchFields: (keyof T)[]
): T[] {
  if (!query) return items;

  const lowerQuery = query.toLowerCase();
  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerQuery);
      }
      return false;
    })
  );
}

/**
 * Sort array
 */
export function sortArray<T>(
  items: T[],
  sortField: keyof T,
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return items.sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Paginate array
 */
export function paginateArray<T>(
  items: T[],
  limit: number,
  offset: number
): T[] {
  return items.slice(offset, offset + limit);
}

/**
 * Search, sort, and paginate
 */
export function searchSortPaginate<T>(
  items: T[],
  query: string,
  searchFields: (keyof T)[],
  sortField: keyof T,
  order: 'asc' | 'desc',
  limit: number,
  offset: number
): { data: T[]; total: number } {
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
