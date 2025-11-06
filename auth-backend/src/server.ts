import express, { Request, Response } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import { authRateLimiter } from './rateLimit';
import { requestLogger, errorLogger } from './middleware/logger';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import musicRoutes from './routes/music';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'REFRESH_TOKEN_SECRET',
  'FRONTEND_ORIGIN',
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Error: ${envVar} environment variable is not defined`);
    process.exit(1);
  }
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 4000;

/**
 * Security middleware
 */
app.use(helmet()); // Set security headers

/**
 * CORS configuration
 * Allows requests from frontend with credentials (cookies)
 */
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN!,
  'http://localhost:3000', // Next.js frontend
  'http://localhost:5173', // Vite frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

/**
 * Body parsing middleware
 */
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

/**
 * Request logging (development only)
 */
if (process.env.NODE_ENV !== 'production') {
  app.use(requestLogger);
}

/**
 * Health check endpoint
 */
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * Routes
 */
app.use('/auth', authRateLimiter, authRoutes); // Auth routes with rate limiting
app.use('/', userRoutes); // User routes (includes /me)
app.use('/music', musicRoutes); // Music proxy routes (bypasses CORS)

/**
 * 404 handler
 */
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

/**
 * Global error handler
 */
if (process.env.NODE_ENV !== 'production') {
  app.use(errorLogger);
}

app.use((err: Error, _req: Request, res: Response, _next: any) => {
  console.error('Unhandled error:', err);

  if (err.message === 'Not allowed by CORS') {
    res.status(403).json({ error: 'CORS policy violation' });
    return;
  }

  res.status(500).json({ error: 'Internal server error' });
});

/**
 * Start server
 */
const startServer = async () => {
  try {
    // Try to connect to MongoDB (non-blocking)
    await connectDatabase();

    // Start Express server regardless of DB connection
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ CORS enabled for: ${allowedOrigins.join(', ')}`);
      console.log('\nAvailable endpoints:');
      console.log('  GET  /health');
      console.log('  POST /auth/register');
      console.log('  POST /auth/login');
      console.log('  POST /auth/refresh');
      console.log('  POST /auth/logout');
      console.log('  GET  /me (protected)');
      console.log('  GET  /music/:fileId (Google Drive proxy)');
    })
    .on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n✗ Error: Port ${PORT} is already in use.`);
        console.error('\nTo fix this, you can:');
        console.error('  1. Kill the process using the port:');
        console.error(`     PowerShell/CMD: netstat -ano | findstr :${PORT}`);
        console.error('     Then: taskkill /PID <PID> /F');
        console.error(`  2. Or use: npx kill-port ${PORT}`);
        console.error('  3. Or change PORT in your .env file\n');
        process.exit(1);
      }
      throw err;
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;
