import mongoose, { Schema, Document } from 'mongoose';

export interface ILoginLog extends Document {
  userId?: string;
  email?: string;
  action?: string;
  success: boolean;
  ipAddress?: string;
  userAgent?: string;
  failureReason?: string;
  timestamp: Date;
}

const loginLogSchema = new Schema<ILoginLog>({
  userId: {
    type: String,
    index: true,
  },
  email: {
    type: String,
    required: false,
    lowercase: true,
    index: true,
  },
  action: {
    type: String,
    enum: ['login', 'register', 'logout', 'password_reset'],
    index: true,
  },
  success: {
    type: Boolean,
    required: true,
    index: true,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  failureReason: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

export const LoginLog = mongoose.model<ILoginLog>('LoginLog', loginLogSchema);
