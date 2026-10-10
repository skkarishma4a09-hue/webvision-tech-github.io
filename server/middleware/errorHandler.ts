import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[SERVER ERROR]:', err);

  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || 500;
  const errorTitle = err.error || 'Internal Server Error';
  const message = err.message || 'An unexpected error occurred on the server.';

  res.status(statusCode).json({
    error: errorTitle,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
