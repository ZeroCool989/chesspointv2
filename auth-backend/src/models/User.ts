import mongoose, { Document, Schema } from 'mongoose';

/**
 * User interface extending Mongoose Document
 */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  username?: string;
  emailVerified: boolean;
  roles: string[];
  refreshToken?: string;
  refreshTokenVersion: number;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User schema with case-insensitive email and security features
 */
const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true, // Automatically lowercase email
      trim: true,
      // Note: index and unique are defined below with case-insensitive collation
    },
    passwordHash: {
      type: String,
      required: true,
      select: false, // Don't include password hash by default in queries
    },
    username: {
      type: String,
      maxlength: 40,
      trim: true,
      default: null,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    roles: {
      type: [String],
      default: ['user'],
    },
    // Store current refresh token hash for validation and rotation
    refreshToken: {
      type: String,
      select: false,
    },
    // Version number to invalidate all refresh tokens
    refreshTokenVersion: {
      type: Number,
      default: 0,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

/**
 * Create case-insensitive unique index on email
 * This prevents duplicate emails like "User@Email.com" and "user@email.com"
 */
userSchema.index(
  { email: 1 },
  {
    unique: true,
    collation: { locale: 'en', strength: 2 }, // Case-insensitive comparison
  }
);

/**
 * Pre-save middleware to update updatedAt timestamp
 * Note: timestamps: true handles this, but showing explicit handling
 */
userSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

/**
 * Instance method to get safe user object (without sensitive fields)
 */
userSchema.methods.toSafeObject = function () {
  return {
    id: this._id,
    email: this.email,
    username: this.username,
    emailVerified: this.emailVerified,
    roles: this.roles,
    createdAt: this.createdAt,
    lastLoginAt: this.lastLoginAt,
  };
};

export const User = mongoose.model<IUser>('User', userSchema);
