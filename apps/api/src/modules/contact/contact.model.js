import mongoose from "mongoose";

const contactInquirySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["new", "reviewed", "closed"],
      default: "new",
    },
    source: {
      type: String,
      default: "website",
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

contactInquirySchema.index({ status: 1, createdAt: -1 });
contactInquirySchema.index({ email: 1, createdAt: -1 });

export const ContactInquiry = mongoose.model("ContactInquiry", contactInquirySchema);
