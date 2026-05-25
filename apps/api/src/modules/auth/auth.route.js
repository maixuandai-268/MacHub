import { Router } from "express";
import {
  getCurrentAdmin,
  loginAdmin,
  logoutAdmin,
  refreshAdmin,
} from "./auth.controller.js";
import { requireAdminAuth } from "../../middlewares/requireAdminAuth.js";

export const authRouter = Router();

authRouter.post("/admin/login", loginAdmin);
authRouter.get("/admin/me", requireAdminAuth, getCurrentAdmin);
authRouter.post("/admin/refresh", refreshAdmin);
authRouter.post("/admin/logout", logoutAdmin);
