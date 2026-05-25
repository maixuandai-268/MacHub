import { http } from "@/services/http";
import type {
  AuthPayload,
  CustomerAddressPayload,
  CustomerOrder,
  CustomerProfilePayload,
  CustomerSession,
} from "./auth.types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

export async function registerCustomer(payload: RegisterPayload) {
  const response = await http.post<ApiResponse<AuthPayload>>("/auth/customer/register", payload);
  return response.data.data;
}

export async function loginCustomer(payload: LoginPayload) {
  const response = await http.post<ApiResponse<AuthPayload>>("/auth/customer/login", payload);
  return response.data.data;
}

export async function refreshCustomerAccessToken() {
  const response = await http.post<ApiResponse<Pick<AuthPayload, "customer" | "accessToken">>>("/auth/customer/refresh", {});
  return response.data.data;
}

export async function logoutCustomer() {
  await http.post("/auth/customer/logout", {});
}

export async function getCurrentCustomer() {
  const response = await http.get<ApiResponse<CustomerSession>>("/auth/customer/me");
  return response.data.data;
}

export async function getMyProfile() {
  const response = await http.get<ApiResponse<CustomerSession>>("/me/profile");
  return response.data.data;
}

export async function getMyOrders() {
  const response = await http.get<ApiResponse<CustomerOrder[]>>("/me/orders");
  return response.data.data;
}

export async function updateMyProfile(payload: CustomerProfilePayload) {
  const response = await http.patch<ApiResponse<CustomerSession>>("/me/profile", payload);
  return response.data.data;
}

export async function saveMyAddress(payload: CustomerAddressPayload) {
  if (payload.id) {
    const response = await http.patch<
      ApiResponse<{ customer: CustomerSession; addressId: string }>
    >(`/me/addresses/${payload.id}`, payload);
    return response.data.data;
  }

  const response = await http.post<
    ApiResponse<{ customer: CustomerSession; addressId: string }>
  >("/me/addresses", payload);
  return response.data.data;
}

export async function deleteMyAddress(addressId: string) {
  const response = await http.delete<ApiResponse<CustomerSession>>(`/me/addresses/${addressId}`);
  return response.data.data;
}
