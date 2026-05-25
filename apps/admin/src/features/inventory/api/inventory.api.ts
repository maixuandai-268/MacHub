import { http } from "@/services/http";

export type InventoryLog = {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  delta: number;
  previousStock: number;
  nextStock: number;
  reason: string;
  note: string;
  actorType: string;
  referenceType: string;
  referenceId: string | null;
  referenceCode: string;
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

export async function getAdminInventoryLogs(params?: Record<string, string | number>) {
  const response = await http.get<ApiResponse<InventoryLog[]>>("/admin/inventory", { params });
  return response.data;
}
