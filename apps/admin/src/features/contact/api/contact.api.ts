import { http } from "@/services/http";

export type AdminContactInquiryStatus = "new" | "reviewed" | "closed";

export type AdminContactInquiry = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: AdminContactInquiryStatus;
  source: string;
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

export async function getAdminContactInquiries(params?: Record<string, string | number>) {
  const response = await http.get<ApiResponse<AdminContactInquiry[]>>(
    "/admin/contact-inquiries",
    { params }
  );
  return response.data;
}

export async function updateAdminContactInquiryStatus(
  id: string,
  status: AdminContactInquiryStatus
) {
  const response = await http.patch<ApiResponse<AdminContactInquiry>>(
    `/admin/contact-inquiries/${id}`,
    { status }
  );
  return response.data;
}
