import { http } from "@/services/http";
import type { CatalogCategory, CatalogProduct, CatalogProductFilters } from "./catalog.types";
import {
  getFallbackCategories,
  getFallbackProductFilters,
  getFallbackProducts,
} from "./catalog.fallback";

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

const CATALOG_REQUEST_TIMEOUT_MS = 5000;
const CATEGORY_CACHE_TTL_MS = 10 * 60 * 1000;
const FILTER_CACHE_TTL_MS = 2 * 60 * 1000;
const PRODUCT_CACHE_TTL_MS = 30 * 1000;

type CacheEntry<T> = {
  expiresAt: number;
  value: ApiResponse<T>;
};

const responseCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

function buildCacheKey(
  resource: string,
  params?: Record<string, string | number | boolean | Array<string | number | boolean>>
) {
  if (!params) {
    return resource;
  }

  const searchParams = new URLSearchParams();

  Object.keys(params)
    .sort((left, right) => left.localeCompare(right))
    .forEach((key) => {
      const value = params[key];

      if (value === undefined || value === null || value === "") {
        return;
      }

      if (Array.isArray(value)) {
        value
          .map(String)
          .sort((left, right) => left.localeCompare(right))
          .forEach((item) => searchParams.append(key, item));
        return;
      }

      searchParams.append(key, String(value));
    });

  const serialized = searchParams.toString();
  return serialized ? `${resource}?${serialized}` : resource;
}

function getCachedResponse<T>(key: string) {
  const cached = responseCache.get(key) as CacheEntry<T> | undefined;

  if (!cached) {
    return null;
  }

  if (cached.expiresAt <= Date.now()) {
    responseCache.delete(key);
    return null;
  }

  return cached.value;
}

function setCachedResponse<T>(key: string, value: ApiResponse<T>, ttlMs: number) {
  responseCache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

async function fetchCatalogResource<T>(options: {
  resource: string;
  params?: Record<string, string | number | boolean | Array<string | number | boolean>>;
  ttlMs: number;
  request: () => Promise<ApiResponse<T>>;
  fallback: () => ApiResponse<T>;
}) {
  const cacheKey = buildCacheKey(options.resource, options.params);
  const cached = getCachedResponse<T>(cacheKey);

  if (cached) {
    return cached;
  }

  const pending = inFlightRequests.get(cacheKey) as Promise<ApiResponse<T>> | undefined;

  if (pending) {
    return pending;
  }

  const request = options.request()
    .then((response) => {
      setCachedResponse(cacheKey, response, options.ttlMs);
      return response;
    })
    .catch(() => options.fallback())
    .finally(() => {
      inFlightRequests.delete(cacheKey);
    });

  inFlightRequests.set(cacheKey, request);
  return request;
}

export async function getCatalogCategories(params?: Record<string, string | number | boolean>) {
  return fetchCatalogResource({
    resource: "/categories",
    params,
    ttlMs: CATEGORY_CACHE_TTL_MS,
    request: async () => {
      const response = await http.get<ApiResponse<CatalogCategory[]>>("/categories", {
        params,
        timeout: CATALOG_REQUEST_TIMEOUT_MS,
      });

      return response.data;
    },
    fallback: () => ({
      success: true,
      message: "Fallback categories loaded locally",
      data: getFallbackCategories(Number(params?.limit || 0) || undefined),
    }),
  });
}

export async function getCatalogProducts(
  params?: Record<string, string | number | boolean | Array<string | number | boolean>>
) {
  return fetchCatalogResource({
    resource: "/products",
    params,
    ttlMs: PRODUCT_CACHE_TTL_MS,
    request: async () => {
      const response = await http.get<ApiResponse<CatalogProduct[]>>("/products", {
        params,
        timeout: CATALOG_REQUEST_TIMEOUT_MS,
      });

      return response.data;
    },
    fallback: () => ({
      success: true,
      message: "Fallback products loaded locally",
      data: getFallbackProducts(params),
    }),
  });
}

export async function getCatalogProductFilters(
  params?: Record<string, string | number | boolean | Array<string | number | boolean>>
) {
  return fetchCatalogResource({
    resource: "/products/filters",
    params,
    ttlMs: FILTER_CACHE_TTL_MS,
    request: async () => {
      const response = await http.get<ApiResponse<CatalogProductFilters>>("/products/filters", {
        params,
        timeout: CATALOG_REQUEST_TIMEOUT_MS,
      });

      return response.data;
    },
    fallback: () => ({
      success: true,
      message: "Fallback product filters loaded locally",
      data: getFallbackProductFilters(params),
    }),
  });
}
