import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    lineTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const shippingAddressSchema = new mongoose.Schema(
  {
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
  },
  {
    _id: false,
  }
);

const paymentMetaSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      enum: ["", "manual", "vnpay"],
      default: "",
    },
    txnRef: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    paymentUrl: {
      type: String,
      default: "",
      trim: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    requestedBankCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    transactionNo: {
      type: String,
      default: "",
      trim: true,
    },
    bankCode: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    bankTranNo: {
      type: String,
      default: "",
      trim: true,
    },
    cardType: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },
    payDate: {
      type: String,
      default: "",
      trim: true,
    },
    responseCode: {
      type: String,
      default: "",
      trim: true,
    },
    transactionStatus: {
      type: String,
      default: "",
      trim: true,
    },
    lastUpdatedAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
      index: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => Array.isArray(items) && items.length > 0,
        message: "Order must have at least one item",
      },
    },
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    shippingMethodId: {
      type: String,
      enum: ["free", "express", "schedule"],
      default: "free",
      required: true,
    },
    shippingMethodLabel: {
      type: String,
      default: "Free",
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "bank_transfer", "card", "vnpay"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentMeta: {
      type: paymentMetaSchema,
      default: null,
    },
    orderStatus: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "delivered", "cancelled"],
      default: "pending",
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingFee: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    note: {
      type: String,
      default: "",
      trim: true,
    },
    inventoryReservedAt: {
      type: Date,
      default: null,
    },
    inventoryReleasedAt: {
      type: Date,
      default: null,
    },
    customerStatsCommittedAt: {
      type: Date,
      default: null,
    },
    paymentConfirmedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

orderSchema.index({ orderStatus: 1, createdAt: -1 });
orderSchema.index({ paymentStatus: 1, createdAt: -1 });
orderSchema.index({ "paymentMeta.txnRef": 1 }, { sparse: true });
orderSchema.index({ paymentMethod: 1, paymentStatus: 1, orderStatus: 1, "paymentMeta.expiresAt": 1 });

export const Order = mongoose.model("Order", orderSchema);
