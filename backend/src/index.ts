import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pinoHttp from 'pino-http';
import { logger } from '@config/logger';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp({ logger }));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API version endpoint
app.get('/api/v1', (req: Request, res: Response) => {
  res.json({
    version: '1.0.0',
    name: 'Lapaas OS API',
    environment: process.env.NODE_ENV,
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString(),
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error(err);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message,
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${PORT}`);
  logger.info(`📝 API Documentation: http://localhost:${PORT}/api/docs`);
  logger.info(`🏥 Health Check: http://localhost:${PORT}/api/health`);
});

export default app;
