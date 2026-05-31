import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    roleTitle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    permissions: {
      type: {
        // product related permissions
        hasReadProductPermission: { type: Boolean, default: true },
        hasAddProductPermission: { type: Boolean, default: false },
        hasProductChangeermission: { type: Boolean, default: false },
        hasProductDeletePermission: { type: Boolean, default: false },

        // role related permissions
        hasNewRoleAddPermission: { type: Boolean, default: false },
        hasRolePermissionsChangePermission: { type: Boolean, default: false },
        hasNewRoleDeletePermission: { type: Boolean, default: false },
        // everyone can read there permissions



      },
      _id: false,
      default: {},
    },
  },
  { timestamps: true },
);

const Role = mongoose.model("Role", roleSchema);
export default Role;
