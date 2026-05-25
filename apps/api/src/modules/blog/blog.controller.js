import { BlogPost } from "./blog.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { buildMeta, getPagination } from "../../utils/pagination.js";
import { createHttpError } from "../../utils/createHttpError.js";
import { toSlug } from "../../utils/slug.js";

function formatDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateValue));
}

function normalizeBody(input) {
  if (Array.isArray(input)) {
    return input
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }

  return String(input || "")
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeSections(input) {
  if (!Array.isArray(input)) {
    return [];
  }

  return input
    .map((section) => ({
      heading: String(section?.heading || "").trim(),
      body: normalizeBody(section?.body),
    }))
    .filter((section) => section.heading && section.body.length);
}

function sanitizeBlogPost(post) {
  return {
    id: post.id,
    slug: post.slug,
    category: post.category,
    title: post.title,
    excerpt: post.excerpt,
    date: formatDate(post.publishedAt || post.updatedAt || post.createdAt),
    image: post.image,
    readTime: post.readTime,
    status: post.status,
    publishedAt: post.publishedAt,
    authorName: post.authorName,
    sections: post.sections,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

function buildAdminBlogFilter(query) {
  const filter = {};
  const search = String(query.search || "").trim();
  const status = String(query.status || "").trim();

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
    ];
  }

  if (status && status !== "all") {
    filter.status = status;
  }

  return filter;
}

export const listBlogPosts = asyncHandler(async (_req, res) => {
  const items = await BlogPost.find({ status: "published" }).sort({
    publishedAt: -1,
    createdAt: -1,
  });

  res.json({
    success: true,
    message: "Blog posts fetched successfully",
    data: items.map(sanitizeBlogPost),
  });
});

export const getBlogPostDetail = asyncHandler(async (req, res) => {
  const post = await BlogPost.findOne({
    slug: req.params.slug,
    status: "published",
  });

  if (!post) {
    throw createHttpError(404, "Blog post not found");
  }

  res.json({
    success: true,
    message: "Blog post fetched successfully",
    data: sanitizeBlogPost(post),
  });
});

export const listAdminBlogPosts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = buildAdminBlogFilter(req.query);

  const [items, total] = await Promise.all([
    BlogPost.find(filter).sort({ updatedAt: -1, createdAt: -1 }).skip(skip).limit(limit),
    BlogPost.countDocuments(filter),
  ]);

  res.json({
    success: true,
    message: "Admin blog posts fetched successfully",
    data: items.map(sanitizeBlogPost),
    meta: buildMeta(page, limit, total),
  });
});

export const createBlogPost = asyncHandler(async (req, res) => {
  const title = String(req.body.title || "").trim();
  const category = String(req.body.category || "").trim();
  const excerpt = String(req.body.excerpt || "").trim();

  if (!title || !category || !excerpt) {
    throw createHttpError(400, "Title, category, and excerpt are required");
  }

  const slug = String(req.body.slug || toSlug(title)).trim().toLowerCase();
  const duplicate = await BlogPost.findOne({ slug });

  if (duplicate) {
    throw createHttpError(409, "Blog post slug already exists");
  }

  const status = String(req.body.status || "draft");
  const publishedAt =
    req.body.publishedAt || status === "published" ? new Date(req.body.publishedAt || Date.now()) : null;

  const post = await BlogPost.create({
    title,
    slug,
    category,
    excerpt,
    image: String(req.body.image || "").trim(),
    readTime: String(req.body.readTime || "4 min read").trim(),
    status,
    publishedAt,
    authorName: String(req.body.authorName || "CyberShop Editorial").trim(),
    sections: normalizeSections(req.body.sections),
  });

  res.status(201).json({
    success: true,
    message: "Blog post created successfully",
    data: sanitizeBlogPost(post),
  });
});

export const updateBlogPost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);

  if (!post) {
    throw createHttpError(404, "Blog post not found");
  }

  const nextTitle = req.body.title === undefined ? post.title : String(req.body.title || "").trim();
  const nextSlug =
    req.body.slug === undefined
      ? post.slug
      : String(req.body.slug || toSlug(nextTitle)).trim().toLowerCase();

  const duplicate = await BlogPost.findOne({
    _id: { $ne: post._id },
    slug: nextSlug,
  });

  if (duplicate) {
    throw createHttpError(409, "Blog post slug already exists");
  }

  post.title = nextTitle;
  post.slug = nextSlug;
  post.category =
    req.body.category === undefined ? post.category : String(req.body.category || "").trim();
  post.excerpt =
    req.body.excerpt === undefined ? post.excerpt : String(req.body.excerpt || "").trim();
  post.image = req.body.image === undefined ? post.image : String(req.body.image || "").trim();
  post.readTime =
    req.body.readTime === undefined ? post.readTime : String(req.body.readTime || "").trim();
  post.status = req.body.status === undefined ? post.status : String(req.body.status || "draft");
  post.authorName =
    req.body.authorName === undefined
      ? post.authorName
      : String(req.body.authorName || "CyberShop Editorial").trim();

  if (req.body.sections !== undefined) {
    post.sections = normalizeSections(req.body.sections);
  }

  if (req.body.publishedAt !== undefined) {
    post.publishedAt = req.body.publishedAt ? new Date(req.body.publishedAt) : null;
  } else if (post.status === "published" && !post.publishedAt) {
    post.publishedAt = new Date();
  }

  await post.save();

  res.json({
    success: true,
    message: "Blog post updated successfully",
    data: sanitizeBlogPost(post),
  });
});

export const deleteBlogPost = asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);

  if (!post) {
    throw createHttpError(404, "Blog post not found");
  }

  post.status = "archived";
  await post.save();

  res.json({
    success: true,
    message: "Blog post archived successfully",
    data: sanitizeBlogPost(post),
  });
});
