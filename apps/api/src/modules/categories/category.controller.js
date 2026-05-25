import { Category } from "./category.model.js";
import { Product } from "../products/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { buildMeta, getPagination } from "../../utils/pagination.js";
import { createHttpError } from "../../utils/createHttpError.js";
import { toSlug } from "../../utils/slug.js";

function sanitizeCategory(category, extras = {}) {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    image: category.image,
    description: category.description,
    isActive: category.isActive,
    sortOrder: category.sortOrder,
    createdAt: category.createdAt,
    updatedAt: category.updatedAt,
    productCount: extras.productCount ?? 0,
  };
}

async function ensureCategoryCanBeDisabled(category) {
  const activeProductCount = await Product.countDocuments({
    categoryId: category._id,
    status: { $in: ["active", "out_of_stock"] },
  });

  if (activeProductCount > 0) {
    throw createHttpError(
      409,
      `Cannot disable category while ${activeProductCount} live product(s) still use it`
    );
  }
}

async function queryCategories(req, options = {}) {
  const { page, limit, skip } = getPagination(req.query);
  const search = String(req.query.search || "").trim();
  const isActive = options.publicOnly
    ? true
    : req.query.isActive === undefined
      ? undefined
      : String(req.query.isActive) === "true";

  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  if (typeof isActive === "boolean") {
    filter.isActive = isActive;
  }

  const [items, total] = await Promise.all([
    Category.find(filter).sort({ sortOrder: 1, name: 1 }).skip(skip).limit(limit),
    Category.countDocuments(filter),
  ]);

  return {
    items,
    meta: buildMeta(page, limit, total),
  };
}

export const listCategories = asyncHandler(async (req, res) => {
  const result = await queryCategories(req, { publicOnly: true });

  res.json({
    success: true,
    message: "Categories fetched successfully",
    data: result.items.map(sanitizeCategory),
    meta: result.meta,
  });
});

export const listAdminCategories = asyncHandler(async (req, res) => {
  const result = await queryCategories(req);
  const categoryIds = result.items.map((item) => item._id);
  const productCounts = categoryIds.length
    ? await Product.aggregate([
        { $match: { categoryId: { $in: categoryIds } } },
        { $group: { _id: "$categoryId", count: { $sum: 1 } } },
      ])
    : [];
  const productCountMap = productCounts.reduce((acc, item) => {
    acc[String(item._id)] = item.count;
    return acc;
  }, {});

  res.json({
    success: true,
    message: "Admin categories fetched successfully",
    data: result.items.map((item) =>
      sanitizeCategory(item, {
        productCount: productCountMap[String(item._id)] || 0,
      })
    ),
    meta: result.meta,
  });
});

export const getCategoryDetail = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true });

  if (!category) {
    throw createHttpError(404, "Category not found");
  }

  res.json({
    success: true,
    message: "Category fetched successfully",
    data: sanitizeCategory(category),
  });
});

export const createCategory = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();

  if (!name) {
    throw createHttpError(400, "Category name is required");
  }

  const slug = String(req.body.slug || toSlug(name)).trim().toLowerCase();

  if (!slug) {
    throw createHttpError(400, "Category slug is required");
  }

  const existingCategory = await Category.findOne({
    $or: [{ name }, { slug }],
  });

  if (existingCategory) {
    throw createHttpError(409, "Category already exists");
  }

  const category = await Category.create({
    name,
    slug,
    image: String(req.body.image || "").trim(),
    description: String(req.body.description || "").trim(),
    isActive: req.body.isActive ?? true,
    sortOrder: Number(req.body.sortOrder) || 0,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    data: sanitizeCategory(category),
  });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw createHttpError(404, "Category not found");
  }

  const nextName = req.body.name === undefined ? category.name : String(req.body.name).trim();
  const nextSlug =
    req.body.slug === undefined
      ? category.slug
      : String(req.body.slug || toSlug(nextName)).trim().toLowerCase();

  const duplicate = await Category.findOne({
    _id: { $ne: category._id },
    $or: [{ name: nextName }, { slug: nextSlug }],
  });

  if (duplicate) {
    throw createHttpError(409, "Category name or slug already exists");
  }

  const willDisableCategory = req.body.isActive !== undefined && !Boolean(req.body.isActive) && category.isActive;

  if (willDisableCategory) {
    await ensureCategoryCanBeDisabled(category);
  }

  category.name = nextName;
  category.slug = nextSlug;
  category.image =
    req.body.image === undefined ? category.image : String(req.body.image || "").trim();
  category.description =
    req.body.description === undefined
      ? category.description
      : String(req.body.description || "").trim();
  category.isActive =
    req.body.isActive === undefined ? category.isActive : Boolean(req.body.isActive);
  category.sortOrder =
    req.body.sortOrder === undefined ? category.sortOrder : Number(req.body.sortOrder) || 0;

  await category.save();

  res.json({
    success: true,
    message: "Category updated successfully",
    data: sanitizeCategory(category),
  });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw createHttpError(404, "Category not found");
  }

  await ensureCategoryCanBeDisabled(category);
  category.isActive = false;
  await category.save();

  res.json({
    success: true,
    message: "Category disabled successfully",
    data: sanitizeCategory(category),
  });
});
