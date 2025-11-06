/**
 * Zod validation schemas and sanitization helpers for feedback feature
 */

import { z } from "zod";

/**
 * HTML sanitization helper (strips all HTML tags)
 */
export function sanitize(input: string): string {
  return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Thread creation schema
 */
export const threadSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(120, "Title must be 120 characters or less")
    .transform(sanitize),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(4000, "Message must be 4000 characters or less")
    .transform(sanitize),
  category: z.enum(["bug", "feature", "ui", "other"], {
    errorMap: () => ({ message: "Category must be bug, feature, ui, or other" }),
  }),
});

export type ThreadInput = z.infer<typeof threadSchema>;

/**
 * Comment creation schema
 */
export const commentSchema = z.object({
  threadId: z.string().min(1, "Thread ID is required"),
  message: z
    .string()
    .min(2, "Comment must be at least 2 characters")
    .max(2000, "Comment must be 2000 characters or less")
    .transform(sanitize),
});

export type CommentInput = z.infer<typeof commentSchema>;

/**
 * Guest email feedback schema
 */
export const guestEmailSchema = z.object({
  category: z.enum(["bug", "feature", "ui", "other"], {
    errorMap: () => ({ message: "Category must be bug, feature, ui, or other" }),
  }),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters")
    .max(4000, "Message must be 4000 characters or less")
    .transform(sanitize),
  email: z
    .string()
    .email("Invalid email format")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  name: z
    .string()
    .max(100, "Name must be 100 characters or less")
    .optional()
    .or(z.literal(""))
    .transform((val) => (val === "" ? undefined : val)),
  company: z.string().max(0, "Honeypot field must be empty").optional(), // Honeypot
});

export type GuestEmailInput = z.infer<typeof guestEmailSchema>;
