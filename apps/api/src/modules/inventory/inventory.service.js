import { InventoryLog } from "./inventory-log.model.js";

export async function recordInventoryLog({
  product,
  delta,
  previousStock,
  nextStock,
  reason,
  note = "",
  actorType = "system",
  actorId = null,
  referenceType = "adjustment",
  referenceId = null,
  referenceCode = "",
}) {
  if (!product || !delta) {
    return null;
  }

  return InventoryLog.create({
    productId: product._id,
    productName: product.name,
    sku: product.sku,
    delta,
    previousStock,
    nextStock,
    reason,
    note,
    actorType,
    actorId,
    referenceType,
    referenceId,
    referenceCode,
  });
}

export function syncProductInventoryStatus(product) {
  if (!product || ["draft", "archived"].includes(product.status)) {
    return product;
  }

  if (product.stock <= 0) {
    product.status = "out_of_stock";
    return product;
  }

  if (product.status === "out_of_stock") {
    product.status = "active";
  }

  return product;
}
