import mongoose from "mongoose";

const blogSectionSchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: true,
      trim: true,
    },
    body: {
      type: [String],
      default: [],
    },
  },
  {
    _id: false,
  }
);

const blogPostSchema = new mongoose.Schema(
  {
    title: {
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
    category: {
      type: String,
      required: true,
      trim: true,
    },
    excerpt: {
      type: String,
      default: "",
      trim: true,
    },
    image: {
      type: String,
      default: "",
      trim: true,
    },
    readTime: {
      type: String,
      default: "4 min read",
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    authorName: {
      type: String,
      default: "CyberShop Editorial",
      trim: true,
    },
    sections: {
      type: [blogSectionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

blogPostSchema.index({ status: 1, publishedAt: -1, createdAt: -1 });

export const BlogPost = mongoose.model("BlogPost", blogPostSchema);
