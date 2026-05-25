import { Router } from "express";
import {
  listAdminContactInquiries,
  submitContactInquiry,
  updateAdminContactInquiryStatus,
} from "./contact.controller.js";
import { requireAdminAuth } from "../../middlewares/requireAdminAuth.js";

export const contactRouter = Router();
export const adminContactRouter = Router();

contactRouter.post("/", submitContactInquiry);

adminContactRouter.use(requireAdminAuth);
adminContactRouter.get("/", listAdminContactInquiries);
adminContactRouter.patch("/:id", updateAdminContactInquiryStatus);
