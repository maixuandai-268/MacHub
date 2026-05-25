import { Link } from "react-router-dom";
import { buildCatalogCategoryPath, getCategoryQueryValue } from "@/features/catalog/category-links";
import type { CatalogCategory } from "@/features/catalog/catalog.types";
import { resolveAssetUrl } from "@/utils/assets";

export function CategoryCard({ category }: { category: CatalogCategory }) {
  return (
    <Link
      to={buildCatalogCategoryPath(getCategoryQueryValue(category))}
      className="group flex items-center gap-4 rounded-[24px] border border-white/8 bg-white/[0.03] p-4 shadow-[0_18px_48px_rgba(0,0,0,0.22)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/14 hover:bg-white/[0.05]"
    >
      <img
        src={resolveAssetUrl(category.image || "/assets/images/iphone-17.png")}
        alt={category.name}
        className="h-16 w-16 rounded-2xl border border-white/8 bg-white/[0.03] object-cover"
      />
      <div>
        <h3 className="font-semibold text-white">{category.name}</h3>
        <p className="mt-1 text-sm text-white/56">{category.description || "Browse this collection"}</p>
      </div>
    </Link>
  );
}


