import { http } from "@/services/http";
import { getFallbackProductDetail } from "@/features/catalog/catalog.fallback";
import type { ProductDetail } from "./product.types";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export async function getProductDetail(slug: string) {
  try {
    const response = await http.get<ApiResponse<ProductDetail>>(`/products/${slug}`);
    return response.data.data;
  } catch {
    const fallback = getFallbackProductDetail(slug);

    if (!fallback) {
      throw new Error("Product not found");
    }

    return fallback;
  }
}
