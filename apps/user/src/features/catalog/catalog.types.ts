export type CatalogCategory = {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
};

export type CatalogProduct = {
  id: string;
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
  status: string;
  displayStatus: string;
  image: string;
  images: Array<{
    url: string;
    alt: string;
    sortOrder: number;
  }>;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  createdAt: string;
  updatedAt: string;
};

export type CatalogProductFilters = {
  batteryCapacity: string[];
  screenType: string[];
  screenDiagonal: string[];
  protectionClass: string[];
  builtInMemory: string[];
};
