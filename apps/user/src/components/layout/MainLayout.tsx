import { CheckCircle2, Heart, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useCart } from "@/features/cart/cart.context";
import Header from "./Header";
import Footer from "./Footer";

export default function MainLayout() {
  const location = useLocation();
  const { notification, clearNotification } = useCart();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const previousPathname = useRef(location.pathname);

  useEffect(() => {
    if (previousPathname.current === location.pathname) {
      return;
    }

    previousPathname.current = location.pathname;
    setIsTransitioning(true);

    const timeout = window.setTimeout(() => {
      setIsTransitioning(false);
    }, 420);

    return () => window.clearTimeout(timeout);
  }, [location.pathname]);

  useEffect(() => {
    if (!notification) {
      return;
    }

    const timeout = window.setTimeout(() => {
      clearNotification();
    }, 2200);

    return () => window.clearTimeout(timeout);
  }, [clearNotification, notification]);

  return (
    <div className="min-h-screen bg-(--bg-base) text-(--text-primary)">
      <div
        className={[
          "fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-[linear-gradient(90deg,rgba(0,113,227,0.18),rgba(0,113,227,0.82),rgba(0,113,227,0.12))] shadow-[0_8px_22px_rgba(0,113,227,0.22)] transition-transform duration-500",
          isTransitioning ? "scale-x-100" : "scale-x-0",
        ].join(" ")}
      />
      <div
        className={[
          "pointer-events-none fixed inset-0 z-[60] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),transparent_24%),radial-gradient(circle_at_82%_10%,rgba(0,113,227,0.08),transparent_26%)] transition duration-300",
          isTransitioning ? "opacity-100" : "opacity-0",
        ].join(" ")}
      />
      <div className="pointer-events-none fixed inset-x-0 top-0 z-0 h-[520px] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.88),transparent_62%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),transparent_18%,transparent_100%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_20%_18%,rgba(255,255,255,0.22),transparent_18%),radial-gradient(circle_at_76%_72%,rgba(0,113,227,0.06),transparent_24%)]" />
      <div
        className={[
          "pointer-events-none fixed right-5 top-24 z-[80] w-[min(380px,calc(100vw-2.5rem))] rounded-[28px] p-4 shadow-[0_24px_70px_rgba(15,23,42,0.12)] backdrop-blur-xl transition duration-300",
          notification?.type === "wishlist"
            ? "border border-rose-200/70 bg-[rgba(255,247,248,0.92)]"
            : notification?.type === "order"
              ? "border border-sky-200/70 bg-[rgba(246,250,255,0.94)]"
              : notification?.type === "stock"
                ? "border border-amber-200/70 bg-[rgba(255,251,242,0.94)]"
            : "border border-emerald-200/70 bg-[rgba(244,252,247,0.94)]",
          notification ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0",
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          <div
            className={[
              "mt-0.5 rounded-full p-2",
              notification?.type === "wishlist"
                ? "bg-rose-100 text-rose-600"
                : notification?.type === "order"
                  ? "bg-sky-100 text-sky-700"
                  : notification?.type === "stock"
                    ? "bg-amber-100 text-amber-600"
                : "bg-emerald-100 text-emerald-600",
            ].join(" ")}
          >
              {notification?.type === "wishlist" ? (
                <Heart className="h-5 w-5" fill="currentColor" />
              ) : notification?.type === "order" ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : notification?.type === "stock" ? (
                <ShoppingBag className="h-5 w-5" />
              ) : (
                <CheckCircle2 className="h-5 w-5" />
              )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-(--text-primary)">
              {notification?.type === "wishlist"
                ? notification.action === "added"
                  ? "Saved to wishlist"
                  : "Removed from wishlist"
                : notification?.type === "order"
                  ? "Order placed successfully"
                  : notification?.type === "stock"
                    ? "Inventory limit reached"
                : "Added to cart"}
            </p>
            <p className="mt-1 text-sm leading-5 text-(--text-secondary)">
              {notification
                ? notification.type === "wishlist"
                  ? notification.name
                  : notification.type === "order"
                    ? `${notification.name} is confirmed. Redirecting to home...`
                    : notification.type === "stock"
                      ? notification.name
                  : `${notification.quantity} x ${notification.name}`
                : ""}
            </p>
          </div>
          <div className="rounded-full bg-black/[0.035] p-2 text-(--text-tertiary)">
            {notification?.type === "wishlist" ? (
              <Heart className="h-4 w-4" fill="currentColor" />
            ) : notification?.type === "order" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : notification?.type === "stock" ? (
              <ShoppingBag className="h-4 w-4" />
            ) : (
              <ShoppingBag className="h-4 w-4" />
            )}
          </div>
        </div>
      </div>
      <Header />
      <main className="relative z-10 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
