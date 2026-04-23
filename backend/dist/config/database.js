"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.closePool = exports.getClient = exports.query = void 0;
const pg_1 = require("pg");
const logger_1 = require("./logger");
const pool = new pg_1.Pool({
    user: process.env.DATABASE_USER || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432'),
    database: process.env.DATABASE_NAME || 'lapaas_dev',
});
pool.on('error', (err) => {
    logger_1.logger.error('Unexpected error on idle client', err);
});
const query = (text, params) => {
    return pool.query(text, params);
};
exports.query = query;
const getClient = async () => {
    return pool.connect();
};
exports.getClient = getClient;
const closePool = async () => {
    await pool.end();
};
exports.closePool = closePool;
exports.default = pool;
//# sourceMappingURL=database.js.map