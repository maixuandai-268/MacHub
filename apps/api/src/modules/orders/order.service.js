import { Customer } from "../customers/customer.model.js";
import { recordInventoryLog, syncProductInventoryStatus } from "../inventory/inventory.service.js";
import { Product } from "../products/product.model.js";
import { Order } from "./order.model.js";
import { createHttpError } from "../../utils/createHttpError.js";
import { generateOrderCode } from "../../utils/orderCode.js";

export const SHIPPING_METHODS = {
  free: {
    id: "free",
    label: "Free",
    price: 0,
  },
  express: {
    id: "express",
    label: "Express",
    price: 8500,
  },
  schedule: {
    id: "schedule",
    label: "Schedule",
    price: 29000,
  },
};

const TAX_RATE = 0.0213;
const SUPPORTED_PAYMENT_METHODS = new Set(["cod", "bank_transfer", "card", "vnpay"]);
const VNPAY_EXPIRY_GRACE_MS = 2 * 60 * 1000;

function sanitizePaymentMeta(paymentMeta = null) {
  if (!paymentMeta?.provider) {
    return null;
  }

  return {
    provider: paymentMeta.provider,
    txnRef: paymentMeta.txnRef || "",
    paymentUrl: paymentMeta.paymentUrl || "",
    expiresAt: paymentMeta.expiresAt || null,
    requestedBankCode: paymentMeta.requestedBankCode || "",
    transactionNo: paymentMeta.transactionNo || "",
    bankCode: paymentMeta.bankCode || "",
    bankTranNo: paymentMeta.bankTranNo || "",
    cardType: paymentMeta.cardType || "",
    payDate: paymentMeta.payDate || "",
    responseCode: paymentMeta.responseCode || "",
    transactionStatus: paymentMeta.transactionStatus || "",
    lastUpdatedAt: paymentMeta.lastUpdatedAt || null,
  };
}

export function sanitizeOrder(order) {
  return {
    id: order.id,
    orderCode: order.orderCode,
    customerId: order.customerId,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    items: order.items,
    shippingAddress: order.shippingAddress,
    shippingMethodId: order.shippingMethodId,
    shippingMethodLabel: order.shippingMethodLabel,
    paymentMethod: order.paymentMethod,
    paymentStatus: order.paymentStatus,
    paymentMeta: sanitizePaymentMeta(order.paymentMeta),
    orderStatus: order.orderStatus,
    subtotal: order.subtotal,
    taxAmount: order.taxAmount,
    shippingFee: order.shippingFee,
    discountAmount: order.discountAmount,
    totalAmount: order.totalAmount,
    note: order.note,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
  };
}

function normalizeShippingAddress(payload) {
  const shippingAddress = {
    fullName: String(payload.fullName || "").trim(),
    phone: String(payload.phone || "").trim(),
    addressLine1: String(payload.addressLine1 || "").trim(),
    addressLine2: String(payload.addressLine2 || "").trim(),
    ward: String(payload.ward || "").trim(),
    district: String(payload.district || "").trim(),
    city: String(payload.city || "").trim(),
    country: String(payload.country || "Vietnam").trim(),
    postalCode: String(payload.postalCode || "").trim(),
  };

  if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.addressLine1 || !shippingAddress.city) {
    throw createHttpError(400, "Shipping address is incomplete");
  }

  return shippingAddress;
}

function applyCustomerTier(customer) {
  if (customer.totalSpend >= 20000000) {
    customer.status = "vip";
    return;
  }

  if (customer.status === "inactive" && customer.orderCount > 0) {
    customer.status = "active";
  }
}

async function resolveCustomer(customerPayload, shippingAddress, authenticatedCustomer = null) {
  const phone = String(customerPayload.phone || shippingAddress.phone || authenticatedCustomer?.phone || "").trim();
  const email = String(customerPayload.email || authenticatedCustomer?.email || "").trim().toLowerCase();
  const name = String(customerPayload.name || shippingAddress.fullName || authenticatedCustomer?.name || "").trim();

  if (!name || !phone) {
    throw createHttpError(400, "Customer name and phone are required");
  }

  let customer = authenticatedCustomer;

  if (!customer) {
    customer = await Customer.findOne({
      $or: [{ phone }, ...(email ? [{ email }] : [])],
    });
  }

  if (!customer) {
    customer = await Customer.create({
      name,
      email,
      phone,
      addresses: [
        {
          ...shippingAddress,
          isDefault: true,
        },
      ],
    });

    return customer;
  }

  customer.name = name;
  customer.email = email || customer.email;
  customer.phone = phone;

  const existingAddressIndex = customer.addresses.findIndex(
    (address) =>
      address.addressLine1 === shippingAddress.addressLine1 &&
      address.city === shippingAddress.city &&
      address.phone === shippingAddress.phone
  );

  if (existingAddressIndex === -1) {
    customer.addresses.unshift({
      ...shippingAddress,
      isDefault: customer.addresses.length === 0,
    });
  }

  await customer.save();
  return customer;
}

