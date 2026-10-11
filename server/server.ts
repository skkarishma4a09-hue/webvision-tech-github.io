import express from 'express';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { securityHeaders, corsMiddleware } from './middleware/security';
import apiRouter from './routes/index';
import { errorHandler } from './middleware/errorHandler';

const app = express();

// Security & Parsing Middlewares
app.use(securityHeaders);
app.use(corsMiddleware);
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging in dev
app.use((req, res, next) => {
  if (env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  }
  next();
});

// Health Checks
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Synapse Platform API (Phase 2)',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// API Routes Hub
app.use('/api', apiRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.originalUrl} does not exist on this server.`,
    },
  });
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = parseInt(env.PORT, 10) || 5000;

if (process.env.NODE_ENV !== 'test' && process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Synapse Phase 2 Server running at http://localhost:${PORT}`);
  });
}

export default app;
