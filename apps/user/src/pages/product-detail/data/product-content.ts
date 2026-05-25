import type { CatalogProduct } from "@/features/catalog/catalog.types";

export type ProductSpecRow = {
  label: string;
  value: string;
};

export type ProductGalleryItem = {
  id: string;
  image: string;
  fallbackImage: string;
  alt: string;
  label: string;
  imageClassName?: string;
};

export type ProductReview = {
  id: string;
  author: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
  photos?: string[];
};

const productMediaMap: Record<string, string[]> = {
  "iphone-17-pro-max": [
    "/assets/images/iphone-17-promax.png",
  ],
  "macbook-pro-14-inch": [
    "/assets/images/macbook-pro-14-inch.png",
  ],
  "apple-vision-pro": [
    "/assets/images/apple-vision-pro.png",
  ],
};

export type ProductReason = {
  title: string;
  copy: string;
};

export type ProductBoxItem = {
  title: string;
  copy: string;
};

export type ProductSupportItem = {
  title: string;
  copy: string;
};

export type ProductServiceItem = {
  title: string;
  copy: string;
  accentClassName: string;
  badge: string;
};

function getPhoneChip(name: string) {
  if (/iPhone 17 Pro/i.test(name)) return "A19 Pro";
  if (/iPhone 17/i.test(name)) return "A19";
  if (/iPhone 16/i.test(name)) return "A18";
  return "Apple Silicon";
}

function getPhoneRefreshRate(name: string) {
  return /Pro/i.test(name) ? "120 Hz" : "60 Hz";
}

function getPhoneResolution(screenDiagonal: string, name: string) {
  if (/6\.9|6\.7/i.test(screenDiagonal)) {
    return /Pro/i.test(name) ? "2868x1320" : "2796x1290";
  }

  if (/6\.3/i.test(screenDiagonal)) {
    return /Pro/i.test(name) ? "2622x1206" : "2556x1179";
  }

  return "2532x1170";
}

