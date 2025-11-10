import nodemailer from 'nodemailer';

/**
 * Email utility for sending password reset emails
 * Uses the same configuration as the frontend feedback system
 */

// Read from process.env directly (not as constants) to ensure values are loaded
function getGmailUser() {
  return process.env.GMAIL_USER || 'chesspoint.io@gmail.com';
}

function getGmailAppPassword() {
  return process.env.GMAIL_APP_PASSWORD;
}

function getEmailFrom() {
  return process.env.EMAIL_FROM || 'Chesspoint <chesspoint.io@gmail.com>';
}

function getFrontendUrl() {
  return process.env.FRONTEND_URL || 'http://localhost:3000';
}

/**
 * Create Gmail SMTP transporter
 */
function createTransporter() {
  // Read from process.env directly (not cached constants)
  const gmailUser = getGmailUser();
  const gmailAppPassword = getGmailAppPassword();
  
  // Debug: Log what we have
  console.log('[DEBUG Email] GMAIL_USER:', gmailUser ? 'Set' : 'NOT SET');
  console.log('[DEBUG Email] GMAIL_APP_PASSWORD:', gmailAppPassword ? 'Set (hidden)' : 'NOT SET');
  console.log('[DEBUG Email] process.env.GMAIL_USER:', process.env.GMAIL_USER ? 'Set' : 'NOT SET');
  console.log('[DEBUG Email] process.env.GMAIL_APP_PASSWORD:', process.env.GMAIL_APP_PASSWORD ? 'Set' : 'NOT SET');
  
  if (!gmailUser || !gmailAppPassword) {
    console.warn('GMAIL_USER or GMAIL_APP_PASSWORD not configured. Email sending disabled.');
    console.warn('[DEBUG] GMAIL_USER value:', gmailUser);
    console.warn('[DEBUG] GMAIL_APP_PASSWORD value:', gmailAppPassword ? '***hidden***' : 'undefined');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailAppPassword,
    },
  });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.error('Cannot send email: Email transporter not configured');
    throw new Error('Email service not configured');
  }

  const resetUrl = `${getFrontendUrl()}/reset-password?token=${resetToken}`;

  const subject = 'Reset Your Chesspoint Password';

  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #7B5AF0; margin: 0;">Chesspoint</h1>
      </div>

      <div style="background: white; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="color: #1B1B1F; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #374151; line-height: 1.6;">
          You requested to reset your password for your Chesspoint account. Click the button below to reset your password:
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="display: inline-block; padding: 12px 30px; background: linear-gradient(135deg, #7B5AF0 0%, #A78BFA 100%); 
                    color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
            Reset Password
          </a>
        </div>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
          Or copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #7B5AF0; word-break: break-all;">${resetUrl}</a>
        </p>

        <p style="color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <strong>Important:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
        </p>
      </div>

      <p style="font-size: 12px; color: #6b7280; text-align: center; margin-top: 20px;">
        Sent from Chesspoint Password Reset System
      </p>
    </div>
  `;

  const textBody = `
Chesspoint - Password Reset Request

You requested to reset your password for your Chesspoint account.

Click the following link to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email.

---
Sent from Chesspoint Password Reset System
  `.trim();

  try {
    await transporter.sendMail({
      from: getEmailFrom(),
      to: email,
      subject,
      text: textBody,
      html: htmlBody,
    });
    console.log(`Password reset email sent to: ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}

