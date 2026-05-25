import { Category } from "../categories/category.model.js";
import { Product } from "./product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { buildMeta, getPagination } from "../../utils/pagination.js";
import { createHttpError } from "../../utils/createHttpError.js";
import { toSlug } from "../../utils/slug.js";
import { recordInventoryLog, syncProductInventoryStatus } from "../inventory/inventory.service.js";
import { expireStalePendingVnpayOrders } from "../orders/order.service.js";

function scheduleCatalogInventoryCleanup() {
  void expireStalePendingVnpayOrders().catch(() => {
    // Cleanup keeps inventory reasonably fresh, but catalog responses must not block on it.
  });
}

function mapProductStatus(product) {
  if (product.stock === 0 || product.status === "out_of_stock") {
    return "out_of_stock";
  }

  if (product.featured) {
    return "featured";
  }

  if (product.compareAtPrice && product.compareAtPrice > product.price) {
    return "sale";
  }

  return "normal";
}

function sanitizeProduct(product) {
  const category = product.categoryId && typeof product.categoryId === "object"
    ? {
        id: product.categoryId.id,
        name: product.categoryId.name,
        slug: product.categoryId.slug,
      }
    : null;

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    featured: product.featured,
    batteryCapacity: product.batteryCapacity,
    screenType: product.screenType,
    screenDiagonal: product.screenDiagonal,
    protectionClass: product.protectionClass,
    builtInMemory: product.builtInMemory,
    status: product.status,
    displayStatus: mapProductStatus(product),
    category,
    image: product.images[0]?.url || "",
    images: product.images,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

function parseQueryValues(value) {
  if (Array.isArray(value)) {
    return value.flatMap((item) =>
      String(item || "")
        .split(",")
        .map((chunk) => chunk.trim())
        .filter(Boolean)
    );
  }

  return String(value || "")
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

async function buildProductFilter(query, options = {}) {
  const filter = {};
  const search = String(query.search || "").trim();
  const category = String(query.category || "").trim();
  const hasCategoryQuery = Boolean(category);
  const status = String(query.status || "").trim();
  const statusValues = parseQueryValues(query.status);
  const featured = query.featured;
  const batteryCapacityValues = parseQueryValues(query.batteryCapacity);
  const screenTypeValues = parseQueryValues(query.screenType);
  const screenDiagonalValues = parseQueryValues(query.screenDiagonal);
  const protectionClassValues = parseQueryValues(query.protectionClass);
  const builtInMemoryValues = parseQueryValues(query.builtInMemory);

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ];
  }

  if (category) {
    if (/^[a-f\d]{24}$/i.test(category)) {
      filter.categoryId = category;
    } else {
      const matchedCategory = await Category.findOne({
        slug: category,
        ...(options.publicOnly ? { isActive: true } : {}),
      }).select("_id");
      filter.categoryId = matchedCategory ? matchedCategory._id : null;
    }
  }

  if (featured !== undefined) {
    filter.featured = String(featured) === "true";
  }

  if (batteryCapacityValues.length) {
    filter.batteryCapacity = { $in: batteryCapacityValues };
  }

  if (screenTypeValues.length) {
    filter.screenType = { $in: screenTypeValues };
  }

  if (screenDiagonalValues.length) {
    filter.screenDiagonal = { $in: screenDiagonalValues };
  }

  if (protectionClassValues.length) {
    filter.protectionClass = { $in: protectionClassValues };
  }

  if (builtInMemoryValues.length) {
    filter.builtInMemory = { $in: builtInMemoryValues };
  }

  if (status) {
    if (status === "sale") {
      filter.compareAtPrice = { $gt: 0 };
    } else if (status === "featured") {
      filter.featured = true;
    } else if (status === "out_of_stock") {
      filter.$or = [
        ...(filter.$or || []),
        { status: "out_of_stock" },
        { stock: 0 },
      ];
    } else if (statusValues.length > 1) {
      filter.status = { $in: statusValues };
    } else {
      filter.status = status;
    }
  }

  if (options.publicOnly) {
    const activeCategoryIds = await Category.find({ isActive: true }).distinct("_id");

    if (hasCategoryQuery) {
      const isActiveCategory = activeCategoryIds.some(
        (categoryId) => String(categoryId) === String(filter.categoryId)
      );
      filter.categoryId = isActiveCategory ? filter.categoryId : null;
    } else {
      filter.categoryId = { $in: activeCategoryIds };
    }

    filter.status = { $in: ["active", "out_of_stock"] };
  }

  return filter;
}

