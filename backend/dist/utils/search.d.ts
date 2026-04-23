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
export declare function parsePaginationParams(query: any): {
    limit: number;
    offset: number;
    sort?: string;
    order: 'asc' | 'desc';
};
/**
 * Create paginated response
 */
export declare function createPaginatedResponse<T>(data: T[], total: number, page: number, limit: number): PaginatedResponse<T>;
/**
 * Search in array
 */
export declare function searchInArray<T>(items: T[], query: string, searchFields: (keyof T)[]): T[];
/**
 * Sort array
 */
export declare function sortArray<T>(items: T[], sortField: keyof T, order?: 'asc' | 'desc'): T[];
/**
 * Paginate array
 */
export declare function paginateArray<T>(items: T[], limit: number, offset: number): T[];
/**
 * Search, sort, and paginate
 */
export declare function searchSortPaginate<T>(items: T[], query: string, searchFields: (keyof T)[], sortField: keyof T, order: 'asc' | 'desc', limit: number, offset: number): {
    data: T[];
    total: number;
};
//# sourceMappingURL=search.d.ts.map