function getApiOrigin() {
  const apiUrl = String(import.meta.env.VITE_API_URL || "");

  if (!apiUrl) {
    if (typeof window !== "undefined") {
      const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
      if (isLocalHost) {
        return "http://localhost:4000";
      }
    }

    return "";
  }

  try {
    return new URL(apiUrl).origin;
  } catch {
    if (typeof window !== "undefined") {
      const isLocalHost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
      if (isLocalHost) {
        return "http://localhost:4000";
      }
    }

    return "";
  }
}

const assetAliasMap: Record<string, string> = {
  "/assets/images/apple-iphone-17-main.jpg": "/assets/images/iphone-17.png",
  "/assets/images/apple-iphone-17-pro-max-main.jpg": "/assets/images/iphone-17-pro.png",
  "/assets/images/iphone-fallback.png": "/assets/images/iphone-17.png",
  "/assets/images/iphone-14-front.png": "/assets/images/iphone-17.png",
  "/assets/images/iphone-14-pro-main.png": "/assets/images/iphone-17-pro.png",
  "/assets/images/iphone-14-pro-angle-1.png": "/assets/images/iphone-17-pro.png",
  "/assets/images/iphone-14-pro-angle-2.png": "/assets/images/iphone-17-pro.png",
  "/assets/images/iphone-14-pro-angle-3.png": "/assets/images/iphone-17-pro.png",
  "/assets/images/iphone-14-pro-angle-4.png": "/assets/images/iphone-17-pro.png",
  "/assets/images/iphone-14-pro-gold.png": "/assets/images/iphone-17-pro.png",
  "/assets/images/iphone-17-promax.png": "/assets/images/iphone-17-pro.png",
  "/assets/images/iphone-16-plus.png": "/assets/images/iphone-16.png",
  "/assets/images/apple-watch.png": "/assets/images/apple-watch-series-11.png",
  "/assets/images/apple-watch-ultra-3.png": "/assets/images/apple-watch-series-11.png",
  "/assets/images/airpods-max-silver.png": "/assets/images/airpods-max.png",
  "/assets/images/wireless-headphones.png": "/assets/images/airpods-pro-3.png",
  "/assets/images/airpods-4-with-active-noise-cancellation.png": "/assets/images/airpods-4.png",
  "/assets/images/ipad-10-9-wifi.png": "/assets/images/ipad-a16.png",
  "/assets/images/macbook-air-side.png": "/assets/images/macbook-air-13-inch.png",
  "/assets/images/macbook-air-main.png": "/assets/images/macbook-air-13-inch.png",
  "/assets/images/profile-image-41.png": "/assets/images/iphone-17.png",
  "/assets/images/profile-group-1.png": "/assets/images/iphone-17.png",
  "/assets/images/profile-image-64.png": "/assets/images/iphone-17.png",
  "/assets/images/product-group.png": "/assets/images/macbook-pro-16-inch.png",
};

export function resolveAssetUrl(src?: string | null) {
  if (!src) {
    return "";
  }

  if (/^https?:\/\//i.test(src)) {
    return src;
  }

  if (src.startsWith("/assets/")) {
    return assetAliasMap[src] || src;
  }

  if (src.startsWith("/uploads/")) {
    const origin = getApiOrigin();
    return origin ? `${origin}${src}` : src;
  }

  return src;
}
