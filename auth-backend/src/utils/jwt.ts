import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';

/**
 * JWT utility functions for token generation and verification
 */

interface AccessTokenPayload {
  userId: string;
  email: string;
  roles: string[];
}

interface RefreshTokenPayload {
  userId: string;
  tokenVersion: number;
}

/**
 * Generate short-lived access token (JWT)
 * Returned to client in response body
 * Used in Authorization: Bearer <token> header
 */
export const generateAccessToken = (payload: AccessTokenPayload): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET not configured');
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || '15m';

  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as string,
    issuer: 'chesspoint-auth',
  });
};

/**
 * Generate refresh token (opaque token or JWT)
 * Stored in HttpOnly cookie
 * Used to obtain new access tokens
 */
export const generateRefreshToken = (payload: RefreshTokenPayload): string => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET not configured');
  }

  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, {
    expiresIn: expiresIn as string,
    issuer: 'chesspoint-auth',
  });
};

/**
 * Verify refresh token and extract payload
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const secret = process.env.REFRESH_TOKEN_SECRET;
  if (!secret) {
    throw new Error('REFRESH_TOKEN_SECRET not configured');
  }

  return jwt.verify(token, secret, {
    issuer: 'chesspoint-auth',
  }) as RefreshTokenPayload;
};

/**
 * Hash refresh token for storage (prevents token reuse if DB is compromised)
 */
export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
