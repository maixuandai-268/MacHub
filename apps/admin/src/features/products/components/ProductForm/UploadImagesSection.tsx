import { http } from "@/services/http";

export type AdminProduct = {
  images: Array<{
    url: string;
    alt: string;
    sortOrder: number;
  }>;
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  featured: boolean;
  batteryCapacity: string;
  screenType: string;
  screenDiagonal: string;
  protectionClass: string;
  builtInMemory: string;
  status: string;
  displayStatus: string;
  image: string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  createdAt: string;
  updatedAt: string;
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

export async function getAdminProducts(params?: Record<string, string | number | boolean>) {
  const response = await http.get<ApiResponse<AdminProduct[]>>("/admin/products", {
    params,
  });

  return response.data;
}

export async function createAdminProduct(payload: Record<string, unknown>) {
  const response = await http.post<ApiResponse<AdminProduct>>("/admin/products", payload);
  return response.data.data;
}

export async function updateAdminProduct(productId: string, payload: Record<string, unknown>) {
  const response = await http.patch<ApiResponse<AdminProduct>>(
    `/admin/products/${productId}`,
    payload
  );
  return response.data.data;
}

export async function adjustAdminProductInventory(
  productId: string,
  payload: {
    type: "increase" | "decrease" | "set";
    quantity: number;
    reason: string;
    note?: string;
  }
) {
  const response = await http.patch<ApiResponse<AdminProduct>>(
    `/admin/products/${productId}/inventory`,
    payload
  );
  return response.data.data;
}

export async function deleteAdminProduct(productId: string) {
  const response = await http.delete<ApiResponse<AdminProduct>>(
    `/admin/products/${productId}`
  );
  return response.data.data;
}
