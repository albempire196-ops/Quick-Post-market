import { Badge } from "@/components/ui/badge";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_STYLES, ProductStatus } from "@/lib/marketplace";

interface ProductStatusBadgeProps {
  status?: string | null;
}

export const ProductStatusBadge = ({ status }: ProductStatusBadgeProps) => {
  const normalizedStatus = (status || "available") as ProductStatus;

  return (
    <Badge className={`border ${PRODUCT_STATUS_STYLES[normalizedStatus]} rounded-xl text-xs font-semibold backdrop-blur-sm`} variant="outline">
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        normalizedStatus === 'available' ? 'bg-emerald-500 animate-pulse-soft' :
        normalizedStatus === 'reserved' ? 'bg-amber-500' :
        'bg-rose-500'
      }`} />
      {PRODUCT_STATUS_LABELS[normalizedStatus]}
    </Badge>
  );
};