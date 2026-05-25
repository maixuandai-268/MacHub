import mongoose from "mongoose";

const productImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    alt: {
      type: String,
      default: "",
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    sku: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    compareAtPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    stock: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["draft", "active", "archived", "out_of_stock"],
      default: "draft",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    batteryCapacity: {
      type: String,
      default: "",
      trim: true,
    },
    screenType: {
      type: String,
      default: "",
      trim: true,
    },
    screenDiagonal: {
      type: String,
      default: "",
      trim: true,
    },
    protectionClass: {
      type: String,
      default: "",
      trim: true,
    },
    builtInMemory: {
      type: String,
      default: "",
      trim: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    images: {
      type: [productImageSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productSchema.index({ status: 1, featured: 1, createdAt: -1 });

export const Product = mongoose.model("Product", productSchema);
