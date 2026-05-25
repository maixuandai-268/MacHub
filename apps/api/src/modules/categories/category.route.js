import { Router } from "express";
import {
  createCategory,
  deleteCategory,
  getCategoryDetail,
  listAdminCategories,
  listCategories,
  updateCategory,
} from "./category.controller.js";
import { requireAdminAuth } from "../../middlewares/requireAdminAuth.js";

export const categoryRouter = Router();
export const adminCategoryRouter = Router();

categoryRouter.get("/", listCategories);
categoryRouter.get("/:slug", getCategoryDetail);

adminCategoryRouter.use(requireAdminAuth);
adminCategoryRouter.get("/", listAdminCategories);
adminCategoryRouter.post("/", createCategory);
adminCategoryRouter.patch("/:id", updateCategory);
adminCategoryRouter.delete("/:id", deleteCategory);
