/**
 * API Route: /api/feedback/comments
 *
 * POST: Add comment to a thread (auth required)
 */

import { NextApiRequest, NextApiResponse } from "next";
import { getFeedbackCollections } from "@/lib/feedback/db";
import { commentSchema } from "@/lib/feedback/schemas";
import { getCurrentUser } from "@/lib/feedback/auth";
import { ObjectId } from "mongodb";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "POST") {
      return await handlePost(req, res);
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error: any) {
    console.error("Feedback comments API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

/**
 * POST /api/feedback/comments
 * Add comment to thread (auth required)
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  // Check authentication
  const user = await getCurrentUser(req);
  if (!user) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Validate request body
  const validation = commentSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const { threadId, message } = validation.data;

  // Verify thread exists
  const { threads, comments } = await getFeedbackCollections();

  let threadObjectId: ObjectId;
  try {
    threadObjectId = new ObjectId(threadId);
  } catch {
    return res.status(400).json({ error: "Invalid thread ID" });
  }

  const thread = await threads.findOne({ _id: threadObjectId });
  if (!thread) {
    return res.status(404).json({ error: "Thread not found" });
  }

  // Insert comment
  const result = await comments.insertOne({
    threadId: threadObjectId,
    message,
    userId: user.id,
    userName: user.displayName || user.username || user.email,
    createdAt: new Date(),
  });

  return res.status(201).json({
    comment: {
      id: result.insertedId.toString(),
      threadId,
      message,
      userId: user.id,
      userName: user.displayName || user.username || user.email,
      createdAt: new Date().toISOString(),
    },
  });
}
