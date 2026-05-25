import { http, clearAdminAccessToken, setAdminAccessToken } from "@/services/http";

export type AdminProfile = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function loginAdmin(input: { email: string; password: string }) {
  const response = await http.post<
    ApiResponse<{ admin: AdminProfile; accessToken: string }>
  >("/auth/admin/login", input);

  setAdminAccessToken(response.data.data.accessToken);
  return response.data.data;
}

export async function getCurrentAdmin() {
  const response = await http.get<ApiResponse<AdminProfile>>("/auth/admin/me");
  return response.data.data;
}

export async function logoutAdmin() {
  try {
    await http.post("/auth/admin/logout");
  } finally {
    clearAdminAccessToken();
  }
}