function toAssetToken(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getProductGallery(product: CatalogProduct, finish = ""): ProductGalleryItem[] {
  const mapped = productMediaMap[product.slug] || [];
  const baseImage = product.image || mapped[0] || product.images[0]?.url || "";
  const extraImages = [...mapped, ...product.images.map((item) => item.url)].filter(Boolean);
  const uniqueImages = [...new Set([baseImage, ...extraImages])];
  const primary = uniqueImages[0] || baseImage;
  const finishToken = finish ? toAssetToken(finish) : "default";
  const variantRoot = `/assets/images/variants/${product.slug}`;

  function variantImage(view: string, fallbackImage: string) {
    return {
      image: `${variantRoot}/${product.slug}--${finishToken}--${view}.png`,
      fallbackImage,
    };
  }

  return [
    {
      id: "hero",
      ...variantImage("hero", primary),
      alt: product.name,
      label: "Studio view",
    },
    {
      id: "detail",
      ...variantImage("display", uniqueImages[1] || primary),
      alt: `${product.name} display view`,
      label: "Display view",
      imageClassName: "scale-[1.08] sm:scale-[1.12]",
    },
    {
      id: "focus",
      ...variantImage("detail", uniqueImages[2] || primary),
      alt: `${product.name} close-up`,
      label: "Material focus",
      imageClassName: "scale-[0.92] sm:scale-[0.96]",
    },
  ];
}

export function getProductSpecs(product: CatalogProduct): ProductSpecRow[] {
  if (product.category?.slug === "iphone") {
    return [
      { label: "Screen diagonal", value: product.screenDiagonal || "6.1-inch" },
      { label: "Resolution", value: getPhoneResolution(product.screenDiagonal, product.name) },
      { label: "Refresh rate", value: getPhoneRefreshRate(product.name) },
      { label: "Display type", value: product.screenType || "Super Retina XDR" },
      { label: "Chip", value: getPhoneChip(product.name) },
      { label: "Storage", value: product.builtInMemory || "128GB" },
      { label: "Protection", value: product.protectionClass || "IP68" },
      { label: "Battery", value: product.batteryCapacity || "All-day battery life" },
    ];
  }

  if (product.category?.slug === "airpods") {
    if (/Max/i.test(product.name)) {
      return [
        { label: "Type", value: "Wireless over-ear" },
        { label: "Connection", value: "Bluetooth 5.3" },
        { label: "Noise control", value: "Active Noise Cancellation" },
        { label: "Battery", value: product.batteryCapacity || "Up to 20 hours" },
        { label: "Charging", value: "USB-C" },
        { label: "Build", value: "Aluminum ear cups" },
      ];
    }

    return [
      { label: "Type", value: /Pro|Active Noise Cancellation/i.test(product.name) ? "Wireless in-ear with ANC" : "Wireless open-ear" },
      { label: "Connection", value: "Bluetooth 5.3" },
      { label: "Battery", value: product.batteryCapacity || "Up to 30 hours" },
      { label: "Protection", value: product.protectionClass || "IP54" },
      { label: "Case", value: "USB-C charging case" },
      { label: "Listening mode", value: /Pro|Active Noise Cancellation/i.test(product.name) ? "ANC + Transparency" : "Adaptive EQ" },
    ];
  }

  if (product.category?.slug === "apple-watch") {
    return [
      { label: "Case size", value: product.screenDiagonal || "42mm" },
      { label: "Display", value: product.screenType || "Retina LTPO OLED" },
      { label: "Storage", value: product.builtInMemory || "64GB" },
      { label: "Battery", value: product.batteryCapacity || "Up to 18 hours" },
      { label: "Protection", value: product.protectionClass || "50m water resistant" },
      { label: "Use case", value: /Ultra/i.test(product.name) ? "Outdoor and training" : "Health and everyday connectivity" },
    ];
  }

  if (product.category?.slug === "mac") {
    return [
      { label: "Display", value: product.screenType || "Retina-class display" },
      { label: "Screen size", value: product.screenDiagonal || "Desktop / notebook" },
      { label: "Storage", value: product.builtInMemory || "256GB" },
      { label: "Battery", value: product.batteryCapacity || "Desktop powered" },
      { label: "Positioning", value: /Pro|Studio/i.test(product.name) ? "Professional workflow" : "Everyday workstation" },
      { label: "Form factor", value: /Book/i.test(product.name) ? "Notebook" : "Desktop" },
    ];
  }

  if (product.category?.slug === "ipad") {
    return [
      { label: "Display", value: product.screenType || "Liquid Retina" },
      { label: "Screen size", value: product.screenDiagonal || "11-inch" },
      { label: "Storage", value: product.builtInMemory || "128GB" },
      { label: "Battery", value: product.batteryCapacity || "Up to 10 hours" },
      { label: "Use case", value: /Pro/i.test(product.name) ? "Drawing, editing, studio work" : "Notes, study, and media" },
      { label: "Accessory support", value: "Apple Pencil and keyboard accessories" },
    ];
  }

  if (product.category?.slug === "apple-vision-pro") {
    return [
      { label: "Display", value: product.screenType || "Micro-OLED" },
      { label: "Configuration", value: product.screenDiagonal || "Dual displays" },
      { label: "Storage", value: product.builtInMemory || "256GB" },
      { label: "Battery", value: product.batteryCapacity || "Up to 2 hours" },
      { label: "Platform", value: "Spatial computing" },
      { label: "Use case", value: "Immersive apps, cinema, and virtual workspaces" },
    ];
  }

  return [
    { label: "Category", value: product.category?.name || "Catalog" },
    { label: "SKU", value: product.sku },
    { label: "Availability", value: product.stock > 0 ? "In stock" : "Out of stock" },
    { label: "Created", value: new Date(product.createdAt).toLocaleDateString() },
  ];
}

export function getWhyThisModel(product: CatalogProduct): ProductReason[] {
  if (product.category?.slug === "mac") {
    return [
      {
        title: "Built for lighter daily work",
        copy: "The lineup balance is tuned for portability, battery life, and a cleaner notebook footprint.",
      },
      {
        title: "Enough screen without the bulk",
        copy: "The display and chassis stay compact enough for coffee shops, campus bags, and desk-to-desk movement.",
      },
      {
        title: "A calmer step into Apple silicon",
        copy: "It gives you the Mac workflow without pushing you into the heavier Pro hardware tier too early.",
      },
    ];
  }

  if (product.category?.slug === "iphone") {
    return [
      {
        title: "Camera-first daily flagship",
        copy: "It balances image quality, battery confidence, and the cleanest all-day smartphone footprint.",
      },
      {
        title: "Fast enough to stay out of the way",
        copy: "Performance stays responsive across messaging, camera, maps, and longer media sessions.",
      },
      {
        title: "A better fit than overbuying",
        copy: "You get the capabilities people feel every day without paying extra for specs they never use.",
      },
    ];
  }

  return [
    {
      title: "A focused product fit",
      copy: "This model sits in a narrower position in the lineup so the choice feels clearer and more intentional.",
    },
    {
      title: "Premium hardware, less noise",
      copy: "The visual and technical priorities are kept direct so you can evaluate the product faster.",
    },
    {
      title: "Configured around real use",
      copy: "Storage, finish, and delivery details are surfaced early so the buying decision is easier to complete.",
    },
  ];
}

export function getInTheBoxItems(
  product: CatalogProduct,
  selectedCapacity: string,
  finishLabel: string
): ProductBoxItem[] {
  return [
    {
      title: product.name,
      copy: `${finishLabel} finish with ${selectedCapacity} configured in this selection.`,
    },
    {
      title: "USB-C charging cable",
      copy: "Braided charging cable included inside the box for setup and daily power.",
    },
    {
      title: "Quick start and warranty",
      copy: "Printed setup essentials, warranty coverage, and support references for a cleaner first run.",
    },
  ];
}

export function getSupportDeliveryItems(product: CatalogProduct): ProductSupportItem[] {
  return [
    {
      title: "Fast delivery",
      copy: product.category?.slug === "mac" ? "1-2 business days in major cities." : "Same-week shipping with tracked delivery windows.",
    },
    {
      title: "Official warranty",
      copy: "12-month official coverage with support handling directly through the storefront.",
    },
    {
      title: "Setup guidance",
      copy: "Help with migration, first-run configuration, and continuity features after purchase.",
    },
    {
      title: "Trade and upgrade path",
      copy: "A cleaner route for future upgrades without turning the page into a finance maze.",
    },
  ];
}

export function getIncludedServices(product: CatalogProduct): ProductServiceItem[] {
  const lineupLabel = product.category?.slug === "mac" ? "Your new Mac" : "Your new device";

  return [
    {
      title: `${lineupLabel} starts with TV`,
      copy: "Three months of cinematic streaming, launch events, and flagship originals.",
      accentClassName: "from-[#171717] to-[#353535]",
      badge: "TV",
    },
    {
      title: "Music and lossless audio",
      copy: "A subscription-ready library that makes new speakers, headphones, and laptops feel more complete.",
      accentClassName: "from-[#ff3b82] to-[#ff6b47]",
      badge: "M",
    },
    {
      title: "Arcade and family play",
      copy: "A premium entertainment layer that turns the device into more than a work surface.",
      accentClassName: "from-[#ff6b47] to-[#ff8b4a]",
      badge: "A",
    },
    {
      title: "News and reading",
      copy: "Magazine, news, and publication access that fits larger displays and longer sessions.",
      accentClassName: "from-[#ff4d7e] to-[#ff7f5a]",
      badge: "N",
    },
  ];
}
