import mongoose from "mongoose";
import argon2 from "argon2";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI ||
  "mongodb://waslla:20050511@localhost:27017/inventory-management-system?authSource=admin&directConnection=true";

// ─── 1. SCHEMAS ──────────────────────────────────────────────────────────────

const roleSchema = new mongoose.Schema(
  {
    roleTitle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    roleRank: { type: Number, required: true },
    permissions: {
      type: Object,
      default: {},
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true, unique: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    canEditOwnData: { type: Boolean, required: true, default: true },
    phone: { type: String, default: null, trim: true },
    employeeId: { type: String, unique: true, sparse: true, trim: true, uppercase: true },
    employmentType: { type: String, default: "full-time" },
    employmentStatus: { type: String, default: "active" },
    role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    password: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: true },
    emailVerified: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Pre-save hook for Employee ID counter
userSchema.pre("save", async function () {
  if (this.isNew && !this.employeeId) {
    try {
      const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);
      const counter = await Counter.findOneAndUpdate(
        { _id: "employeeId_counter" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      let base36Code = counter.seq.toString(36).toUpperCase();
      if (base36Code.length < 4) base36Code = base36Code.padStart(4, "0");
      this.employeeId = base36Code;
    } catch (err) {
      console.error("Error generating employeeId:", err);
    }
  }
});

const Role = mongoose.models.Role || mongoose.model("Role", roleSchema);
const User = mongoose.models.User || mongoose.model("User", userSchema);

// ─── 2. MAIN SCRIPT ──────────────────────────────────────────────────────────

async function run() {
  const args = process.argv.slice(2);
  const email = args[0];
  const rawPassword = args[1];

  if (!email || !rawPassword) {
    console.error("\n❌ Error: Missing email or password arguments.");
    console.log("Usage: node tempAdmin.js <email> <password>\n");
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log(" Connected to database.");

    // Generate Admin User ID upfront to satisfy Role.createdBy required constraint
    const adminUserId = new mongoose.Types.ObjectId();

    // 1. Check or Create Admin Role
    let adminRole = await Role.findOne({ roleTitle: "admin" });

    if (!adminRole) {
      console.log("Creating 'admin' role with full permissions...");
      adminRole = await Role.create({
        roleTitle: "admin",
        roleRank: 1,
        createdBy: adminUserId,
        permissions: {
          // product
          hasReadProductPermission: true,
          hasAddProductPermission: true,
          hasProductChangePermission: true,
          hasProductDeletePermission: true,
          // role
          hasReadRolePermission: true,
          hasNewRoleAddPermission: true,
          hasRolePermissionsChangePermission: true,
          hasNewRoleDeletePermission: true,
          // user
          hasUserDataReadPermission: true,
          hasUserDataAddPermission: true,
          hasUserDataChangePermission: true,
          hasUserDataDeletePermission: true,
          // warehouse
          hasWarehouseDataReadPermission: true,
          hasWarehouseDataAddPermission: true,
          hasWarehouseDataChangePermission: true,
          hasWarehouseDataDeletePermission: true,
          // rack
          hasRackDataReadPermission: true,
          hasRackDataAddPermission: true,
          hasRackDataChangePermission: true,
          hasRackDataDeletePermission: true,
          // shelve
          hasShelveDataReadPermission: true,
          hasShelveDataAddPermission: true,
          hasShelveDataChangePermission: true,
          hasShelveDataDeletePermission: true,
          // registry
          hasRegistryDataReadPermission: true,
          hasRegistryDataAddPermission: true,
          hasRegistryDataChangePermission: true,
          hasRegistryDataDeletePermission: true,
          // create order
          hasCreateOrderDataReadPermission: true,
          hasCreateOrderDataAddPermission: true,
          hasCreateOrderDataChangePermission: true,
          hasCreateOrderDataDeletePermission: true,
        },
      });
      console.log(" 'admin' role created successfully.");
    } else {
      console.log(" 'admin' role already exists.");
    }

    // 2. Check if User already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log(` User with email "${email}" already exists.`);
      await mongoose.disconnect();
      return;
    }

    // 3. Hash Password with Argon2id
    console.log("Hashing password...");
    const hashedPassword = await argon2.hash(rawPassword, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    // 4. Create User
    console.log("Creating admin user account...");
    const username = email.split("@")[0];

    const newUser = new User({
      _id: adminUserId,
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: adminRole._id,
      canEditOwnData: true,
      employmentStatus: "active",
      isActive: true,
      isVerified: true,
      emailVerified: true,
      createdBy: adminUserId,
    });

    await newUser.save();

    console.log("\n==============================================");
    console.log(" Admin account created successfully!");
    console.log(` Email       : ${newUser.email}`);
    console.log(` Username    : ${newUser.username}`);
    console.log(` Employee ID : ${newUser.employeeId}`);
    console.log(` Role        : admin (${adminRole._id})`);
    console.log("==============================================\n");

  } catch (error) {
    console.error("❌ Setup failed:", error.message || error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
  }
}

run();