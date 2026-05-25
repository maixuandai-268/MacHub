import { getAdminOrders, type AdminOrder } from "@/features/orders/api/orders.api";

export type AdminTransaction = AdminOrder;

export async function getAdminTransactions(params?: Record<string, string | number>) {
  return getAdminOrders(params);
}
