import { Router } from "express";
import { getCurrentCustomer, loginCustomer, logoutCustomer, refreshCustomer, registerCustomer } from "./customer-auth.controller.js";
import { requireCustomerAuth } from "../../middlewares/requireCustomerAuth.js";

export const customerAuthRouter = Router();

customerAuthRouter.post("/register", registerCustomer);
customerAuthRouter.post("/login", loginCustomer);
customerAuthRouter.get("/me", requireCustomerAuth, getCurrentCustomer);
customerAuthRouter.post("/refresh", refreshCustomer);
customerAuthRouter.post("/logout", logoutCustomer);
