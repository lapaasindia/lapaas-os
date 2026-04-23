import { PoolClient } from 'pg';
declare const pool: any;
export declare const query: (text: string, params?: any[]) => any;
export declare const getClient: () => Promise<PoolClient>;
export declare const closePool: () => Promise<void>;
export default pool;
//# sourceMappingURL=database.d.ts.map