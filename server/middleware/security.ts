import helmet from 'helmet';
import cors from 'cors';
import { env } from '../config/env';

export const securityHeaders = helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});

const allowedOrigins = new Set([
  ...env.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
  'https://webvision-tech-githubio.vercel.app',
]);

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    callback(null, !origin || allowedOrigins.has(origin));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});
