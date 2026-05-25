import { asyncHandler } from "../../utils/asyncHandler.js";
import { createHttpError } from "../../utils/createHttpError.js";
import { ContactInquiry } from "./contact.model.js";
import { buildMeta, getPagination } from "../../utils/pagination.js";

function sanitizeContactInquiry(inquiry) {
  return {
    id: inquiry.id,
    name: inquiry.name,
    email: inquiry.email,
    subject: inquiry.subject,
    message: inquiry.message,
    status: inquiry.status,
    source: inquiry.source,
    createdAt: inquiry.createdAt,
    updatedAt: inquiry.updatedAt,
  };
}

export const submitContactInquiry = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const subject = String(req.body.subject || "").trim();
  const message = String(req.body.message || "").trim();

  if (!name || !email || !subject || !message) {
    throw createHttpError(400, "Name, email, subject, and message are required");
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    throw createHttpError(400, "Email is not valid");
  }

  const inquiry = await ContactInquiry.create({
    name,
    email,
    subject,
    message,
    source: "website",
  });

  res.status(201).json({
    success: true,
    message: "Inquiry submitted successfully",
    data: {
      id: inquiry.id,
      status: inquiry.status,
      createdAt: inquiry.createdAt,
    },
  });
});

export const listAdminContactInquiries = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = String(req.query.search || "").trim();
  const status = String(req.query.status || "").trim();
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { subject: { $regex: search, $options: "i" } },
      { message: { $regex: search, $options: "i" } },
    ];
  }

  if (status) {
    filter.status = status;
  }

  const [items, total] = await Promise.all([
    ContactInquiry.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ContactInquiry.countDocuments(filter),
  ]);

  res.json({
    success: true,
    message: "Contact inquiries fetched successfully",
    data: items.map(sanitizeContactInquiry),
    meta: buildMeta(page, limit, total),
  });
});

export const updateAdminContactInquiryStatus = asyncHandler(async (req, res) => {
  const inquiry = await ContactInquiry.findById(req.params.id);

  if (!inquiry) {
    throw createHttpError(404, "Inquiry not found");
  }

  const nextStatus = String(req.body.status || "").trim();

  if (!["new", "reviewed", "closed"].includes(nextStatus)) {
    throw createHttpError(400, "Unsupported inquiry status");
  }

  inquiry.status = nextStatus;
  await inquiry.save();

  res.json({
    success: true,
    message: "Inquiry updated successfully",
    data: sanitizeContactInquiry(inquiry),
  });
});
