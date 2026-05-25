import type {
  CatalogCategory,
  CatalogProduct,
  CatalogProductFilters,
} from "./catalog.types";

const now = "2026-03-27T00:00:00.000Z";

function imageUrl(name: string) {
  return `/assets/images/${name
    .toLowerCase()
    .replace(/\bpro max\b/g, "promax")
    .replace(/[()]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")}.png`;
}

export const fallbackCategories: CatalogCategory[] = [
  {
    id: "mac",
    name: "Mac",
    slug: "mac",
    image: imageUrl("MacBook Pro 16-inch"),
    description: "Mac notebooks and desktops for creative work, productivity, and studio setups.",
  },
  {
    id: "iphone",
    name: "iPhone",
    slug: "iphone",
    image: imageUrl("iPhone 17 Pro Max"),
    description: "Current iPhone lineup with standard, Plus, Pro, and Pro Max hardware.",
  },
  {
    id: "ipad",
    name: "iPad",
    slug: "ipad",
    image: imageUrl("iPad Pro 13-inch"),
    description: "iPad tablets for note taking, sketching, media, and portable workflows.",
  },
  {
    id: "apple-watch",
    name: "Apple Watch",
    slug: "apple-watch",
    image: imageUrl("Apple Watch Ultra 3"),
    description: "Apple Watch models built around health, fitness, and daily connectivity.",
  },
  {
    id: "apple-vision-pro",
    name: "Apple Vision Pro",
    slug: "apple-vision-pro",
    image: imageUrl("Apple Vision Pro"),
    description: "Spatial computing hardware built around immersive apps, video, and workspaces.",
  },
  {
    id: "airpods",
    name: "AirPods",
    slug: "airpods",
    image: imageUrl("AirPods Pro 3"),
    description: "AirPods audio products spanning open-fit, Pro, and over-ear listening.",
  },
];

const categoryMap = Object.fromEntries(
  fallbackCategories.map((category) => [category.slug, category])
);

function categoryRef(slug: string) {
  const category = categoryMap[slug];

  return category
    ? {
        id: category.id,
        name: category.name,
        slug: category.slug,
      }
    : null;
}

type RawProduct = {
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  featured: boolean;
  batteryCapacity: string;
  screenType: string;
  screenDiagonal: string;
  protectionClass: string;
  builtInMemory: string;
  categorySlug: string;
};

