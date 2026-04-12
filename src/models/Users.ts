// src/models/User.ts
import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password?: string; // optional — only for email/password sign-up
  googleId?: string; // for Google OAuth users
  plan: "free" | "pro" | "premium";
  credits: number;
  lastCreditReset: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;

  // Method to compare password (for login)
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      // required: false → because Google users don't have it
    },
    googleId: {
      type: String,
      sparse: true, // allows null/undefined but keeps uniqueness index
      unique: true,
    },
    plan: {
      type: String,
      enum: ["free", "pro", "premium"],
      default: "free",
    },
    credits: {
      type: Number,
      default: 10, // free tier starting credits
      min: 0,
    },
    lastCreditReset: {
      type: Date,
      default: Date.now,
    },
    stripeCustomerId: {
      type: String,
      sparse: true,
    },
    stripeSubscriptionId: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true, 
  },
);

// Hash password before saving (only if modified and exists)
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  if (!this.password) return false; // Google-only users have no password
  return bcrypt.compare(candidatePassword, this.password);
};

// Export the model (use this in controllers)
export const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