function buildOptionList(items, key) {
  return [...new Set(items.map((item) => String(item[key] || "").trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

function buildProductSort(query) {
  const sortBy = String(query.sortBy || "createdAt");
  const order = String(query.order || "desc") === "asc" ? 1 : -1;

  if (["name", "price", "stock", "createdAt"].includes(sortBy)) {
    return { [sortBy]: order };
  }

  return { createdAt: -1 };
}

async function ensureCategoryExists(categoryId, options = {}) {
  const category = await Category.findById(categoryId);

  if (!category) {
    throw createHttpError(400, "Category does not exist");
  }

  if (options.requireActive && !category.isActive) {
    throw createHttpError(409, "Category is disabled and cannot accept live products");
  }

  return category;
}

export const listProducts = asyncHandler(async (req, res) => {
  scheduleCatalogInventoryCleanup();

  const { page, limit, skip } = getPagination(req.query);
  const filter = await buildProductFilter(req.query, { publicOnly: true });
  const sort = buildProductSort(req.query);

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("categoryId", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    message: "Products fetched successfully",
    data: items.map(sanitizeProduct),
    meta: buildMeta(page, limit, total),
  });
});

export const getProductDetail = asyncHandler(async (req, res) => {
  scheduleCatalogInventoryCleanup();

  const product = await Product.findOne({
    slug: req.params.slug,
    status: { $in: ["active", "out_of_stock"] },
  }).populate("categoryId", "name slug isActive");

  if (!product || !product.categoryId?.isActive) {
    throw createHttpError(404, "Product not found");
  }

  res.json({
    success: true,
    message: "Product fetched successfully",
    data: sanitizeProduct(product),
  });
});

export const listProductFilters = asyncHandler(async (req, res) => {
  scheduleCatalogInventoryCleanup();

  const filter = await buildProductFilter(
    {
      category: req.query.category,
    },
    { publicOnly: true }
  );

  const items = await Product.find(filter)
    .select("batteryCapacity screenType screenDiagonal protectionClass builtInMemory")
    .lean();

  res.json({
    success: true,
    message: "Product filters fetched successfully",
    data: {
      batteryCapacity: buildOptionList(items, "batteryCapacity"),
      screenType: buildOptionList(items, "screenType"),
      screenDiagonal: buildOptionList(items, "screenDiagonal"),
      protectionClass: buildOptionList(items, "protectionClass"),
      builtInMemory: buildOptionList(items, "builtInMemory"),
    },
  });
});

export const listAdminProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = await buildProductFilter(req.query);
  const sort = buildProductSort(req.query);

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate("categoryId", "name slug")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    message: "Admin products fetched successfully",
    data: items.map(sanitizeProduct),
    meta: buildMeta(page, limit, total),
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const sku = String(req.body.sku || "").trim().toUpperCase();
  const categoryId = String(req.body.categoryId || "").trim();

  if (!name || !sku || !categoryId) {
    throw createHttpError(400, "Name, SKU, and categoryId are required");
  }

  await ensureCategoryExists(categoryId, { requireActive: true });

  const slug = String(req.body.slug || toSlug(name)).trim().toLowerCase();
  const duplicate = await Product.findOne({
    $or: [{ slug }, { sku }],
  });

  if (duplicate) {
    throw createHttpError(409, "Product slug or SKU already exists");
  }

  const product = await Product.create({
    name,
    slug,
    sku,
    description: String(req.body.description || "").trim(),
    price: Number(req.body.price),
    compareAtPrice:
      req.body.compareAtPrice === undefined || req.body.compareAtPrice === null
        ? null
        : Number(req.body.compareAtPrice),
    stock: Number(req.body.stock ?? 0),
    status: String(req.body.status || "draft"),
    featured: Boolean(req.body.featured),
    batteryCapacity: String(req.body.batteryCapacity || "").trim(),
    screenType: String(req.body.screenType || "").trim(),
    screenDiagonal: String(req.body.screenDiagonal || "").trim(),
    protectionClass: String(req.body.protectionClass || "").trim(),
    builtInMemory: String(req.body.builtInMemory || "").trim(),
    categoryId,
    images: Array.isArray(req.body.images) ? req.body.images : [],
  });

  syncProductInventoryStatus(product);
  await product.save();

  await product.populate("categoryId", "name slug");

  res.status(201).json({
    success: true,
    message: "Product created successfully",
    data: sanitizeProduct(product),
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw createHttpError(404, "Product not found");
  }

  const nextName = req.body.name === undefined ? product.name : String(req.body.name).trim();
  const nextSku = req.body.sku === undefined ? product.sku : String(req.body.sku).trim().toUpperCase();
  const nextSlug =
    req.body.slug === undefined
      ? product.slug
      : String(req.body.slug || toSlug(nextName)).trim().toLowerCase();

  if (req.body.categoryId !== undefined) {
    await ensureCategoryExists(String(req.body.categoryId).trim(), { requireActive: true });
  }

  const duplicate = await Product.findOne({
    _id: { $ne: product._id },
    $or: [{ slug: nextSlug }, { sku: nextSku }],
  });

  if (duplicate) {
    throw createHttpError(409, "Product slug or SKU already exists");
  }

  const previousStock = product.stock;
  product.name = nextName;
  product.slug = nextSlug;
  product.sku = nextSku;
  product.description =
    req.body.description === undefined ? product.description : String(req.body.description || "").trim();
  product.price = req.body.price === undefined ? product.price : Number(req.body.price);
  product.compareAtPrice =
    req.body.compareAtPrice === undefined ? product.compareAtPrice : req.body.compareAtPrice === null
      ? null
      : Number(req.body.compareAtPrice);
  product.stock = req.body.stock === undefined ? product.stock : Number(req.body.stock);
  product.status = req.body.status === undefined ? product.status : String(req.body.status);
  product.featured =
    req.body.featured === undefined ? product.featured : Boolean(req.body.featured);
  product.batteryCapacity =
    req.body.batteryCapacity === undefined ? product.batteryCapacity : String(req.body.batteryCapacity || "").trim();
  product.screenType =
    req.body.screenType === undefined ? product.screenType : String(req.body.screenType || "").trim();
  product.screenDiagonal =
    req.body.screenDiagonal === undefined ? product.screenDiagonal : String(req.body.screenDiagonal || "").trim();
  product.protectionClass =
    req.body.protectionClass === undefined ? product.protectionClass : String(req.body.protectionClass || "").trim();
  product.builtInMemory =
    req.body.builtInMemory === undefined ? product.builtInMemory : String(req.body.builtInMemory || "").trim();
  product.categoryId =
    req.body.categoryId === undefined ? product.categoryId : String(req.body.categoryId).trim();
  product.images = Array.isArray(req.body.images) ? req.body.images : product.images;
  syncProductInventoryStatus(product);

  await product.save();
  await product.populate("categoryId", "name slug");

  if (product.stock !== previousStock) {
    await recordInventoryLog({
      product,
      delta: product.stock - previousStock,
      previousStock,
      nextStock: product.stock,
      reason: "product_updated",
      note: "Stock changed from product editor",
      actorType: "admin",
      actorId: req.admin?._id || null,
      referenceType: "product_update",
      referenceId: product._id,
      referenceCode: product.sku,
    });
  }

  res.json({
    success: true,
    message: "Product updated successfully",
    data: sanitizeProduct(product),
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw createHttpError(404, "Product not found");
  }

  product.status = "archived";
  await product.save();
  await product.populate("categoryId", "name slug");

  res.json({
    success: true,
    message: "Product archived successfully",
    data: sanitizeProduct(product),
  });
});

export const adjustProductInventory = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw createHttpError(404, "Product not found");
  }

  const type = String(req.body.type || "increase").trim();
  const quantity = Number(req.body.quantity);
  const reason = String(req.body.reason || "").trim();
  const note = String(req.body.note || "").trim();

  if (!["increase", "decrease", "set"].includes(type)) {
    throw createHttpError(400, "Unsupported inventory adjustment type");
  }

  if (!Number.isFinite(quantity) || quantity < 0) {
    throw createHttpError(400, "Inventory quantity must be a non-negative number");
  }

  if (!reason) {
    throw createHttpError(400, "Inventory adjustment reason is required");
  }

  const previousStock = product.stock;
  let nextStock = previousStock;

  if (type === "increase") {
    nextStock = previousStock + quantity;
  } else if (type === "decrease") {
    nextStock = previousStock - quantity;
  } else {
    nextStock = quantity;
  }

  if (nextStock < 0) {
    throw createHttpError(400, "Inventory cannot go below zero");
  }

  product.stock = nextStock;
  syncProductInventoryStatus(product);
  await product.save();
  await product.populate("categoryId", "name slug");

  const delta = nextStock - previousStock;

  if (delta !== 0) {
    await recordInventoryLog({
      product,
      delta,
      previousStock,
      nextStock,
      reason,
      note,
      actorType: "admin",
      actorId: req.admin?._id || null,
      referenceType: "adjustment",
      referenceId: product._id,
      referenceCode: product.sku,
    });
  }

  res.json({
    success: true,
    message: "Inventory adjusted successfully",
    data: sanitizeProduct(product),
  });
});
