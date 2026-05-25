import type { CatalogCategory } from "./catalog.types";

type CatalogFamilyEntry = {
  slug: string;
  label: string;
  navLabel?: string;
};

export const catalogFamilyEntries: CatalogFamilyEntry[] = [
  { slug: "mac", label: "Mac" },
  { slug: "iphone", label: "iPhone" },
  { slug: "ipad", label: "iPad" },
  { slug: "apple-watch", label: "Apple Watch", navLabel: "Watch" },
  { slug: "apple-vision-pro", label: "Apple Vision Pro", navLabel: "Vision" },
  { slug: "airpods", label: "AirPods" },
];

const categoryDisplayNames = Object.fromEntries(
  catalogFamilyEntries.map((entry) => [entry.slug, entry.label])
) as Record<string, string>;

export function getCategoryQueryValue(
  category?: Pick<CatalogCategory, "id" | "slug"> | null
) {
  if (!category) {
    return "";
  }

  return category.slug || category.id;
}

export function buildCatalogPath(options?: { category?: string; search?: string }) {
  const params = new URLSearchParams();

  if (options?.category) {
    params.set("category", options.category);
  }

  if (options?.search?.trim()) {
    params.set("search", options.search.trim());
  }

  const query = params.toString();
  return `/products${query ? `?${query}` : ""}`;
}

export function buildCatalogCategoryPath(category: string, search?: string) {
  return buildCatalogPath({ category, search });
}

export function formatCategoryToken(token: string) {
  const normalized = token.trim().toLowerCase();

  if (categoryDisplayNames[normalized]) {
    return categoryDisplayNames[normalized];
  }

  return normalized
    .split("-")
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export function getUserCategoryName(
  category?: Pick<CatalogCategory, "name"> | null
) {
  if (!category) {
    return "Catalog";
  }

  return category.name;
}
