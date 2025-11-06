import { Request, Response, NextFunction } from 'express';

/**
 * Request logging middleware for development
 * Logs all incoming requests with timing
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  // Log request
  console.log(`\n[${timestamp}] ${req.method} ${req.path}`);
  if (Object.keys(req.body).length > 0) {
    // Don't log sensitive data
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '***';
    console.log('  Body:', JSON.stringify(sanitizedBody, null, 2));
  }
  if (Object.keys(req.query).length > 0) {
    console.log('  Query:', req.query);
  }

  // Log response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const statusColor = res.statusCode >= 400 ? '\x1b[31m' : '\x1b[32m';
    const reset = '\x1b[0m';
    console.log(`  ${statusColor}${res.statusCode}${reset} - ${duration}ms`);
  });

  next();
};

/**
 * Error logging middleware
 * Logs detailed error information in development
 */
export const errorLogger = (
  err: Error,
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  console.error('\n❌ ERROR:');
  console.error('  Message:', err.message);
  console.error('  Stack:', err.stack);
  console.error('  Path:', req.path);
  console.error('  Method:', req.method);
  console.error('  Body:', req.body);

  next(err);
};
