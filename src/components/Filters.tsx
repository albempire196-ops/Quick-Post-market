import { Button } from "@/components/ui/button";
import { RotateCcw, Grid3X3, Smartphone, Shirt, Home, Car, Palette, Music, Dumbbell, BookOpen, Sparkles } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import type { TranslationKey } from "@/i18n/translations";

interface FiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
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
  { id: "music", nameKey: "music", icon: Music },
  { id: "sports", nameKey: "sports", icon: Dumbbell },
  { id: "books", nameKey: "books", icon: BookOpen },
  { id: "other", nameKey: "other", icon: Sparkles },
];

export const Filters = ({ selectedCategory, onCategoryChange, onReset }: FiltersProps) => {
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
    </div>
  );
};
