import mongoose from "mongoose";
import Role from "./role.model.js";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: null },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
    },
    
    password: { type: String, required: true },

    // ── Brute-force protection ────────────────────────────────
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
  },
  { timestamps: true },
);

// Helper: is the account currently locked?
userSchema.virtual("isLocked").get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

// Increment failed attempt; lock after 5th failure for 5 minutes
userSchema.methods.incLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION = 5 * 60 * 1000; // 5 min in ms

  // If a previous lock has expired, reset and start fresh
  if (this.lockUntil && this.lockUntil <= Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1, lockUntil: null } });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= MAX_ATTEMPTS) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_DURATION) };
  }
  return this.updateOne(updates);
};

// Reset on successful login
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({ $set: { loginAttempts: 0, lockUntil: null } });
};

const User = mongoose.model("User", userSchema);
export default User;
