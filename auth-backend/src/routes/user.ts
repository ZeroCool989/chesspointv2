import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { User } from '../models/User';

const router = Router();

/**
 * GET /me
 * Get current authenticated user information
 *
 * Protected route - requires valid JWT access token
 * Headers: Authorization: Bearer <access_token>
 * Returns: { user: { id, email, username, emailVerified, roles, createdAt, lastLoginAt } }
 */
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Fetch complete user data from database
    const user = await User.findById(req.user.id).select('-passwordHash -refreshToken');

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Return user information
    res.json({
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        emailVerified: user.emailVerified,
        roles: user.roles,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
