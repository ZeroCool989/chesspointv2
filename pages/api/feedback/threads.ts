/**
 * API Route: /api/feedback/threads
 *
 * GET:  List latest threads with recent comments
 * POST: Create new thread (auth required)
 */

import { NextApiRequest, NextApiResponse } from "next";
import { getFeedbackCollections } from "@/lib/feedback/db";
import { threadSchema } from "@/lib/feedback/schemas";
import { getCurrentUser } from "@/lib/feedback/auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "GET") {
      return await handleGet(req, res);
    } else if (req.method === "POST") {
      return await handlePost(req, res);
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error: any) {
    console.error("Feedback threads API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * GET /api/feedback/threads
 * Returns latest 50 threads with up to 20 recent comments each
 */
async function handleGet(_req: NextApiRequest, res: NextApiResponse) {
  try {
    const { threads, comments } = await getFeedbackCollections();

    // Fetch latest 50 threads, sorted by newest first
    const threadDocs = await threads
      .find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();

    // Fetch comments for these threads (up to 20 per thread)
    const threadIds = threadDocs.map((t) => t._id);
    const commentDocs = await comments
      .find({ threadId: { $in: threadIds } })
      .sort({ createdAt: 1 })
      .toArray();

    // Group comments by thread
    const commentsByThread = new Map<string, any[]>();
    for (const comment of commentDocs) {
      const threadIdStr = comment.threadId.toString();
      if (!commentsByThread.has(threadIdStr)) {
        commentsByThread.set(threadIdStr, []);
      }
      commentsByThread.get(threadIdStr)!.push({
        id: comment._id.toString(),
        message: comment.message,
        userId: comment.userId,
        userName: comment.userName,
        createdAt: comment.createdAt.toISOString(),
      });
    }

    // Combine threads with their comments (limit to 20 most recent per thread)
    const result = threadDocs.map((thread) => {
      const threadIdStr = thread._id.toString();
      const threadComments = commentsByThread.get(threadIdStr) || [];

      return {
        id: threadIdStr,
        title: thread.title,
        message: thread.message,
        category: thread.category,
        userId: thread.userId,
        userName: thread.userName,
        createdAt: thread.createdAt.toISOString(),
        comments: threadComments.slice(-20), // Latest 20 comments
      };
    });

    return res.status(200).json({ threads: result });
  } catch (error) {
    console.error('Database error in handleGet:', error);
    // Return empty array if database is not available
    return res.status(200).json({ threads: [] });
  }
}

/**
 * POST /api/feedback/threads
 * Create new thread (auth required)
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const user = await getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Validate request body
  const validation = threadSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const { title, message, category } = validation.data;

  try {
    // Insert thread
    const { threads } = await getFeedbackCollections();
    const result = await threads.insertOne({
      title,
      message,
      category,
      userId: user.id,
      userName: user.displayName || user.username || user.email,
      createdAt: new Date(),
    });

    return res.status(201).json({
      thread: {
        id: result.insertedId.toString(),
        title,
        message,
        category,
        userId: user.id,
        userName: user.displayName || user.username || user.email,
        createdAt: new Date().toISOString(),
        comments: [],
      },
    });
  } catch (error) {
    console.error('Database error in handlePost:', error);
    return res.status(500).json({ error: "Database connection failed. Please try again later." });
  }
}
