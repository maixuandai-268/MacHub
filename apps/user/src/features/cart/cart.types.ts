export type CartItem = {
  productId: string;
  slug: string;
  sku: string;
  name: string;
  image: string;
  price: number;
  compareAtPrice: number | null;
  quantity: number;
  categoryName: string;
};

export type WishlistItem = {
  productId: string;
  slug: string;
  sku: string;
  name: string;
  image: string;
  price: number;
  categoryName: string;
};

export type CheckoutAddress = {
  id: string;
  label: string;
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  ward: string;
  district: string;
  city: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
};

export type ShippingMethodId = "free" | "express" | "schedule";

export type ShippingMethod = {
  id: ShippingMethodId;
  label: string;
  description: string;
  price: number;
  etaLabel: string;
};

export type PaymentMethod = "vnpay" | "cod";

export type CheckoutState = {
  addresses: CheckoutAddress[];
  selectedAddressId: string;
  shippingMethodId: ShippingMethodId;
  paymentMethod: PaymentMethod;
  sameAsBilling: boolean;
};
