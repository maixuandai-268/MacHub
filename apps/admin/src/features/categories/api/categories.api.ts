import { http } from "@/services/http";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
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

export async function getAdminCategories(params?: Record<string, string | number | boolean>) {
  const response = await http.get<ApiResponse<AdminCategory[]>>("/admin/categories", {
    params,
  });

  return response.data;
}

export async function createAdminCategory(payload: Record<string, unknown>) {
  const response = await http.post<ApiResponse<AdminCategory>>("/admin/categories", payload);
  return response.data.data;
}

export async function updateAdminCategory(categoryId: string, payload: Record<string, unknown>) {
  const response = await http.patch<ApiResponse<AdminCategory>>(
    `/admin/categories/${categoryId}`,
    payload
  );
  return response.data.data;
}

export async function deleteAdminCategory(categoryId: string) {
  const response = await http.delete<ApiResponse<AdminCategory>>(
    `/admin/categories/${categoryId}`
  );
  return response.data.data;
}
