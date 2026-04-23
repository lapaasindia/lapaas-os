import { Pool, PoolClient } from 'pg';
import { logger } from './logger';

const pool = new Pool({
  user: process.env.DATABASE_USER || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432'),
  database: process.env.DATABASE_NAME || 'lapaas_dev',
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const getClient = async (): Promise<PoolClient> => {
  return pool.connect();
};

export const closePool = async () => {
  await pool.end();
};

export default pool;
