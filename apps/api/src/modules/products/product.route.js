import { Router } from "express";
import {
  adjustProductInventory,
  createProduct,
  deleteProduct,
  getProductDetail,
  listAdminProducts,
  listProductFilters,
  listProducts,
  updateProduct,
} from "./product.controller.js";
import { requireAdminAuth } from "../../middlewares/requireAdminAuth.js";

export const productRouter = Router();
export const adminProductRouter = Router();

productRouter.get("/", listProducts);
productRouter.get("/filters", listProductFilters);
productRouter.get("/:slug", getProductDetail);

adminProductRouter.use(requireAdminAuth);
adminProductRouter.get("/", listAdminProducts);
adminProductRouter.post("/", createProduct);
adminProductRouter.patch("/:id/inventory", adjustProductInventory);
adminProductRouter.patch("/:id", updateProduct);
adminProductRouter.delete("/:id", deleteProduct);
