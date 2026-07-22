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

        // user related permissions
        hasUserDataReadPermission: { type: Boolean, default: true },
        hasUserDataAddPermission: { type: Boolean, default: false },
        hasUserDataChangePermission: { type: Boolean, default: false },
        hasUserDataDeletePermission: { type: Boolean, default: false },

        // warehouse related permissions
        hasWarehouseDataReadPermission: { type: Boolean, default: false },
        hasWarehouseDataAddPermission: { type: Boolean, default: false },
        hasWarehouseDataChangePermission: { type: Boolean, default: false },
        hasWarehouseDataDeletePermission: { type: Boolean, default: false },

        // rack related permissions
        hasRackDataReadPermission: { type: Boolean, default: false },
        hasRackDataAddPermission: { type: Boolean, default: false },
        hasRackDataChangePermission: { type: Boolean, default: false },
        hasRackDataDeletePermission: { type: Boolean, default: false },

        // shelve related permissions
        hasShelveDataReadPermission: { type: Boolean, default: false },
        hasShelveDataAddPermission: { type: Boolean, default: false },
        hasShelveDataChangePermission: { type: Boolean, default: false },
        hasShelveDataDeletePermission: { type: Boolean, default: false },

        // registry related permissions
        hasRegistryDataReadPermission: { type: Boolean, default: false },
        hasRegistryDataAddPermission: { type: Boolean, default: false },
        hasRegistryDataChangePermission: { type: Boolean, default: false },
        hasRegistryDataDeletePermission: { type: Boolean, default: false },

        // create order related permissions
        hasCreateOrderDataReadPermission: { type: Boolean, default: false },
        hasCreateOrderDataAddPermission: { type: Boolean, default: false },
        hasCreateOrderDataChangePermission: { type: Boolean, default: false },
        hasCreateOrderDataDeletePermission: { type: Boolean, default: false },
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
  { timestamps: true }
);

const Role = mongoose.model("Role", roleSchema);
export default Role;