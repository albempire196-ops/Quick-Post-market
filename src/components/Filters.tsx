import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, Grid3X3, Smartphone, Shirt, Home, Car, Palette, Dumbbell, BookOpen, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { ProductSort } from "@/lib/marketplace";

interface FiltersProps {
  selectedCategory: string;
  selectedStatus: string;
  minPrice: string;
  maxPrice: string;
  sortBy: ProductSort;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onSortChange: (sort: ProductSort) => void;
  onReset: () => void;
}

const categories: { id: string; nameKey: TranslationKey; icon: any }[] = [
  { id: "all", nameKey: "all_categories", icon: Grid3X3 },
  { id: "electronics", nameKey: "electronics", icon: Smartphone },
  { id: "clothing", nameKey: "clothing", icon: Shirt },
  { id: "home", nameKey: "home_garden", icon: Home },
  { id: "furniture", nameKey: "furniture", icon: Home },
  { id: "vehicles", nameKey: "vehicles", icon: Car },
  { id: "art", nameKey: "art_crafts", icon: Palette },
  { id: "sports", nameKey: "sports", icon: Dumbbell },
  { id: "books", nameKey: "books", icon: BookOpen },
  { id: "other", nameKey: "other", icon: Sparkles },
];

const statuses = ["all", "available", "reserved", "sold"];

export const Filters = ({
  selectedCategory,
  selectedStatus,
  minPrice,
  maxPrice,
  sortBy,
  onCategoryChange,
  onStatusChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
  onReset,
}: FiltersProps) => {
  const { t } = useLanguage();

  return (
    <div className="glass rounded-2xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg">{t("filters")}</h3>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground hover:text-foreground h-9 px-3">
          <RotateCcw className="w-4 h-4 mr-2" />
          {t("reset")}
        </Button>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground mb-3">{t("categories")}</p>
        <div className="space-y-1.5">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  isSelected
                    ? "bg-gradient-primary text-primary-foreground shadow-button"
                    : "hover:bg-secondary/80 text-foreground"
                }`}
              >
                <category.icon className={`w-5 h-5 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`} />
                <span className="font-medium">{t(category.nameKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Status</p>
        <div className="grid grid-cols-2 gap-2">
          {statuses.map((status) => {
            const isSelected = selectedStatus === status;
            return (
              <button
                key={status}
                onClick={() => onStatusChange(status)}
                className={`px-3 py-2 rounded-xl text-sm transition-all ${
                  isSelected
                    ? "bg-gradient-primary text-primary-foreground shadow-button"
                    : "bg-secondary/50 hover:bg-secondary/80"
                }`}
              >
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Price range</p>
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={minPrice}
            onChange={(event) => onMinPriceChange(event.target.value)}
            inputMode="decimal"
            placeholder="Min"
            className="bg-secondary/50 border-0 rounded-xl"
          />
          <Input
            value={maxPrice}
            onChange={(event) => onMaxPriceChange(event.target.value)}
            inputMode="decimal"
            placeholder="Max"
            className="bg-secondary/50 border-0 rounded-xl"
          />
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-muted-foreground">Sort by</p>
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as ProductSort)}>
          <SelectTrigger className="bg-secondary/50 border-0 rounded-xl">
            <SelectValue placeholder="Sort products" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest first</SelectItem>
            <SelectItem value="oldest">Oldest first</SelectItem>
            <SelectItem value="price-asc">Price: low to high</SelectItem>
            <SelectItem value="price-desc">Price: high to low</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
