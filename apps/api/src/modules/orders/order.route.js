import { Router } from "express";
import {
  createOrder,
  getAdminOrderDetail,
  listAdminOrders,
  updateOrderStatus,
} from "./order.controller.js";
import { requireAdminAuth } from "../../middlewares/requireAdminAuth.js";
import { requireCustomerAuth } from "../../middlewares/requireCustomerAuth.js";

export const orderRouter = Router();
export const adminOrderRouter = Router();

orderRouter.post("/", requireCustomerAuth, createOrder);

adminOrderRouter.use(requireAdminAuth);
adminOrderRouter.get("/", listAdminOrders);
adminOrderRouter.get("/:id", getAdminOrderDetail);
adminOrderRouter.patch("/:id/status", updateOrderStatus);
