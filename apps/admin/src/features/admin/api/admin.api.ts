import { http } from "@/services/http";
import type {
  AdminPasswordPayload,
  AdminProfile,
  AdminProfilePayload,
} from "../types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function getAdminProfile() {
  const response = await http.get<ApiResponse<AdminProfile>>("/admin/profile");
  return response.data.data;
}

export async function updateAdminProfile(payload: AdminProfilePayload) {
  const response = await http.patch<ApiResponse<AdminProfile>>("/admin/profile", payload);
  return response.data.data;
}

export async function changeAdminPassword(payload: AdminPasswordPayload) {
  const response = await http.patch<ApiResponse<AdminProfile>>(
    "/admin/profile/password",
    payload
  );
  return response.data.data;
}
