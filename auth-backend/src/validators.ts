import { z } from 'zod';

/**
 * Password validation: minimum 8 characters, must contain:
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Email validation: proper email format
 */
const emailSchema = z.string().email('Invalid email format').toLowerCase();

/**
 * Username validation: optional, max 40 characters
 */
const usernameSchema = z.string().max(40, 'Username must be 40 characters or less').optional();

/**
 * Register request body schema
 */
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  username: usernameSchema,
});

/**
 * Login request body schema
 * Note: 'email' field accepts either email or username
 */
export const loginSchema = z.object({
  email: z.string().min(1, 'Email or username is required'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * Type exports for TypeScript
 */
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
