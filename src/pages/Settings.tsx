import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import { ArrowLeft, LogOut, User, Sparkles, Moon, Sun, Globe, MapPin, Search, Check, Package, Pencil, Trash2 } from "lucide-react";
import { languages } from "@/i18n/translations";
import { countries } from "@/data/countries";
import { useMyProducts } from "@/hooks/useMyProducts";
import { EditProductModal } from "@/components/EditProductModal";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, preferredCountry, setPreferredCountry, t } = useLanguage();
  const [langSearch, setLangSearch] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const { data: myProducts, isLoading: productsLoading } = useMyProducts();
  const [editProduct, setEditProduct] = useState<any>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const filteredLanguages = languages.filter((l) =>
    l.name.toLowerCase().includes(langSearch.toLowerCase())
  );

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase())
  );

  const getCountryName = (code: string | null) => {
    if (!code) return "";
    return countries.find((c) => c.code === code)?.name || code;
  };

  const handleDelete = async () => {
    if (!deleteProductId) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", deleteProductId);
      if (error) throw error;
      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    } finally {
      setDeleteProductId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 mesh-gradient opacity-60 pointer-events-none" />

      <header className="sticky top-0 z-50 glass-strong">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-button">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-display font-bold text-xl">{t("settings")}</h1>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-10 max-w-2xl space-y-8">
        {/* Profile */}
        {user && (
          <section className="glass rounded-3xl p-8 space-y-6 animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button">
                <User className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl">{t("profile")}</h2>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={signOut}
              className="w-full gap-2 h-12 rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/30"
            >
              <LogOut className="w-5 h-5" />
              {t("sign_out")}
            </Button>
          </section>
        )}

        {/* My Products */}
        {user && (
          <section className="glass rounded-3xl p-8 space-y-6 animate-fade-in" style={{ animationDelay: "0.05s" }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button">
                <Package className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl">My Products</h2>
                <p className="text-muted-foreground text-sm">Manage your listings</p>
              </div>
            </div>

            {productsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : !myProducts?.length ? (
              <div className="text-center py-8 text-muted-foreground">
                You haven't posted any products yet
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {myProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary/80 transition-all"
                  >
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.title}
                        className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.title}</p>
                      <p className="text-sm text-muted-foreground">{product.price} · {getCountryName(product.country)}</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-primary/10 text-primary"
                        onClick={() => setEditProduct(product)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl hover:bg-destructive/10 text-destructive"
                        onClick={() => setDeleteProductId(product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Language */}
        <section className="glass rounded-3xl p-8 space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button">
              <Globe className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">{t("language")}</h2>
              <p className="text-muted-foreground text-sm">{t("select_language")}</p>
            </div>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("search_language")}
              value={langSearch}
              onChange={(e) => setLangSearch(e.target.value)}
              className="pl-11 h-11 bg-secondary/50 border-0 rounded-xl"
            />
          </div>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {filteredLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  language === lang.code
                    ? "bg-gradient-primary text-primary-foreground shadow-button"
                    : "hover:bg-secondary/80 text-foreground"
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="font-medium flex-1">{lang.name}</span>
                {language === lang.code && <Check className="w-5 h-5" />}
              </button>
            ))}
          </div>
        </section>

        {/* Preferred Country */}
        <section className="glass rounded-3xl p-8 space-y-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button">
              <MapPin className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">{t("preferred_country")}</h2>
              <p className="text-muted-foreground text-sm">{t("select_country")}</p>
            </div>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={t("search_country")}
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              className="pl-11 h-11 bg-secondary/50 border-0 rounded-xl"
            />
          </div>
          <div className="max-h-72 overflow-y-auto space-y-1">
            <button
              onClick={() => setPreferredCountry(null)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                !preferredCountry
                  ? "bg-gradient-primary text-primary-foreground shadow-button"
                  : "hover:bg-secondary/80 text-foreground"
              }`}
            >
              <Globe className="w-5 h-5" />
              <span className="font-medium flex-1">{t("all_countries")}</span>
              {!preferredCountry && <Check className="w-5 h-5" />}
            </button>
            {filteredCountries.map((c) => (
              <button
                key={c.code}
                onClick={() => setPreferredCountry(c.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  preferredCountry === c.code
                    ? "bg-gradient-primary text-primary-foreground shadow-button"
                    : "hover:bg-secondary/80 text-foreground"
                }`}
              >
                <span className="text-xl">{c.flag}</span>
                <span className="font-medium flex-1">{c.name}</span>
                {preferredCountry === c.code && <Check className="w-5 h-5" />}
              </button>
            ))}
          </div>
        </section>

        {/* Appearance */}
        <section className="glass rounded-3xl p-8 space-y-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button">
              <Moon className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">{t("appearance")}</h2>
              <p className="text-muted-foreground text-sm">{t("customize_look")}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {([
              { value: "light", icon: Sun, label: "Light" },
              { value: "dark", icon: Moon, label: "Dark" },
            ] as const).map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                  theme === opt.value
                    ? "bg-gradient-primary text-primary-foreground shadow-button"
                    : "bg-secondary/50 hover:bg-secondary/80 text-foreground"
                }`}
              >
                <opt.icon className="w-6 h-6" />
                <span className="font-medium text-sm">{opt.label}</span>
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Edit Modal */}
      <EditProductModal
        open={!!editProduct}
        onClose={() => setEditProduct(null)}
        product={editProduct}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Settings;
