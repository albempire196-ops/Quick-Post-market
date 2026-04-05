import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcw, Grid3X3, Smartphone, Shirt, Home, Car, Palette, Dumbbell, BookOpen, Sparkles, Hotel, Building2, CarFront, Wrench, Users, Bed, Star } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";
import { ProductSort } from "@/lib/marketplace";

interface FiltersProps {
  selectedCategory: string;
  selectedStatus: string;
  minPrice: string;
  maxPrice: string;
  sortBy: ProductSort;
  minGuests: string;
  minBedrooms: string;
  minRating: string;
  onCategoryChange: (category: string) => void;
  onStatusChange: (status: string) => void;
  onMinPriceChange: (value: string) => void;
  onMaxPriceChange: (value: string) => void;
  onSortChange: (sort: ProductSort) => void;
  onMinGuestsChange: (value: string) => void;
  onMinBedroomsChange: (value: string) => void;
  onMinRatingChange: (value: string) => void;
  onReset: () => void;
}

const categories: { id: string; nameKey: TranslationKey; icon: any }[] = [
  { id: "all", nameKey: "all_categories", icon: Grid3X3 },
  { id: "hotels", nameKey: "hotels", icon: Hotel },
  { id: "house_rent", nameKey: "house_rent", icon: Building2 },
  { id: "house_buy", nameKey: "house_buy", icon: Home },
  { id: "car_rent", nameKey: "car_rent", icon: CarFront },
  { id: "vehicles", nameKey: "vehicles", icon: Car },
  { id: "electronics", nameKey: "electronics", icon: Smartphone },
  { id: "clothing", nameKey: "clothing", icon: Shirt },
  { id: "furniture", nameKey: "furniture", icon: Home },
  { id: "services", nameKey: "services", icon: Wrench },
  { id: "sports", nameKey: "sports", icon: Dumbbell },
  { id: "books", nameKey: "books", icon: BookOpen },
  { id: "art", nameKey: "art_crafts", icon: Palette },
  { id: "other", nameKey: "other", icon: Sparkles },
];

const statuses = ["all", "available", "reserved", "sold"];

export const Filters = ({
  selectedCategory,
  selectedStatus,
  minPrice,
  maxPrice,
  sortBy,
  minGuests,
  minBedrooms,
  minRating,
  onCategoryChange,
  onStatusChange,
  onMinPriceChange,
  onMaxPriceChange,
  onSortChange,
  onMinGuestsChange,
  onMinBedroomsChange,
  onMinRatingChange,
  onReset,
}: FiltersProps) => {
  const { t } = useLanguage();

  return (
    <div className="liquid-glass rounded-[2rem] p-6 space-y-6 border-border/15">
      <div className="flex items-center justify-between">
        <h3 className="font-sans font-bold text-lg">{t("filters")}</h3>
        <Button variant="ghost" size="sm" onClick={onReset} className="text-muted-foreground hover:text-foreground h-9 px-3 rounded-xl transition-all duration-300">
          <RotateCcw className="w-4 h-4 mr-2" />
          {t("reset")}
        </Button>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground mb-3 tracking-wider uppercase">{t("categories")}</p>
        <div className="space-y-1">
          {categories.map((category) => {
            const isSelected = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all duration-300 ease-premium ${
                  isSelected
                    ? "btn-premium shadow-button"
                    : "hover:bg-secondary/60 text-foreground"
                }`}
              >
                <category.icon className={`w-4.5 h-4.5 ${isSelected ? "text-primary-foreground" : "text-muted-foreground"}`} />
                <span className="font-medium text-sm">{t(category.nameKey)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Status</p>
        <div className="grid grid-cols-2 gap-2">
          {statuses.map((status) => {
            const isSelected = selectedStatus === status;
            return (
              <button
                key={status}
                onClick={() => onStatusChange(status)}
                className={`px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 ease-premium ${
                  isSelected
                    ? "btn-premium shadow-button"
                    : "bg-secondary/40 hover:bg-secondary/70 border border-border/30"
                }`}
              >
                {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Price range</p>
        <div className="grid grid-cols-2 gap-2">
          <Input
            value={minPrice}
            onChange={(event) => onMinPriceChange(event.target.value)}
            inputMode="decimal"
            placeholder="Min"
            className="input-premium"
          />
          <Input
            value={maxPrice}
            onChange={(event) => onMaxPriceChange(event.target.value)}
            inputMode="decimal"
            placeholder="Max"
            className="input-premium"
          />
        </div>
      </div>

      {/* Hotel/Property Filters — show when hotel-related category selected */}
      {(selectedCategory === "hotels" || selectedCategory === "house_rent" || selectedCategory === "house_buy") && (
        <div className="space-y-3 animate-fade-in">
          <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Property Filters</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Min Guests</label>
              <Input
                value={minGuests}
                onChange={(e) => onMinGuestsChange(e.target.value)}
                inputMode="numeric"
                placeholder="Any"
                className="input-premium h-9"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground flex items-center gap-1.5"><Bed className="w-3.5 h-3.5" /> Min Bedrooms</label>
              <Input
                value={minBedrooms}
                onChange={(e) => onMinBedroomsChange(e.target.value)}
                inputMode="numeric"
                placeholder="Any"
                className="input-premium h-9"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> Min Star Rating</label>
            <Select value={minRating} onValueChange={onMinRatingChange}>
              <SelectTrigger className="input-premium h-9">
                <SelectValue placeholder="Any rating" />
              </SelectTrigger>
              <SelectContent className="glass rounded-2xl border-border/30 shadow-premium">
                <SelectItem value="any">Any rating</SelectItem>
                <SelectItem value="3">3+ Stars</SelectItem>
                <SelectItem value="4">4+ Stars</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-xs font-semibold text-muted-foreground tracking-wider uppercase">Sort by</p>
        <Select value={sortBy} onValueChange={(value) => onSortChange(value as ProductSort)}>
          <SelectTrigger className="input-premium">
            <SelectValue placeholder="Sort products" />
          </SelectTrigger>
          <SelectContent className="glass rounded-2xl border-border/30 shadow-premium">
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
