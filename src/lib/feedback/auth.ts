/**
 * Auth helper for feedback feature API routes
 * Integrates with the existing auth-backend system
 */

import { NextApiRequest } from "next";
import * as api from "@/lib/api";

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
}

/**
 * Get current authenticated user from API request
 * Uses the existing auth-backend for token verification
 */
export async function getCurrentUser(req: NextApiRequest): Promise<AuthUser | null> {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    try {
      // Use the existing API client to verify the token
      const userData = await api.getCurrentUser(token);
      
      return {
        id: userData.id,
        email: userData.email,
        username: userData.username,
        displayName: userData.username || userData.email,
      };
    } catch (apiError) {
      console.error('API auth verification failed:', apiError);
      return null;
    }
  } catch (error) {
    console.error('Auth verification failed:', error);
    return null;
  }
}
