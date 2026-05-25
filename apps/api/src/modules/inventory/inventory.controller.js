import { asyncHandler } from "../../utils/asyncHandler.js";
import { buildMeta, getPagination } from "../../utils/pagination.js";
import { InventoryLog } from "./inventory-log.model.js";

function sanitizeInventoryLog(log) {
  return {
    id: log.id,
    productId: log.productId,
    productName: log.productName,
    sku: log.sku,
    delta: log.delta,
    previousStock: log.previousStock,
    nextStock: log.nextStock,
    reason: log.reason,
    note: log.note,
    actorType: log.actorType,
    referenceType: log.referenceType,
    referenceId: log.referenceId,
    referenceCode: log.referenceCode,
    createdAt: log.createdAt,
  };
}

export const listAdminInventoryLogs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const search = String(req.query.search || "").trim();
  const reason = String(req.query.reason || "").trim();
  const actorType = String(req.query.actorType || "").trim();
  const deltaType = String(req.query.deltaType || "").trim();
  const nextStockZero =
    req.query.nextStockZero === undefined
      ? undefined
      : String(req.query.nextStockZero) === "true";
  const filter = {};

  if (search) {
    filter.$or = [
      { productName: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
      { referenceCode: { $regex: search, $options: "i" } },
    ];
  }

  if (reason) {
    filter.reason = reason;
  }

  if (actorType) {
    filter.actorType = actorType;
  }

  if (deltaType === "positive") {
    filter.delta = { $gt: 0 };
  } else if (deltaType === "negative") {
    filter.delta = { $lt: 0 };
  }

  if (typeof nextStockZero === "boolean") {
    filter.nextStock = nextStockZero ? 0 : { $ne: 0 };
  }

  const [items, total] = await Promise.all([
    InventoryLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    InventoryLog.countDocuments(filter),
  ]);

  res.json({
    success: true,
    message: "Inventory logs fetched successfully",
    data: items.map(sanitizeInventoryLog),
    meta: buildMeta(page, limit, total),
  });
});
