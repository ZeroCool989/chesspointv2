import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, hashToken } from '../utils/jwt';
import { LoginLog } from '../models/LoginLog';

const router = Router();

/**
 * POST /auth/register
 * Register a new user account
 *
 * Body: { email, password, username? }
 * Returns: { accessToken, user: { id, email, username, emailVerified, roles } }
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, username } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        error: 'Validation failed',
        details: [
          ...(!email ? [{ field: 'email', message: 'Email is required' }] : []),
          ...(!password ? [{ field: 'password', message: 'Password is required' }] : []),
        ]
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        error: 'Validation failed',
        details: [{ field: 'email', message: 'Invalid email format' }]
      });
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      res.status(400).json({
        error: 'Validation failed',
        details: [{ field: 'password', message: 'Password must be at least 8 characters' }]
      });
      return;
    }

    // Check if user already exists (case-insensitive)
    const existingUser = await User.findOne({
      email: email.toLowerCase()
    }).collation({ locale: 'en', strength: 2 });

    if (existingUser) {
      res.status(400).json({
        error: 'Validation failed',
        details: [{ field: 'email', message: 'Email already registered' }]
      });
      return;
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = new User({
      email: email.toLowerCase(),
      passwordHash,
      username: username?.trim() || null,
      emailVerified: false,
      roles: ['user'],
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      tokenVersion: user.refreshTokenVersion,
    });

    // Store hashed refresh token
    user.refreshToken = hashToken(refreshToken);
    user.lastLoginAt = new Date();
    await user.save();

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Log successful registration
    await LoginLog.create({
      userId: user._id,
      email: user.email,
      action: 'register',
      success: true,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Return access token and user info
    res.status(201).json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified,
        roles: user.roles,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /auth/login
 * Login with email or username and password
 *
 * Body: { email, password } (email can be either email or username)
 * Returns: { accessToken, user: { id, email, username, emailVerified, roles } }
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({
        error: 'Email/username and password are required'
      });
      return;
    }

    // Find user by email OR username (case-insensitive, include passwordHash)
    // Check if input looks like an email (contains @)
    const isEmail = email.includes('@');
    const searchQuery = isEmail
      ? { email: email.toLowerCase() }
      : { username: email.trim() };

    const user = await User.findOne(searchQuery)
      .collation({ locale: 'en', strength: 2 })
      .select('+passwordHash +refreshToken');

    if (!user) {
      // Log failed login attempt
      await LoginLog.create({
        email: isEmail ? email.toLowerCase() : email.toLowerCase(),
        action: 'login',
        success: false,
        failureReason: 'User not found',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      // Log failed login attempt
      await LoginLog.create({
        userId: user._id,
        email: user.email || email.toLowerCase(),
        action: 'login',
        success: false,
        failureReason: 'Invalid password',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
    });

    const refreshToken = generateRefreshToken({
      userId: user._id.toString(),
      tokenVersion: user.refreshTokenVersion,
    });

    // Store hashed refresh token
    user.refreshToken = hashToken(refreshToken);
    user.lastLoginAt = new Date();
    await user.save();

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Log successful login
    await LoginLog.create({
      userId: user._id,
      email: user.email || email.toLowerCase(), // Use user email or fallback to login input
      action: 'login',
      success: true,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Return access token and user info
    res.json({
      accessToken,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified,
        roles: user.roles,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token from cookie
 *
 * Returns: { accessToken }
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ error: 'No refresh token provided' });
      return;
    }

    // Verify refresh token
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch (error) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Find user and verify refresh token
    const user = await User.findById(payload.userId).select('+refreshToken');

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    // Check token version (for invalidating all tokens)
    if (payload.tokenVersion !== user.refreshTokenVersion) {
      res.status(401).json({ error: 'Token version mismatch' });
      return;
    }

    // Verify stored refresh token matches
    const hashedToken = hashToken(refreshToken);
    if (user.refreshToken !== hashedToken) {
      res.status(401).json({ error: 'Invalid refresh token' });
      return;
    }

    // Generate new access token
    const accessToken = generateAccessToken({
      userId: user._id.toString(),
      email: user.email,
      roles: user.roles,
    });

    res.json({ accessToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * POST /auth/logout
 * Logout user by invalidating refresh token
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const payload = verifyRefreshToken(refreshToken);
        const user = await User.findById(payload.userId);

        if (user) {
          // Clear refresh token from database
          user.refreshToken = undefined;
          await user.save();
        }
      } catch (error) {
        // Ignore errors during logout
        console.log('Logout token verification failed (expected for invalid tokens)');
      }
    }

    // Clear refresh token cookie
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