const rawProducts: RawProduct[] = [
  {
    name: "MacBook Air 13-inch",
    slug: "macbook-air-13-inch",
    sku: "MAC-MBA13",
    description: "The thinnest everyday Mac notebook in the lineup, tuned for school, travel, and quiet daily work.",
    price: 28990000,
    compareAtPrice: null,
    stock: 12,
    featured: true,
    batteryCapacity: "Up to 18 hours",
    screenType: "Liquid Retina",
    screenDiagonal: "13.6-inch",
    protectionClass: "",
    builtInMemory: "256GB",
    categorySlug: "mac",
  },
  {
    name: "MacBook Air 15-inch",
    slug: "macbook-air-15-inch",
    sku: "MAC-MBA15",
    description: "A larger Air for people who want more canvas for multitasking without giving up portability.",
    price: 32990000,
    compareAtPrice: null,
    stock: 10,
    featured: true,
    batteryCapacity: "Up to 18 hours",
    screenType: "Liquid Retina",
    screenDiagonal: "15.3-inch",
    protectionClass: "",
    builtInMemory: "256GB",
    categorySlug: "mac",
  },
  {
    name: "MacBook Pro 14-inch",
    slug: "macbook-pro-14-inch",
    sku: "MAC-MBP14",
    description: "Compact pro notebook with stronger sustained performance for editing, design, code, and studio workloads.",
    price: 46990000,
    compareAtPrice: null,
    stock: 8,
    featured: true,
    batteryCapacity: "Up to 22 hours",
    screenType: "Liquid Retina XDR",
    screenDiagonal: "14.2-inch",
    protectionClass: "",
    builtInMemory: "512GB",
    categorySlug: "mac",
  },
  {
    name: "MacBook Pro 16-inch",
    slug: "macbook-pro-16-inch",
    sku: "MAC-MBP16",
    description: "The larger MacBook Pro for longer sessions, bigger timelines, and heavier creative pipelines.",
    price: 68990000,
    compareAtPrice: null,
    stock: 6,
    featured: true,
    batteryCapacity: "Up to 24 hours",
    screenType: "Liquid Retina XDR",
    screenDiagonal: "16.2-inch",
    protectionClass: "",
    builtInMemory: "512GB",
    categorySlug: "mac",
  },
  {
    name: "iMac",
    slug: "imac",
    sku: "MAC-IMAC",
    description: "All-in-one desktop Mac that keeps workspaces cleaner while still feeling vivid, bright, and approachable.",
    price: 38990000,
    compareAtPrice: null,
    stock: 7,
    featured: false,
    batteryCapacity: "",
    screenType: "Retina 4.5K",
    screenDiagonal: "24-inch",
    protectionClass: "",
    builtInMemory: "256GB",
    categorySlug: "mac",
  },
  {
    name: "Mac mini",
    slug: "mac-mini",
    sku: "MAC-MINI",
    description: "Small-footprint Mac desktop built for people who already have a monitor and want a compact workstation.",
    price: 16990000,
    compareAtPrice: null,
    stock: 9,
    featured: false,
    batteryCapacity: "",
    screenType: "",
    screenDiagonal: "",
    protectionClass: "",
    builtInMemory: "256GB",
    categorySlug: "mac",
  },
  {
    name: "Mac Studio",
    slug: "mac-studio",
    sku: "MAC-STUDIO",
    description: "Desktop Mac made for heavier production work, pro apps, and dense multi-display studio setups.",
    price: 55990000,
    compareAtPrice: null,
    stock: 5,
    featured: false,
    batteryCapacity: "",
    screenType: "",
    screenDiagonal: "",
    protectionClass: "",
    builtInMemory: "512GB",
    categorySlug: "mac",
  },
  {
    name: "iPhone 17",
    slug: "iphone-17",
    sku: "IPH-17",
    description: "The standard iPhone for the current generation, balancing a bright display, capable cameras, and long daily use.",
    price: 23990000,
    compareAtPrice: null,
    stock: 16,
    featured: false,
    batteryCapacity: "All-day battery life",
    screenType: "Super Retina XDR",
    screenDiagonal: "6.3-inch",
    protectionClass: "IP68",
    builtInMemory: "128GB",
    categorySlug: "iphone",
  },
  {
    name: "iPhone 17e",
    slug: "iphone-17e",
    sku: "IPH-17E",
    description: "The more accessible current iPhone, built around essential performance, camera quality, and Apple Intelligence support.",
    price: 18990000,
    compareAtPrice: null,
    stock: 14,
    featured: false,
    batteryCapacity: "All-day battery life",
    screenType: "Super Retina XDR",
    screenDiagonal: "6.1-inch",
    protectionClass: "IP68",
    builtInMemory: "128GB",
    categorySlug: "iphone",
  },
  {
    name: "iPhone 17 Pro",
    slug: "iphone-17-pro",
    sku: "IPH-17PRO",
    description: "The smaller Pro iPhone with stronger camera hardware, premium finishes, and more headroom for advanced capture.",
    price: 32990000,
    compareAtPrice: null,
    stock: 10,
    featured: true,
    batteryCapacity: "All-day battery life",
    screenType: "ProMotion XDR",
    screenDiagonal: "6.3-inch",
    protectionClass: "IP68",
    builtInMemory: "256GB",
    categorySlug: "iphone",
  },
  {
    name: "iPhone 17 Pro Max",
    slug: "iphone-17-pro-max",
    sku: "IPH-17PM",
    description: "The largest Pro iPhone, tuned for longer endurance, larger framing, and the most expansive flagship experience.",
    price: 38990000,
    compareAtPrice: null,
    stock: 8,
    featured: true,
    batteryCapacity: "Longest battery life in the lineup",
    screenType: "ProMotion XDR",
    screenDiagonal: "6.9-inch",
    protectionClass: "IP68",
    builtInMemory: "256GB",
    categorySlug: "iphone",
  },
  {
    name: "iPhone 16",
    slug: "iphone-16",
    sku: "IPH-16",
    description: "A current-generation iPhone that still anchors the lineup with dependable cameras and a fast everyday feel.",
    price: 21990000,
    compareAtPrice: null,
    stock: 12,
    featured: false,
    batteryCapacity: "All-day battery life",
    screenType: "Super Retina XDR",
    screenDiagonal: "6.1-inch",
    protectionClass: "IP68",
    builtInMemory: "128GB",
    categorySlug: "iphone",
  },
  {
    name: "iPhone 16 Plus",
    slug: "iphone-16-plus",
    sku: "IPH-16PLUS",
    description: "The larger standard iPhone for shoppers who want extra screen space without jumping into the Pro tier.",
    price: 24990000,
    compareAtPrice: null,
    stock: 9,
    featured: false,
    batteryCapacity: "All-day battery life",
    screenType: "Super Retina XDR",
    screenDiagonal: "6.7-inch",
    protectionClass: "IP68",
    builtInMemory: "128GB",
    categorySlug: "iphone",
  },
  {
    name: "iPad Pro 11-inch",
    slug: "ipad-pro-11-inch",
    sku: "IPD-PRO11",
    description: "The most compact iPad Pro, focused on high brightness, strong performance, and a highly portable studio feel.",
    price: 28990000,
    compareAtPrice: null,
    stock: 9,
    featured: true,
    batteryCapacity: "Up to 10 hours",
    screenType: "Ultra Retina XDR",
    screenDiagonal: "11-inch",
    protectionClass: "",
    builtInMemory: "256GB",
    categorySlug: "ipad",
  },
  {
    name: "iPad Pro 13-inch",
    slug: "ipad-pro-13-inch",
    sku: "IPD-PRO13",
    description: "A larger iPad Pro built for drawing, video review, and tablet-first workflows that need more canvas.",
    price: 37990000,
    compareAtPrice: null,
    stock: 7,
    featured: true,
    batteryCapacity: "Up to 10 hours",
    screenType: "Ultra Retina XDR",
    screenDiagonal: "13-inch",
    protectionClass: "",
    builtInMemory: "256GB",
    categorySlug: "ipad",
  },
  {
    name: "iPad Air 11-inch",
    slug: "ipad-air-11-inch",
    sku: "IPD-AIR11",
    description: "A lighter iPad for people who want a cleaner mix of performance, portability, and Apple Pencil support.",
    price: 18990000,
    compareAtPrice: null,
    stock: 11,
    featured: false,
    batteryCapacity: "Up to 10 hours",
    screenType: "Liquid Retina",
    screenDiagonal: "11-inch",
    protectionClass: "",
    builtInMemory: "128GB",
    categorySlug: "ipad",
  },
  {
    name: "iPad Air 13-inch",
    slug: "ipad-air-13-inch",
    sku: "IPD-AIR13",
    description: "The larger Air for browsing, sketching, and multitasking with more room but a lower step than Pro.",
    price: 24990000,
    compareAtPrice: null,
    stock: 8,
    featured: false,
    batteryCapacity: "Up to 10 hours",
    screenType: "Liquid Retina",
    screenDiagonal: "13-inch",
    protectionClass: "",
    builtInMemory: "128GB",
    categorySlug: "ipad",
  },
  {
    name: "iPad (A16)",
    slug: "ipad-a16",
    sku: "IPD-A16",
    description: "The most approachable iPad in the lineup, designed for browsing, studying, notes, and family use.",
    price: 11990000,
    compareAtPrice: null,
    stock: 15,
    featured: false,
    batteryCapacity: "Up to 10 hours",
    screenType: "Liquid Retina",
    screenDiagonal: "11-inch",
    protectionClass: "",
    builtInMemory: "128GB",
    categorySlug: "ipad",
  },
  {
    name: "iPad mini",
    slug: "ipad-mini",
    sku: "IPD-MINI",
    description: "The most compact iPad for reading, field notes, travel, and one-handed browsing with Apple Pencil support.",
    price: 14990000,
    compareAtPrice: null,
    stock: 10,
    featured: false,
    batteryCapacity: "Up to 10 hours",
    screenType: "Liquid Retina",
    screenDiagonal: "8.3-inch",
    protectionClass: "",
    builtInMemory: "128GB",
    categorySlug: "ipad",
  },
  {
    name: "Apple Watch Series 11",
    slug: "apple-watch-series-11",
    sku: "WAT-S11",
    description: "The core Apple Watch with brighter health insights, a clean display, and an easy all-day wearable fit.",
    price: 11990000,
    compareAtPrice: null,
    stock: 12,
    featured: true,
    batteryCapacity: "Up to 18 hours",
    screenType: "Always-On Retina LTPO OLED",
    screenDiagonal: "42mm",
    protectionClass: "50m water resistant",
    builtInMemory: "64GB",
    categorySlug: "apple-watch",
  },
  {
    name: "Apple Watch SE",
    slug: "apple-watch-se",
    sku: "WAT-SE",
    description: "The accessible Apple Watch, centered on core activity, notifications, and everyday health tracking.",
    price: 6990000,
    compareAtPrice: null,
    stock: 15,
    featured: false,
    batteryCapacity: "Up to 18 hours",
    screenType: "Retina LTPO OLED",
    screenDiagonal: "40mm",
    protectionClass: "50m water resistant",
    builtInMemory: "32GB",
    categorySlug: "apple-watch",
  },
  {
    name: "Apple Watch Ultra 3",
    slug: "apple-watch-ultra-3",
    sku: "WAT-ULTRA3",
    description: "The toughest Apple Watch for extended outdoor use, training sessions, and the brightest wrist display.",
    price: 22990000,
    compareAtPrice: null,
    stock: 6,
    featured: true,
    batteryCapacity: "Up to 36 hours",
    screenType: "Always-On Retina LTPO OLED",
    screenDiagonal: "49mm",
    protectionClass: "100m water resistant",
    builtInMemory: "64GB",
    categorySlug: "apple-watch",
  },
  {
    name: "Apple Vision Pro",
    slug: "apple-vision-pro",
    sku: "AVP-BASE",
    description: "Apple's spatial computer for immersive apps, large virtual screens, and high-fidelity media playback.",
    price: 99990000,
    compareAtPrice: null,
    stock: 4,
    featured: true,
    batteryCapacity: "Up to 2 hours",
    screenType: "Micro-OLED",
    screenDiagonal: "Dual displays",
    protectionClass: "",
    builtInMemory: "256GB",
    categorySlug: "apple-vision-pro",
  },
  {
    name: "AirPods 4",
    slug: "airpods-4",
    sku: "AIRPODS4",
    description: "Open-fit AirPods with a lighter case, cleaner voice pickup, and the easiest entry into Apple's audio range.",
    price: 3490000,
    compareAtPrice: null,
    stock: 18,
    featured: false,
    batteryCapacity: "Up to 30 hours",
    screenType: "",
    screenDiagonal: "",
    protectionClass: "IP54",
    builtInMemory: "",
    categorySlug: "airpods",
  },
  {
    name: "AirPods 4 with Active Noise Cancellation",
    slug: "airpods-4-active-noise-cancellation",
    sku: "AIRPODS4-ANC",
    description: "Open-fit AirPods that add active noise cancellation, transparency, and a more advanced listening profile.",
    price: 4490000,
    compareAtPrice: null,
    stock: 14,
    featured: false,
    batteryCapacity: "Up to 30 hours",
    screenType: "",
    screenDiagonal: "",
    protectionClass: "IP54",
    builtInMemory: "",
    categorySlug: "airpods",
  },
  {
    name: "AirPods Pro 3",
    slug: "airpods-pro-3",
    sku: "AIRPODSPRO3",
    description: "The most advanced in-ear AirPods, built around stronger noise control, comfort, and adaptive listening.",
    price: 6490000,
    compareAtPrice: null,
    stock: 10,
    featured: true,
    batteryCapacity: "Up to 30 hours",
    screenType: "",
    screenDiagonal: "",
    protectionClass: "IP54",
    builtInMemory: "",
    categorySlug: "airpods",
  },
  {
    name: "AirPods Max",
    slug: "airpods-max",
    sku: "AIRPODSMAX",
    description: "Apple's over-ear audio flagship with richer staging, deeper materials, and a more studio-like presentation.",
    price: 14990000,
    compareAtPrice: null,
    stock: 7,
    featured: true,
    batteryCapacity: "Up to 20 hours",
    screenType: "",
    screenDiagonal: "",
    protectionClass: "",
    builtInMemory: "",
    categorySlug: "airpods",
  },
];

