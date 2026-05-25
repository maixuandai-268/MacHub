import { memo } from "react";
import type { CatalogProduct } from "@/features/catalog/catalog.types";
import { CatalogProductCard } from "@/components/cards/ProductCard";

type Props = {
  products: CatalogProduct[];
  isAuthenticated: boolean;
  wishlistedKeys: Set<string>;
  onWishlistToggle: (product: CatalogProduct) => void;
};

function ProductGrid({ products, isAuthenticated, wishlistedKeys, onWishlistToggle }: Props) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product) => (
        <CatalogProductCard
          key={product.id}
          product={product}
          isAuthenticated={isAuthenticated}
          isWishlisted={wishlistedKeys.has(product.id) || wishlistedKeys.has(product.slug)}
          onWishlistToggle={onWishlistToggle}
        />
      ))}
    </div>
  );
}

export default memo(ProductGrid);
