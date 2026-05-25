import { Router } from "express";
import { requireCustomerAuth } from "../../middlewares/requireCustomerAuth.js";
import {
  createVnpayPayment,
  getMyVnpayPaymentStatus,
  handleVnpayIpn,
  handleVnpayReturn,
} from "./vnpay.controller.js";

export const vnpayRouter = Router();

vnpayRouter.post("/create", requireCustomerAuth, createVnpayPayment);
vnpayRouter.get("/ipn", handleVnpayIpn);
vnpayRouter.get("/return", handleVnpayReturn);
vnpayRouter.get("/status/:txnRef", requireCustomerAuth, getMyVnpayPaymentStatus);
