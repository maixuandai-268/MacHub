import { http } from "@/services/http";

export type AdminOrder = {
  id: string;
  orderCode: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  items: Array<{
    productId: string;
    name: string;
    image: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  totalAmount: number;
  createdAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export async function getAdminOrders(params?: Record<string, string | number>) {
  const response = await http.get<ApiResponse<AdminOrder[]>>("/admin/orders", { params });
  return response.data;
}

export async function updateAdminOrderStatus(
  orderId: string,
  payload: { orderStatus?: string; paymentStatus?: string }
) {
  const response = await http.patch<ApiResponse<AdminOrder>>(
    `/admin/orders/${orderId}/status`,
    payload
  );

  return response.data.data;
}