async function buildOrderItems(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw createHttpError(400, "Order items are required");
  }

  const orderItems = [];
  const quantityByProductId = new Map();

  for (const item of items) {
    const productId = String(item.productId || "").trim();
    const quantity = Number(item.quantity);

    if (!productId) {
      throw createHttpError(400, "Product id is required");
    }

    if (!quantity || quantity < 1) {
      throw createHttpError(400, "Item quantity must be at least 1");
    }
    quantityByProductId.set(productId, (quantityByProductId.get(productId) || 0) + quantity);
  }

  for (const [productId, quantity] of quantityByProductId.entries()) {
    const product = await Product.findById(productId);

    if (!product || product.status !== "active") {
      throw createHttpError(400, "One or more products are unavailable");
    }

    if (product.stock < quantity) {
      throw createHttpError(400, `Insufficient stock for ${product.name}`);
    }

    orderItems.push({
      product,
      quantity,
      lineTotal: product.price * quantity,
    });
  }

  return orderItems;
}

function resolveShippingMethod(shippingMethodId) {
  const normalizedId = String(shippingMethodId || "free").trim();
  const shippingMethod = SHIPPING_METHODS[normalizedId];

  if (!shippingMethod) {
    throw createHttpError(400, "Unsupported shipping method");
  }

  return shippingMethod;
}

function calculateOrderTotals(orderItems, shippingMethodId) {
  const shippingMethod = resolveShippingMethod(shippingMethodId);
  const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const shippingFee = shippingMethod.price;
  const taxAmount = Math.round(subtotal * TAX_RATE);
  const discountAmount = 0;
  const totalAmount = subtotal + shippingFee + taxAmount - discountAmount;

  return {
    shippingMethod,
    subtotal,
    shippingFee,
    taxAmount,
    discountAmount,
    totalAmount,
  };
}

export function generateVnpayTxnRef() {
  return `VNP${Date.now()}${Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0")}`;
}

function getVnpayExpiryCutoff(now = new Date()) {
  return new Date(now.getTime() - VNPAY_EXPIRY_GRACE_MS);
}

function isExpiredPendingVnpayOrder(order, now = new Date()) {
  const expiresAt = order.paymentMeta?.expiresAt ? new Date(order.paymentMeta.expiresAt) : null;

  if (!expiresAt) {
    return false;
  }

  return (
    order.paymentMethod === "vnpay" &&
    order.paymentStatus === "pending" &&
    order.orderStatus === "pending" &&
    expiresAt <= getVnpayExpiryCutoff(now)
  );
}

async function reserveOrderInventory(order, orderItems) {
  for (const item of orderItems) {
    if (item.product.stock < item.quantity) {
      throw createHttpError(409, `Insufficient stock for ${item.product.name}`);
    }

    const previousStock = item.product.stock;
    item.product.stock -= item.quantity;
    syncProductInventoryStatus(item.product);

    await item.product.save();
    await recordInventoryLog({
      product: item.product,
      delta: -item.quantity,
      previousStock,
      nextStock: item.product.stock,
      reason: "order_reserved",
      note: `Stock reserved for order ${order.orderCode}`,
      actorType: "system",
      referenceType: "order",
      referenceId: order._id,
      referenceCode: order.orderCode,
    });
  }
}

export async function releaseOrderInventory(order) {
  if (!order.inventoryReservedAt || order.inventoryReleasedAt) {
    return order;
  }

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
      reason: "order_released",
      note: `Stock returned from released order ${order.orderCode}`,
      actorType: "system",
      referenceType: "order",
      referenceId: order._id,
      referenceCode: order.orderCode,
    });
  }

  order.inventoryReleasedAt = new Date();
  await order.save();
  return order;
}

