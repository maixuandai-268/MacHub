import { Router } from "express";
import { requireAdminAuth } from "../../middlewares/requireAdminAuth.js";
import { createAdminUploadResponse, uploadAdminImages } from "./upload.controller.js";

export const adminUploadRouter = Router();

adminUploadRouter.use(requireAdminAuth);
adminUploadRouter.post("/images", uploadAdminImages, createAdminUploadResponse);
