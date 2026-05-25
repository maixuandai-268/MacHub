import { Order } from "./order.model.js";
import { Product } from "../products/product.model.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { buildMeta, getPagination } from "../../utils/pagination.js";
import { createHttpError } from "../../utils/createHttpError.js";
import { recordInventoryLog, syncProductInventoryStatus } from "../inventory/inventory.service.js";
import {
  createCheckoutOrder,
  expireStalePendingVnpayOrders,
  finalizeCodOrder,
  sanitizeOrder,
} from "./order.service.js";

function scheduleAdminOrderCleanup() {
  void expireStalePendingVnpayOrders().catch(() => {
    // Admin reads should not block while stale VNPay orders are being reconciled.
  });
}

function applyOrderStatusGroupFilter(filter, statusGroup) {
  if (!statusGroup) return;

  if (statusGroup === "completed") {
    filter.orderStatus = { $in: ["confirmed", "delivered"] };
    return;
  }

  if (statusGroup === "pending") {
    filter.orderStatus = { $in: ["pending", "shipping"] };
    return;
  }

  if (statusGroup === "cancelled") {
    filter.orderStatus = "cancelled";
  }
}

function applyPaymentStatusGroupFilter(filter, paymentGroup) {
  if (!paymentGroup) return;

  if (paymentGroup === "completed") {
    filter.paymentStatus = "paid";
    return;
  }

  if (paymentGroup === "pending") {
    filter.paymentStatus = "pending";
    return;
  }

  if (paymentGroup === "failed") {
    filter.paymentStatus = { $in: ["failed", "refunded"] };
  }
}

export const createOrder = asyncHandler(async (req, res) => {
  const paymentMethod = String(req.body.paymentMethod || "").trim();
  if (paymentMethod !== "cod") {
    throw createHttpError(400, "Use the VNPay payment endpoint for online payments");
  }

  const { order, customer } = await createCheckoutOrder({
    customerPayload: req.body.customer || {},
    shippingAddress: req.body.shippingAddress || {},
    paymentMethod,
    items: req.body.items,
    shippingMethodId: req.body.shippingMethodId,
    note: req.body.note,
    authenticatedCustomer: req.customer || null,
    paymentMeta: {
      provider: "manual",
      lastUpdatedAt: new Date(),
    },
  });

  await finalizeCodOrder(order, customer);

  res.status(201).json({
    success: true,
    message: "Order created successfully",
    data: sanitizeOrder(order),
  });
});

export const listAdminOrders = asyncHandler(async (req, res) => {
  scheduleAdminOrderCleanup();

  const { page, limit, skip } = getPagination(req.query);
  const search = String(req.query.search || "").trim();
  const paymentMethod = String(req.query.paymentMethod || "").trim();
  const orderStatus = String(req.query.orderStatus || "").trim();
  const orderStatusGroup = String(req.query.orderStatusGroup || "").trim();
  const paymentStatus = String(req.query.paymentStatus || "").trim();
  const paymentStatusGroup = String(req.query.paymentStatusGroup || "").trim();
  const filter = {};

  if (search) {
    filter.$or = [
      { orderCode: { $regex: search, $options: "i" } },
      { customerName: { $regex: search, $options: "i" } },
      { customerEmail: { $regex: search, $options: "i" } },
      { customerPhone: { $regex: search, $options: "i" } },
    ];
  }

  if (paymentMethod) {
    filter.paymentMethod = paymentMethod;
  }

  if (orderStatus) {
    filter.orderStatus = orderStatus;
  } else {
    applyOrderStatusGroupFilter(filter, orderStatusGroup);
  }

  if (paymentStatus) {
    filter.paymentStatus = paymentStatus;
  } else {
    applyPaymentStatusGroupFilter(filter, paymentStatusGroup);
  }

  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    message: "Orders fetched successfully",
    data: items.map(sanitizeOrder),
    meta: buildMeta(page, limit, total),
  });
});

export const getAdminOrderDetail = asyncHandler(async (req, res) => {
  scheduleAdminOrderCleanup();

  const order = await Order.findById(req.params.id);

  if (!order) {
    throw createHttpError(404, "Order not found");
  }

  res.json({
    success: true,
    message: "Order fetched successfully",
    data: sanitizeOrder(order),
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw createHttpError(404, "Order not found");
  }

  const nextOrderStatus = String(req.body.orderStatus || "").trim();
  const nextPaymentStatus = String(req.body.paymentStatus || "").trim();
  const previousOrderStatus = order.orderStatus;

  if (order.paymentMethod === "vnpay" && nextPaymentStatus === "paid" && order.paymentStatus !== "paid") {
    throw createHttpError(400, "VNPay orders can only be marked paid by a valid IPN callback");
  }

  if (nextOrderStatus) {
    order.orderStatus = nextOrderStatus;
  }

  if (nextPaymentStatus) {
    order.paymentStatus = nextPaymentStatus;
  }

  if (
    order.paymentMethod === "cod" &&
    order.orderStatus === "delivered" &&
    order.paymentStatus === "pending"
  ) {
    order.paymentStatus = "paid";
    order.paymentConfirmedAt = order.paymentConfirmedAt || new Date();
  }

  if (previousOrderStatus !== "cancelled" && order.orderStatus === "cancelled") {
    for (const item of order.items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        continue;
      }

      const previousStock = product.stock;
      product.stock += item.quantity;
      syncProductInventoryStatus(product);
      await product.save();
      await recordInventoryLog({
        product,
        delta: item.quantity,
        previousStock,
        nextStock: product.stock,
        reason: "order_cancelled",
        note: `Stock restored from cancelled order ${order.orderCode}`,
        actorType: "admin",
        actorId: req.admin?._id || null,
        referenceType: "order",
        referenceId: order._id,
        referenceCode: order.orderCode,
      });
    }
  }

  await order.save();

  res.json({
    success: true,
    message: "Order status updated successfully",
    data: sanitizeOrder(order),
  });
});