export async function expireOrderIfNeeded(order, now = new Date()) {
  if (!isExpiredPendingVnpayOrder(order, now)) {
    return order;
  }

  order.paymentMeta = {
    ...(order.paymentMeta?.toObject?.() || order.paymentMeta || {}),
    provider: "vnpay",
    responseCode: String(order.paymentMeta?.responseCode || "").trim() || "24",
    transactionStatus: "expired",
    lastUpdatedAt: now,
  };

  await markOrderFailed(order);
  await releaseOrderInventory(order);
  return order;
}

export async function expireStalePendingVnpayOrders({ limit = 50, now = new Date() } = {}) {
  const expiredOrders = await Order.find({
    paymentMethod: "vnpay",
    paymentStatus: "pending",
    orderStatus: "pending",
    "paymentMeta.expiresAt": {
      $ne: null,
      $lte: getVnpayExpiryCutoff(now),
    },
  })
    .sort({ "paymentMeta.expiresAt": 1 })
    .limit(limit);

  for (const order of expiredOrders) {
    await expireOrderIfNeeded(order, now);
  }

  return expiredOrders.length;
}

export async function commitCustomerOrderStats(order, customer) {
  if (order.customerStatsCommittedAt) {
    return order;
  }

  customer.orderCount += 1;
  customer.totalSpend += order.totalAmount;
  applyCustomerTier(customer);
  await customer.save();

  order.customerStatsCommittedAt = new Date();
  await order.save();
  return order;
}

export async function createCheckoutOrder({
  customerPayload = {},
  shippingAddress: shippingAddressPayload = {},
  paymentMethod,
  items,
  shippingMethodId,
  note = "",
  authenticatedCustomer = null,
  paymentMeta = null,
}) {
  if (!SUPPORTED_PAYMENT_METHODS.has(paymentMethod)) {
    throw createHttpError(400, "Unsupported payment method");
  }

  await expireStalePendingVnpayOrders();

  const shippingAddress = normalizeShippingAddress(shippingAddressPayload);
  const customer = await resolveCustomer(customerPayload, shippingAddress, authenticatedCustomer);
  const orderItems = await buildOrderItems(items);
  const totals = calculateOrderTotals(orderItems, shippingMethodId);

  const order = await Order.create({
    orderCode: generateOrderCode(),
    customerId: customer._id,
    customerName: customer.name,
    customerEmail: customer.email,
    customerPhone: customer.phone,
    items: orderItems.map(({ product, quantity, lineTotal }) => ({
      productId: product._id,
      name: product.name,
      sku: product.sku,
      image: product.images[0]?.url || "",
      quantity,
      unitPrice: product.price,
      lineTotal,
    })),
    shippingAddress,
    shippingMethodId: totals.shippingMethod.id,
    shippingMethodLabel: totals.shippingMethod.label,
    paymentMethod,
    paymentMeta,
    subtotal: totals.subtotal,
    taxAmount: totals.taxAmount,
    shippingFee: totals.shippingFee,
    discountAmount: totals.discountAmount,
    totalAmount: totals.totalAmount,
    note: String(note || "").trim(),
  });

  try {
    await reserveOrderInventory(order, orderItems);
    order.inventoryReservedAt = new Date();
    await order.save();
  } catch (error) {
    await Order.deleteOne({ _id: order._id });
    throw error;
  }

  return {
    order,
    customer,
    orderItems,
    totals,
  };
}

export async function markOrderPaid(order) {
  if (order.paymentStatus === "paid") {
    return order;
  }

  order.paymentStatus = "paid";
  order.paymentConfirmedAt = order.paymentConfirmedAt || new Date();

  if (order.orderStatus === "pending") {
    order.orderStatus = "confirmed";
  }

  await order.save();
  return order;
}

export async function markOrderFailed(order) {
  if (order.paymentStatus === "failed") {
    return order;
  }

  order.paymentStatus = "failed";

  if (order.orderStatus === "pending") {
    order.orderStatus = "cancelled";
  }

  await order.save();
  return order;
}

export async function finalizeCodOrder(order, customer) {
  await commitCustomerOrderStats(order, customer);
  return order;
}

export function findOrderByTxnRef(txnRef) {
  return Order.findOne({ "paymentMeta.txnRef": txnRef });
}
