import { Router } from "express";
import { getCustomerDetail, listCustomers } from "./customer.controller.js";
import { requireAdminAuth } from "../../middlewares/requireAdminAuth.js";

export const customerRouter = Router();

customerRouter.use(requireAdminAuth);
customerRouter.get("/", listCustomers);
customerRouter.get("/:id", getCustomerDetail);
