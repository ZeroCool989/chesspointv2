/**
 * Nodemailer helper for sending guest feedback emails via Gmail SMTP
 */

import nodemailer from "nodemailer";

if (!process.env.GMAIL_USER) {
  throw new Error("Please add GMAIL_USER to .env");
}

if (!process.env.GMAIL_APP_PASSWORD) {
  throw new Error("Please add GMAIL_APP_PASSWORD to .env (Google App Password)");
}

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
const EMAIL_TO = process.env.EMAIL_TO || "chesspoint.io@gmail.com";
const EMAIL_FROM = process.env.EMAIL_FROM || "Chesspoint Feedback <chesspoint.io@gmail.com>";

/**
 * Create Gmail SMTP transporter
 */
function createTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: GMAIL_USER,
      pass: GMAIL_APP_PASSWORD,
    },
  });
}

/**
 * Send guest feedback email
 */
export async function sendGuestFeedback(data: {
  category: string;
  message: string;
  email?: string;
  name?: string;
}): Promise<void> {
  const transporter = createTransporter();

  // Create subject line: [Feedback-Guest][category] First 60 chars of message
  const messagePreview = data.message.substring(0, 60) + (data.message.length > 60 ? "..." : "");
  const subject = `[Feedback-Guest][${data.category}] ${messagePreview}`;

  // Create email body
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 8px;">
      <h2 style="color: #7B5AF0; margin-bottom: 20px;">New Guest Feedback</h2>

      <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
        <p style="margin: 0 0 10px 0;"><strong>Category:</strong> <span style="background: #e0e7ff; color: #4c1d95; padding: 4px 8px; border-radius: 4px;">${data.category}</span></p>
        ${data.name ? `<p style="margin: 0 0 10px 0;"><strong>Name:</strong> ${data.name}</p>` : ""}
        ${data.email ? `<p style="margin: 0 0 10px 0;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #7B5AF0;">${data.email}</a></p>` : ""}
      </div>

      <div style="background: white; padding: 20px; border-radius: 8px;">
        <h3 style="margin-top: 0; color: #1f2937;">Message:</h3>
        <p style="white-space: pre-wrap; line-height: 1.6; color: #374151;">${data.message}</p>
      </div>

      <p style="margin-top: 20px; font-size: 12px; color: #6b7280; text-align: center;">
        Sent from Chesspoint Feedback System
      </p>
    </div>
  `;

  const textBody = `
New Guest Feedback

Category: ${data.category}
${data.name ? `Name: ${data.name}` : ""}
${data.email ? `Email: ${data.email}` : ""}

Message:
${data.message}

---
Sent from Chesspoint Feedback System
  `.trim();

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: EMAIL_TO,
    subject,
    text: textBody,
    html: htmlBody,
  });
}
