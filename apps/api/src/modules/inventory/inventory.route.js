import { Router } from "express";
import { requireAdminAuth } from "../../middlewares/requireAdminAuth.js";
import { listAdminInventoryLogs } from "./inventory.controller.js";

export const inventoryRouter = Router();

inventoryRouter.use(requireAdminAuth);
inventoryRouter.get("/", listAdminInventoryLogs);
