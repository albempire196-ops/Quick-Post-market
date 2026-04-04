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
  available: "bg-emerald-500/15 text-emerald-700 border-emerald-500/20",
  reserved: "bg-amber-500/15 text-amber-700 border-amber-500/20",
  sold: "bg-rose-500/15 text-rose-700 border-rose-500/20",
};

export const extractNumericPrice = (value?: string | null) => {
  if (!value) return null;
  const normalized = value.replace(/,/g, "").match(/\d+(\.\d+)?/);
  if (!normalized) return null;
  return Number(normalized[0]);
};