import { http } from "@/services/http";
import type { CartItem, CheckoutAddress, PaymentMethod, ShippingMethod } from "@/features/cart/cart.types";

type CreateOrderPayload = {
  items: CartItem[];
  address: CheckoutAddress;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type CheckoutOrder = {
  id: string;
  orderCode: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
};

type VnpayCreateResponse = {
  order: CheckoutOrder;
  paymentUrl: string;
  txnRef: string;
  expiresAt: string;
};

type VnpayStatusResponse = {
  isFinal: boolean;
  order: CheckoutOrder & {
    paymentMeta: {
      txnRef: string;
      responseCode: string;
      transactionStatus: string;
    } | null;
  };
};

function buildCheckoutBody(payload: CreateOrderPayload) {
  return {
    customer: {
      name: payload.address.fullName,
      email: payload.address.email,
      phone: payload.address.phone,
    },
    shippingAddress: {
      fullName: payload.address.fullName,
      phone: payload.address.phone,
      addressLine1: payload.address.addressLine1,
      addressLine2: payload.address.addressLine2,
      ward: payload.address.ward,
      district: payload.address.district,
      city: payload.address.city,
      country: payload.address.country,
      postalCode: payload.address.postalCode,
    },
    shippingMethodId: payload.shippingMethod.id,
    items: payload.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    })),
    note: `Shipping method: ${payload.shippingMethod.label}`,
  };
}

export async function createCodOrder(payload: CreateOrderPayload) {
  const response = await http.post<ApiResponse<CheckoutOrder>>("/orders", {
    ...buildCheckoutBody(payload),
    paymentMethod: "cod",
  });

  return response.data.data;
}

export async function createVnpayPayment(payload: CreateOrderPayload) {
  const response = await http.post<ApiResponse<VnpayCreateResponse>>("/payments/vnpay/create", {
    ...buildCheckoutBody(payload),
    paymentMethod: "vnpay",
  });

  return response.data.data;
}

export async function getVnpayPaymentStatus(txnRef: string) {
  const response = await http.get<ApiResponse<VnpayStatusResponse>>(`/payments/vnpay/status/${encodeURIComponent(txnRef)}`);
  return response.data.data;
}
