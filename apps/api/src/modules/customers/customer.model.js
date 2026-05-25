import mongoose from "mongoose";

function createAddressId() {
  return new mongoose.Types.ObjectId().toString();
}

const customerAddressSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      default: createAddressId,
    },
    label: {
      type: String,
      default: "HOME",
      trim: true,
      uppercase: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      default: "",
      trim: true,
    },
    ward: {
      type: String,
      default: "",
      trim: true,
    },
    district: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: "Vietnam",
      trim: true,
    },
    postalCode: {
      type: String,
      default: "",
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    isRegistered: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "vip"],
      default: "active",
    },
    totalSpend: {
      type: Number,
      default: 0,
      min: 0,
    },
    orderCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    addresses: {
      type: [customerAddressSchema],
      default: [],
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

customerSchema.index({ email: 1 });
customerSchema.index({ phone: 1 }, { unique: true });
customerSchema.index({ status: 1, createdAt: -1 });

export const Customer = mongoose.model("Customer", customerSchema);
