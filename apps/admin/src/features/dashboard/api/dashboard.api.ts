import { http } from "@/services/http";
import type { DashboardSummary } from "../types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function getDashboardSummary() {
  const response = await http.get<ApiResponse<DashboardSummary>>("/admin/dashboard/summary");
  return response.data.data;
}
