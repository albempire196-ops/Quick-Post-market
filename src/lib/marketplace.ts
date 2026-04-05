export type ProductStatus = "available" | "reserved" | "sold";
export type ProductSort = "newest" | "oldest" | "price-asc" | "price-desc";
export type ReportStatus = "open" | "reviewed" | "resolved";

export const PRODUCT_STATUSES: ProductStatus[] = ["available", "reserved", "sold"];

export const PRODUCT_STATUS_LABELS: Record<ProductStatus, string> = {
  available: "Available",
  reserved: "Reserved",
  sold: "Sold",
};

export const PRODUCT_STATUS_STYLES: Record<ProductStatus, string> = {
  available: "bg-emerald-500/10 text-emerald-600 border-emerald-500/15 dark:text-emerald-400",
  reserved: "bg-amber-500/10 text-amber-600 border-amber-500/15 dark:text-amber-400",
  sold: "bg-rose-500/10 text-rose-600 border-rose-500/15 dark:text-rose-400",
};

export const extractNumericPrice = (value?: string | null) => {
  if (!value) return null;
  const normalized = value.replace(/,/g, "").match(/\d+(\.\d+)?/);
  if (!normalized) return null;
  return Number(normalized[0]);
};