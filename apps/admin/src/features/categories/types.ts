export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  image: string;
  isActive: boolean;
  productCount: number;
};

export type ProductStatus = "all" | "featured" | "sale" | "out_of_stock";

export type ProductItem = {
  id: string;
  name: string;
  image: string;
  createdDate: string;
  order: number;
  status: Exclude<ProductStatus, "all"> | "normal";
};
