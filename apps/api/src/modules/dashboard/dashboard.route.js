import { Router } from "express";
import { requireAdminAuth } from "../../middlewares/requireAdminAuth.js";
import { getDashboardSummary } from "./dashboard.controller.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireAdminAuth);
dashboardRouter.get("/summary", getDashboardSummary);
