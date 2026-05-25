import { asyncHandler } from "../../utils/asyncHandler.js";
import { createHttpError } from "../../utils/createHttpError.js";
import { Order } from "../orders/order.model.js";
import { expireStalePendingVnpayOrders } from "../orders/order.service.js";

function sanitizeCustomerProfile(customer) {
  return {
    id: customer.id,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    status: customer.status,
    totalSpend: customer.totalSpend,
    orderCount: customer.orderCount,
    addresses: customer.addresses.map((address, index) => ({
      id: address.id || `${customer.id}-address-${index + 1}`,
      label: address.label || (address.isDefault ? "HOME" : "OFFICE"),
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      ward: address.ward,
      district: address.district,
      city: address.city,
      country: address.country,
      postalCode: address.postalCode,
      isDefault: address.isDefault,
    })),
    isRegistered: customer.isRegistered,
    lastLoginAt: customer.lastLoginAt,
    createdAt: customer.createdAt,
    updatedAt: customer.updatedAt,
  };
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeAddressPayload(payload, fallbackEmail) {
  const fullName = String(payload.fullName || "").trim();
  const phone = String(payload.phone || "").trim();
  const addressLine1 = String(payload.addressLine1 || "").trim();
  const city = String(payload.city || "").trim();

  if (!fullName || !phone || !addressLine1 || !city) {
    throw createHttpError(400, "Address full name, phone, address line 1, and city are required");
  }

  return {
    id: String(payload.id || "").trim() || undefined,
    label: String(payload.label || "HOME").trim().toUpperCase(),
    fullName,
    phone,
    email: String(payload.email || fallbackEmail || "").trim().toLowerCase(),
    addressLine1,
    addressLine2: String(payload.addressLine2 || "").trim(),
    ward: String(payload.ward || "").trim(),
    district: String(payload.district || "").trim(),
    city,
    country: String(payload.country || "Vietnam").trim(),
    postalCode: String(payload.postalCode || "").trim(),
    isDefault: Boolean(payload.isDefault),
  };
}

export const getMyProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Customer profile fetched successfully",
    data: sanitizeCustomerProfile(req.customer),
  });
});

export const updateMyProfile = asyncHandler(async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const phone = String(req.body.phone || "").trim();

  if (!name || !email || !phone) {
    throw createHttpError(400, "Name, email, and phone are required");
  }

  if (!validateEmail(email)) {
    throw createHttpError(400, "Email is not valid");
  }

  const duplicate = await req.customer.constructor.findOne({
    _id: { $ne: req.customer._id },
    $or: [{ email }, { phone }],
  });

  if (duplicate) {
    throw createHttpError(409, "Email or phone is already in use");
  }

  req.customer.name = name;
  req.customer.email = email;
  req.customer.phone = phone;
  await req.customer.save();

  res.json({
    success: true,
    message: "Customer profile updated successfully",
    data: sanitizeCustomerProfile(req.customer),
  });
});

export const createMyAddress = asyncHandler(async (req, res) => {
  const address = normalizeAddressPayload(req.body, req.customer.email);
  const nextAddress = {
    id: address.id,
    label: address.label,
    fullName: address.fullName,
    phone: address.phone,
    addressLine1: address.addressLine1,
    addressLine2: address.addressLine2,
    ward: address.ward,
    district: address.district,
    city: address.city,
    country: address.country,
    postalCode: address.postalCode,
    isDefault: req.customer.addresses.length === 0 ? true : address.isDefault,
  };

  if (nextAddress.isDefault) {
    req.customer.addresses = req.customer.addresses.map((item) => ({ ...item.toObject(), isDefault: false }));
  }

  req.customer.addresses.push(nextAddress);
  await req.customer.save();

  res.status(201).json({
    success: true,
    message: "Address created successfully",
    data: {
      customer: sanitizeCustomerProfile(req.customer),
      addressId: nextAddress.id,
    },
  });
});

export const updateMyAddress = asyncHandler(async (req, res) => {
  const addressId = String(req.params.addressId || "").trim();
  const nextAddress = normalizeAddressPayload(req.body, req.customer.email);
  const addressIndex = req.customer.addresses.findIndex((item) => item.id === addressId);

  if (addressIndex === -1) {
    throw createHttpError(404, "Address not found");
  }

  if (nextAddress.isDefault) {
    req.customer.addresses = req.customer.addresses.map((item) => ({ ...item.toObject(), isDefault: false }));
  }

  req.customer.addresses[addressIndex] = {
    id: addressId,
    label: nextAddress.label,
    fullName: nextAddress.fullName,
    phone: nextAddress.phone,
    addressLine1: nextAddress.addressLine1,
    addressLine2: nextAddress.addressLine2,
    ward: nextAddress.ward,
    district: nextAddress.district,
    city: nextAddress.city,
    country: nextAddress.country,
    postalCode: nextAddress.postalCode,
    isDefault: nextAddress.isDefault,
  };

  await req.customer.save();

  res.json({
    success: true,
    message: "Address updated successfully",
    data: {
      customer: sanitizeCustomerProfile(req.customer),
      addressId,
    },
  });
});

export const deleteMyAddress = asyncHandler(async (req, res) => {
  const addressId = String(req.params.addressId || "").trim();
  const addressIndex = req.customer.addresses.findIndex((item) => item.id === addressId);

  if (addressIndex === -1) {
    throw createHttpError(404, "Address not found");
  }

  const [removedAddress] = req.customer.addresses.splice(addressIndex, 1);

  if (removedAddress?.isDefault && req.customer.addresses[0]) {
    req.customer.addresses[0].isDefault = true;
  }

  await req.customer.save();

  res.json({
    success: true,
    message: "Address deleted successfully",
    data: sanitizeCustomerProfile(req.customer),
  });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  await expireStalePendingVnpayOrders();

  const orders = await Order.find({ customerId: req.customer._id })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({
    success: true,
    message: "Customer orders fetched successfully",
    data: orders.map((order) => ({
      id: order.id,
      orderCode: order.orderCode,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      totalAmount: order.totalAmount,
      items: order.items,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    })),
  });
});
