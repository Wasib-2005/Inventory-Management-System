import mongoose from "mongoose";
import logger from "../config/logger.js";

// ── 1. Create a Helper Collection for the Counter ───────────────────
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter =
  mongoose.models.Counter || mongoose.model("Counter", counterSchema);

// ── 2. The Main User Schema ─────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    // ── Core Identity ───────────────────────────────────────────────
    username: { type: String, required: true, trim: true, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, default: null, trim: true },
    photoUrl: { type: String, trim: true },

    // ── Profile ─────────────────────────────────────────────────────
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    displayName: { type: String, trim: true },
    dateOfBirth: { type: Date },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    timezone: { type: String, default: "UTC" },
    language: { type: String, default: "en" },

    // ── Employment & Auto-Generated Dynamic ID ──────────────────────
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "intern", "consultant", "contractor"],
      default: "full-time",
    },
    employmentStatus: {
      type: String,
      enum: ["active", "onboarding", "on-leave", "suspended", "terminated"],
      default: "onboarding",
    },
    hireDate: { type: Date },
    terminationDate: { type: Date },
    manager: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // ── Role ────────────────────────────────────────────────────────
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },

    // ── Security & Protection ───────────────────────────────────────
    password: { type: String, required: true },
    passwordChangedAt: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },

    // ── Session & Audit ─────────────────────────────────────────────
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },

    // ── Emergency / HR ──────────────────────────────────────────────
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    emergencyContact: { name: String, relationship: String, phone: String },

    // ── Soft Delete ─────────────────────────────────────────────────
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

// ── Virtuals ───────────────────────────────────────────────────────
userSchema.virtual("fullName").get(function () {
  if (!this.firstName && !this.lastName) return this.username;
  return `${this.firstName || ""} ${this.lastName || ""}`.trim();
});

userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// ── Pre-Save Hook: Dynamic Odometer Base-36 ID Generator ───────────
userSchema.pre("save", async function () {
  if (this.isNew && !this.employeeId) {
    try {
      // 1. Atomically increment sequential counter in the database
      const counter = await Counter.findOneAndUpdate(
        { _id: "employeeId_counter" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true },
      );

      // 2. Convert sequential number to Base-36 (0-9, A-Z)
      let base36Code = counter.seq.toString(36).toUpperCase();

      if (base36Code.length < 4) {
        base36Code = base36Code.padStart(4, "0");
      }

      this.employeeId = base36Code;
    } catch (error) {
      logger(error);
    }
  } else {
    logger("Problem Creating");
  }
});

// ── Query Middleware ───────────────────────────────────────────────
userSchema.pre(/^find/, function () {
  const query = this.getQuery();
  if (query && !("isDeleted" in query)) {
    this.where({ isDeleted: false });
  }
});

// ── Instance Methods ───────────────────────────────────────────────
userSchema.methods.incLoginAttempts = async function () {
  const MAX_ATTEMPTS = 5;
  const LOCK_DURATION = 5 * 60 * 1000;

  if (this.lockUntil && this.lockUntil <= Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1, lockUntil: null } });
  }

  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= MAX_ATTEMPTS) {
    updates.$set = { lockUntil: new Date(Date.now() + LOCK_DURATION) };
  }
  return this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({ $set: { loginAttempts: 0, lockUntil: null } });
};

const User = mongoose.model("User", userSchema);
export default User;
