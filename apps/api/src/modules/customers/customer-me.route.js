import { Router } from "express";
import { requireCustomerAuth } from "../../middlewares/requireCustomerAuth.js";
import {
  createMyAddress,
  deleteMyAddress,
  getMyOrders,
  getMyProfile,
  updateMyAddress,
  updateMyProfile,
} from "./customer-me.controller.js";

export const customerMeRouter = Router();

customerMeRouter.use(requireCustomerAuth);
customerMeRouter.get("/profile", getMyProfile);
customerMeRouter.patch("/profile", updateMyProfile);
customerMeRouter.get("/orders", getMyOrders);
customerMeRouter.post("/addresses", createMyAddress);
customerMeRouter.patch("/addresses/:addressId", updateMyAddress);
customerMeRouter.delete("/addresses/:addressId", deleteMyAddress);
