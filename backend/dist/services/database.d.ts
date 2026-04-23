/**
 * Database Service - SQLite Integration
 * Handles all database operations for Lapaas OS
 */
declare class DatabaseService {
    private db;
    /**
     * Initialize database connection
     */
    initialize(): Promise<void>;
    /**
     * Create database tables
     */
    private createTables;
    /**
     * Run a query
     */
    run(sql: string, params?: any[]): Promise<void>;
    /**
     * Get a single row
     */
    get(sql: string, params?: any[]): Promise<any>;
    /**
     * Get all rows
     */
    all(sql: string, params?: any[]): Promise<any[]>;
    /**
     * Close database connection
     */
    close(): Promise<void>;
    createUser(user: any): Promise<void>;
    getUserByEmail(email: string): Promise<any>;
    getUserById(id: string): Promise<any>;
    updateUser(id: string, updates: any): Promise<void>;
    createOrganization(org: any): Promise<void>;
    getOrganizationById(id: string): Promise<any>;
    getOrganizationsByOwnerId(ownerId: string): Promise<any[]>;
    getAllOrganizations(limit?: number, offset?: number): Promise<any[]>;
    searchOrganizations(query: string, limit?: number): Promise<any[]>;
    createTeam(team: any): Promise<void>;
    getTeamById(id: string): Promise<any>;
    getTeamsByOrganizationId(orgId: string, limit?: number, offset?: number): Promise<any[]>;
    searchTeams(query: string, limit?: number): Promise<any[]>;
    createActivity(activity: any): Promise<void>;
    getActivitiesByUserId(userId: string, limit?: number, offset?: number): Promise<any[]>;
    getActivitiesByResource(resource: string, limit?: number, offset?: number): Promise<any[]>;
    getAllActivities(limit?: number, offset?: number): Promise<any[]>;
    addMember(member: any): Promise<void>;
    getMembersByOrganizationId(orgId: string): Promise<any[]>;
    getMembersByTeamId(teamId: string): Promise<any[]>;
    updateMemberRole(userId: string, orgId: string, role: string): Promise<void>;
}
declare const _default: DatabaseService;
export default _default;
//# sourceMappingURL=database.d.ts.map