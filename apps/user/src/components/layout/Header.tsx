import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Search, ShoppingBag, User } from "lucide-react";
import { useAuth } from "@/features/auth/auth.context";
import {
  buildCatalogPath,
  catalogFamilyEntries,
} from "@/features/catalog/category-links";
import { useCart } from "@/features/cart/cart.context";

const primaryNavigation = [
  { label: "Store", to: "/home" },
  ...catalogFamilyEntries.map((entry) => ({
    label: entry.navLabel || entry.label,
    to: buildCatalogPath({ category: entry.slug }),
  })),
  { label: "Journal", to: "/blog" },
  { label: "About", to: "/about" },
  { label: "Support", to: "/contact" },
];

export default function Header() {
  const { itemCount, wishlistCount } = useCart();
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [routeSearchParams] = useSearchParams();
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    if (location.pathname === "/products") {
      setKeyword(routeSearchParams.get("search") || "");
    } else {
      setKeyword("");
    }
  }, [location.pathname, routeSearchParams]);

  function isNavActive(path: string) {
    if (path === "/home") {
      return location.pathname === "/home";
    }

    const [pathname, queryString = ""] = path.split("?");

    if (location.pathname !== pathname) {
      return false;
    }

    const targetParams = new URLSearchParams(queryString);
    const targetCategory = targetParams.get("category");

    if (targetCategory) {
      return routeSearchParams.get("category") === targetCategory;
    }

    return true;
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const activeCategory =
      location.pathname === "/products" ? routeSearchParams.get("category") || "" : "";
    navigate(buildCatalogPath({ category: activeCategory, search: keyword }));
  }

  return (
    <header className="sticky top-0 z-50 border-b border-black/6 bg-[rgba(251,251,253,0.82)] shadow-[0_10px_34px_rgba(15,23,42,0.05)] backdrop-blur-2xl">
      <div className="cy-shell">
        <div className="flex min-h-[64px] items-center gap-4">
          <Link
            to="/home"
            className="shrink-0 text-[1rem] font-semibold tracking-[-0.06em] text-(--text-primary)"
          >
            CyberShop
          </Link>

          <nav className="hidden min-w-0 flex-1 items-center justify-center gap-7 xl:flex">
            {primaryNavigation.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={[
                  "text-[0.78rem] font-medium tracking-[0.01em] transition",
                  isNavActive(item.to)
                    ? "text-(--text-primary)"
                    : "text-(--text-secondary) hover:text-(--text-primary)",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-3 lg:flex">
            <form
              onSubmit={handleSearchSubmit}
              className="flex h-10 w-[240px] items-center gap-2 rounded-full border border-black/7 bg-white/80 px-3 text-(--text-tertiary) shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:border-black/10"
            >
              <Search className="h-4 w-4" />
              <input
                type="text"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search products"
                className="w-full border-0 bg-transparent text-sm text-(--text-primary) outline-none placeholder:text-(--text-tertiary)"
              />
            </form>

            <Link
              to={isAuthenticated ? "/wishlist" : "/sign-in?redirect=%2Fwishlist"}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/7 bg-white/80 text-(--text-secondary) shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:bg-white"
            >
              <Heart
                className={[
                  "h-[18px] w-[18px]",
                  wishlistCount > 0 ? "fill-rose-500 text-rose-500" : "",
                ].join(" ")}
              />
              {wishlistCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">
                  {wishlistCount}
                </span>
              ) : null}
            </Link>

            <Link
              to={isAuthenticated ? "/cart" : "/sign-in?redirect=%2Fcart"}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/7 bg-white/80 text-(--text-secondary) shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:bg-white"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {itemCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-(--accent) px-1 text-[10px] font-semibold text-white">
                  {itemCount}
                </span>
              ) : null}
            </Link>

            <Link
              to={isAuthenticated ? "/profile" : "/sign-in"}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/7 bg-white/80 text-(--text-secondary) shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition hover:bg-white"
            >
              <User className="h-[18px] w-[18px]" />
            </Link>
          </div>

          <div className="ml-auto flex items-center gap-2 lg:hidden">
            <Link
              to="/products"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/7 bg-white/80 text-(--text-secondary) shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
            >
              <Search className="h-[18px] w-[18px]" />
            </Link>
            <Link
              to={isAuthenticated ? "/cart" : "/sign-in?redirect=%2Fcart"}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/7 bg-white/80 text-(--text-secondary) shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {itemCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-(--accent) px-1 text-[10px] font-semibold text-white">
                  {itemCount}
                </span>
              ) : null}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 overflow-x-auto border-t border-black/6 py-3 xl:hidden">
          {primaryNavigation.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className={[
                "shrink-0 text-[0.78rem] font-medium tracking-[0.01em] transition",
                isNavActive(item.to)
                  ? "text-(--text-primary)"
                  : "text-(--text-secondary)",
              ].join(" ")}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
