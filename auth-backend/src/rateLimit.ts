import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for authentication routes
 * Prevents brute force attacks by limiting requests per IP
 *
 * Configuration:
 * - 10 requests per 15 minutes per IP
 * - Applies to /auth/* routes
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip successful requests from counting against the limit (optional)
  skipSuccessfulRequests: false,
});

/**
 * Stricter rate limiter for login/register routes
 * Prevents rapid account creation and brute force login attempts
 *
 * Configuration:
 * - 5 requests per 15 minutes per IP
 */
export const strictAuthRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
