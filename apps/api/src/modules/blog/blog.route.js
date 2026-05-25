import { Router } from "express";
import { requireAdminAuth } from "../../middlewares/requireAdminAuth.js";
import {
  createBlogPost,
  deleteBlogPost,
  getBlogPostDetail,
  listAdminBlogPosts,
  listBlogPosts,
  updateBlogPost,
} from "./blog.controller.js";

export const blogRouter = Router();
export const adminBlogRouter = Router();

blogRouter.get("/", listBlogPosts);
blogRouter.get("/:slug", getBlogPostDetail);

adminBlogRouter.use(requireAdminAuth);
adminBlogRouter.get("/", listAdminBlogPosts);
adminBlogRouter.post("/", createBlogPost);
adminBlogRouter.patch("/:id", updateBlogPost);
adminBlogRouter.delete("/:id", deleteBlogPost);
