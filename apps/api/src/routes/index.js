import { Router } from "express";
import { healthRouter } from "../modules/health/health.route.js";
import { authRouter } from "../modules/auth/auth.route.js";
import {
  adminCategoryRouter,
  categoryRouter,
} from "../modules/categories/category.route.js";
import {
  adminProductRouter,
  productRouter,
} from "../modules/products/product.route.js";
import { adminBlogRouter, blogRouter } from "../modules/blog/blog.route.js";
import { customerRouter } from "../modules/customers/customer.route.js";
import { customerAuthRouter } from "../modules/customers/customer-auth.route.js";
import { customerMeRouter } from "../modules/customers/customer-me.route.js";
import {
  adminOrderRouter,
  orderRouter,
} from "../modules/orders/order.route.js";
import { dashboardRouter } from "../modules/dashboard/dashboard.route.js";
import { adminContactRouter, contactRouter } from "../modules/contact/contact.route.js";
import { inventoryRouter } from "../modules/inventory/inventory.route.js";
import { vnpayRouter } from "../modules/payments/vnpay.route.js";
import { adminUploadRouter } from "../modules/uploads/upload.route.js";

export const apiRouter = Router();
const adminRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/products", productRouter);
apiRouter.use("/blog-posts", blogRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/payments/vnpay", vnpayRouter);
apiRouter.use("/contact", contactRouter);
apiRouter.use("/auth/customer", customerAuthRouter);
apiRouter.use("/me", customerMeRouter);

adminRouter.use("/categories", adminCategoryRouter);
adminRouter.use("/products", adminProductRouter);
adminRouter.use("/blog-posts", adminBlogRouter);
adminRouter.use("/customers", customerRouter);
adminRouter.use("/orders", adminOrderRouter);
adminRouter.use("/dashboard", dashboardRouter);
adminRouter.use("/inventory", inventoryRouter);
adminRouter.use("/contact-inquiries", adminContactRouter);
adminRouter.use("/uploads", adminUploadRouter);

apiRouter.use("/admin", adminRouter);
