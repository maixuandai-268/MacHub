import { http } from "@/services/http";

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  phone: string;
  isRegistered: boolean;
  status: "active" | "inactive" | "vip";
  totalSpend: number;
  orderCount: number;
  lastLoginAt: string | null;
  addresses: Array<{
    fullName: string;
    phone: string;
    addressLine1: string;
    city: string;
    country: string;
    isDefault: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
};

export type AdminCustomerOrder = {
  id: string;
  orderCode: string;
  orderStatus: string;
  paymentStatus: string;
  totalAmount: number;
  createdAt: string;
};

export type AdminCustomerDetail = AdminCustomer & {
  recentOrders: AdminCustomerOrder[];
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

export async function getAdminCustomers(params?: Record<string, string | number>) {
  const response = await http.get<ApiResponse<AdminCustomer[]>>("/admin/customers", {
    params,
  });

  return response.data;
}

export async function getAdminCustomerDetail(id: string) {
  const response = await http.get<ApiResponse<AdminCustomerDetail>>(`/admin/customers/${id}`);
  return response.data;
}
