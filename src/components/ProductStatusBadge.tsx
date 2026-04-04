import { Badge } from "@/components/ui/badge";
import { PRODUCT_STATUS_LABELS, PRODUCT_STATUS_STYLES, ProductStatus } from "@/lib/marketplace";

interface ProductStatusBadgeProps {
  status?: string | null;
}

export const ProductStatusBadge = ({ status }: ProductStatusBadgeProps) => {
  const normalizedStatus = (status || "available") as ProductStatus;

  return (
    <Badge className={`border ${PRODUCT_STATUS_STYLES[normalizedStatus]} rounded-lg`} variant="outline">
      {PRODUCT_STATUS_LABELS[normalizedStatus]}
    </Badge>
  );
};