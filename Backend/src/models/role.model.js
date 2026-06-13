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
    roleRank: { type: Number, required: true },
    permissions: {
      type: {
        // product related permissions
        hasReadProductPermission: { type: Boolean, default: true },
        hasAddProductPermission: { type: Boolean, default: false },
        hasProductChangePermission: { type: Boolean, default: false },
        hasProductDeletePermission: { type: Boolean, default: false },

        // role related permissions
        hasReadRolePermission: { type: Boolean, default: true },
        hasNewRoleAddPermission: { type: Boolean, default: false },
        hasRolePermissionsChangePermission: { type: Boolean, default: false },
        hasNewRoleDeletePermission: { type: Boolean, default: false },

        // user related permission
        hasUserDataReadPermission: { type: Boolean, default: true },
        hasUserDataAddPermission: { type: Boolean, default: true },
        hasUserDataChangePermission: { type: Boolean, default: true },
        hasUserDataDeletePermission: { type: Boolean, default: true },
      },
      _id: false,
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
  { timestamps: true },
);

const Role = mongoose.model("Role", roleSchema);
export default Role;
