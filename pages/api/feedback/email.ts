/**
 * API Route: /api/feedback/email
 *
 * POST: Send guest feedback email (no auth required, no DB insert)
 */

import { NextApiRequest, NextApiResponse } from "next";
import { guestEmailSchema } from "@/lib/feedback/schemas";
import { sendGuestFeedback } from "@/lib/feedback/mailer";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "100kb", // Limit request body size
    },
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method === "POST") {
      return await handlePost(req, res);
    } else {
      return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error: any) {
    console.error("Guest feedback email error:", error);
    return res.status(500).json({ error: "Failed to send feedback email" });
  }
}

/**
 * POST /api/feedback/email
 * Send guest feedback via email
 */
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  // Validate request body
  const validation = guestEmailSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: "Validation failed",
      details: validation.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const { category, message, email, name, company } = validation.data;

  // Honeypot check
  if (company && company.length > 0) {
    // Bot detected - pretend success but don't send email
    return res.status(200).json({ success: true });
  }

  // Send email
  await sendGuestFeedback({
    category,
    message,
    email,
    name,
  });

  return res.status(200).json({ success: true });
}