function displayStatus(product: RawProduct) {
  if (product.stock <= 0) return "out_of_stock";
  if (product.featured) return "featured";
  if (product.compareAtPrice && product.compareAtPrice > product.price) return "sale";
  return "normal";
}

export const fallbackProducts: CatalogProduct[] = rawProducts.map((product) => {
  const primary = imageUrl(product.name);

  return {
    id: product.slug,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    featured: product.featured,
    batteryCapacity: product.batteryCapacity,
    screenType: product.screenType,
    screenDiagonal: product.screenDiagonal,
    protectionClass: product.protectionClass,
    builtInMemory: product.builtInMemory,
    status: product.stock <= 0 ? "out_of_stock" : "active",
    displayStatus: displayStatus(product),
    image: primary,
    images: [{ url: primary, alt: product.name, sortOrder: 0 }],
    category: categoryRef(product.categorySlug),
    createdAt: now,
    updatedAt: now,
  };
});

function parseValues(value?: string | number | boolean | Array<string | number | boolean>) {
  if (Array.isArray(value)) {
    return value.map(String).filter(Boolean);
  }

  if (value === undefined || value === null || value === "") {
    return [];
  }

  return String(value)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function getFallbackCategories(limit?: number) {
  return typeof limit === "number" ? fallbackCategories.slice(0, limit) : fallbackCategories;
}

export function getFallbackProducts(
  params?: Record<string, string | number | boolean | Array<string | number | boolean>>
) {
  const category = String(params?.category || "").trim();
  const search = String(params?.search || "").trim().toLowerCase();
  const featured = params?.featured;
  const batteryCapacityValues = parseValues(params?.batteryCapacity);
  const screenTypeValues = parseValues(params?.screenType);
  const screenDiagonalValues = parseValues(params?.screenDiagonal);
  const protectionClassValues = parseValues(params?.protectionClass);
  const builtInMemoryValues = parseValues(params?.builtInMemory);
  const limit = Number(params?.limit || 0);

  let items = [...fallbackProducts];

  if (category) {
    items = items.filter(
      (item) => item.category?.id === category || item.category?.slug === category
    );
  }

  if (search) {
    items = items.filter((item) =>
      [item.name, item.slug, item.sku].some((field) => field.toLowerCase().includes(search))
    );
  }

  if (featured !== undefined) {
    const featuredValue = String(featured) === "true";
    items = items.filter((item) => item.featured === featuredValue);
  }

  if (batteryCapacityValues.length) {
    items = items.filter((item) => batteryCapacityValues.includes(item.batteryCapacity));
  }

  if (screenTypeValues.length) {
    items = items.filter((item) => screenTypeValues.includes(item.screenType));
  }

  if (screenDiagonalValues.length) {
    items = items.filter((item) => screenDiagonalValues.includes(item.screenDiagonal));
  }

  if (protectionClassValues.length) {
    items = items.filter((item) => protectionClassValues.includes(item.protectionClass));
  }

  if (builtInMemoryValues.length) {
    items = items.filter((item) => builtInMemoryValues.includes(item.builtInMemory));
  }

  return limit > 0 ? items.slice(0, limit) : items;
}

function uniqueValues(items: CatalogProduct[], key: keyof CatalogProduct) {
  return [...new Set(items.map((item) => String(item[key] || "").trim()).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b)
  );
}

export function getFallbackProductFilters(
  params?: Record<string, string | number | boolean | Array<string | number | boolean>>
): CatalogProductFilters {
  const items = getFallbackProducts(params);

  return {
    batteryCapacity: uniqueValues(items, "batteryCapacity"),
    screenType: uniqueValues(items, "screenType"),
    screenDiagonal: uniqueValues(items, "screenDiagonal"),
    protectionClass: uniqueValues(items, "protectionClass"),
    builtInMemory: uniqueValues(items, "builtInMemory"),
  };
}

export function getFallbackProductDetail(slug: string) {
  return fallbackProducts.find((item) => item.slug === slug) || null;
}
