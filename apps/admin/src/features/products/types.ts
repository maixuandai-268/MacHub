export type ProductStatusFilter = "all" | "featured" | "active" | "out_of_stock";

export type ProductInventoryAdjustment = {
  type: "increase" | "decrease" | "set";
  quantity: number;
  reason: string;
  note?: string;
};
