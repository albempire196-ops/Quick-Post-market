import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "next-themes";
import { useColorTheme, COLOR_THEMES } from "@/contexts/ColorThemeContext";
import { QuickGuideModal } from "@/components/QuickGuideModal";
import { ArrowLeft, LogOut, User, Sparkles, Moon, Sun, Globe, MapPin, Search, Check, Package, Pencil, Trash2, BookOpen, Download } from "lucide-react";
import { countries } from "@/data/countries";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { useMyProducts } from "@/hooks/useMyProducts";
import { EditProductModal } from "@/components/EditProductModal";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useSavedProducts } from "@/hooks/useSavedProducts";
import { useAdminReports } from "@/hooks/useAdminReports";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { ProductStatusBadge } from "@/components/ProductStatusBadge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { deleteProductWithMedia } from "@/lib/productDeletion";
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
import { ProductStatus } from "@/lib/marketplace";

const Settings = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const { colorTheme, setColorTheme } = useColorTheme();
  const [showGuide, setShowGuide] = useState(false);
  const { preferredCountry, setPreferredCountry, t } = useLanguage();
  const [countrySearch, setCountrySearch] = useState("");
  const { data: myProducts, isLoading: productsLoading } = useMyProducts();
  const { data: savedProducts, isLoading: savedProductsLoading } = useSavedProducts();
  const { data: adminReports, isLoading: reportsLoading, isAdmin, updateReportStatus, deleteReportedProduct } = useAdminReports();
  const [editProduct, setEditProduct] = useState<any>(null);
  const [selectedSavedProduct, setSelectedSavedProduct] = useState<any>(null);
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const [sellerName, setSellerName] = useState("");
  const [editingSellerName, setEditingSellerName] = useState(false);
  const [sellerNameDraft, setSellerNameDraft] = useState("");
  const [savingSellerName, setSavingSellerName] = useState(false);
  const { canInstall, isInstalled, install } = usePWAInstall();
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const name = data?.full_name?.trim() || "";
        setSellerName(name);
      });
  }, [user]);

  const handleSaveSellerName = async () => {
    if (!user || !sellerNameDraft.trim()) return;
    setSavingSellerName(true);
    try {
      const { error } = await supabase.from("profiles").upsert(
        { id: user.id, email: user.email ?? null, full_name: sellerNameDraft.trim() },
        { onConflict: "id" }
      );
      if (error) throw error;
      await supabase.auth.updateUser({ data: { ...user.user_metadata, full_name: sellerNameDraft.trim(), name: sellerNameDraft.trim() } });
      setSellerName(sellerNameDraft.trim());
      setEditingSellerName(false);
      toast.success("Seller name updated.");
    } catch {
      toast.error("Could not update seller name.");
    } finally {
      setSavingSellerName(false);
    }
  };

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
      const productToDelete = myProducts?.find((product) => product.id === deleteProductId);
      if (!productToDelete) throw new Error("Product not found.");

      await deleteProductWithMedia({
        id: productToDelete.id,
        image_url: productToDelete.image_url,
        media_urls: Array.isArray(productToDelete.media_urls) ? (productToDelete.media_urls as string[]) : null,
      });

      toast.success("Product deleted");
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["saved-products", user?.id] });
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    } finally {
      setDeleteProductId(null);
    }
  };

  const handleStatusChange = async (productId: string, status: ProductStatus) => {
    try {
      const { error } = await supabase.from("products").update({ status }).eq("id", productId);
      if (error) throw error;
      toast.success("Product status updated.");
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["saved-products", user?.id] });
    } catch (error) {
      console.error(error);
      toast.error("Failed to update product status.");
    }
  };

  const handleDownloadApp = async () => {
    if (!canInstall) {
      const ua = typeof navigator !== "undefined" ? navigator.userAgent.toLowerCase() : "";
      const isFirefox = ua.includes("firefox");
      if (isFirefox) {
        toast("Firefox doesn't support the automatic install prompt. To install: open the browser menu (⋯) and choose 'Install site as app' or on mobile use 'Add to Home screen'.");
      } else {
        toast("Your browser doesn't support the automatic install prompt. Try opening the browser menu and look for an 'Install' or 'Add to Home screen' option, or use Chrome/Edge for the native prompt.");
      }
      return;
    }

    setIsInstalling(true);
    try {
      const success = await install();
      if (success) {
        toast.success("App installed successfully!");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to install app.");
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 mesh-gradient opacity-80 pointer-events-none" />
      <div className="fixed top-1/3 right-1/4 w-[500px] h-[500px] bg-primary/12 rounded-full blur-[140px] pointer-events-none animate-float-slow" />
      <div className="fixed bottom-1/4 left-1/3 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[120px] pointer-events-none animate-float" />

      <header className="sticky top-0 z-50 liquid-glass">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl btn-ghost-premium">
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

      <main className="relative container mx-auto px-6 py-10 max-w-2xl space-y-8 section-aura">
        {/* Profile */}
        {user && (
          <section className="liquid-glass rounded-[2rem] p-8 space-y-6 animate-fade-in">
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
              onClick={() => navigate(`/seller/${user.id}`)}
              className="w-full gap-2 h-12 rounded-2xl btn-secondary-premium"
            >
              <User className="w-5 h-5" />
              View my seller profile
            </Button>

            {/* Seller name */}
            {editingSellerName ? (
              <div className="flex gap-2">
                <Input
                  value={sellerNameDraft}
                  onChange={(e) => setSellerNameDraft(e.target.value)}
                  maxLength={50}
                  placeholder="Seller name"
                  className="h-11 rounded-xl"
                  autoFocus
                />
                <Button
                  className="h-11 rounded-xl px-4"
                  disabled={savingSellerName || !sellerNameDraft.trim()}
                  onClick={() => void handleSaveSellerName()}
                >
                  {savingSellerName ? "Saving..." : "Save"}
                </Button>
                <Button
                  variant="ghost"
                  className="h-11 rounded-xl px-3"
                  onClick={() => setEditingSellerName(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => { setSellerNameDraft(sellerName); setEditingSellerName(true); }}
                className="w-full gap-2 h-12 rounded-2xl"
              >
                <Pencil className="w-4 h-4" />
                {sellerName ? `Change seller name (${sellerName})` : "Set seller name"}
              </Button>
            )}
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
          <section className="liquid-glass rounded-[2rem] p-8 space-y-6 animate-fade-in" style={{ animationDelay: "0.05s" }}>
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
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">{product.price} · {getCountryName(product.country)}</p>
                        <ProductStatusBadge status={product.status} />
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0 items-center">
                      <Select value={product.status || "available"} onValueChange={(value) => void handleStatusChange(product.id, value as ProductStatus)}>
                        <SelectTrigger className="w-32 rounded-xl bg-background">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                        </SelectContent>
                      </Select>
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

        {user && (
          <section className="liquid-glass rounded-[2rem] p-8 space-y-6 animate-fade-in" style={{ animationDelay: "0.08s" }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button">
                <Package className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl">Saved Products</h2>
                <p className="text-muted-foreground text-sm">Products you bookmarked for later.</p>
              </div>
            </div>

            {savedProductsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading saved products...</div>
            ) : !savedProducts?.length ? (
              <div className="text-center py-8 text-muted-foreground">You have no saved products yet.</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {savedProducts.map((product: any) => (
                  <button
                    key={product.id}
                    onClick={() => setSelectedSavedProduct(product)}
                    className="w-full flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary/80 transition-all text-left"
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
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <p className="text-sm text-muted-foreground">{product.price} · {getCountryName(product.country)}</p>
                        <ProductStatusBadge status={product.status} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {user && isAdmin && (
          <section className="liquid-glass rounded-[2rem] p-8 space-y-6 animate-fade-in" style={{ animationDelay: "0.09s" }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button">
                <Sparkles className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl">Admin Reports</h2>
                <p className="text-muted-foreground text-sm">Review flagged products and moderate listings.</p>
              </div>
            </div>

            {reportsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading reports...</div>
            ) : !adminReports?.length ? (
              <div className="text-center py-8 text-muted-foreground">No reports in queue.</div>
            ) : (
              <div className="space-y-4 max-h-[32rem] overflow-y-auto">
                {adminReports.map((report: any) => (
                  <div key={report.id} className="rounded-2xl border border-border/50 p-4 space-y-3 bg-secondary/30">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div>
                        <p className="font-semibold">{report.product?.title || "Unknown product"}</p>
                        <p className="text-sm text-muted-foreground">
                          Reported by {report.reporter?.full_name || report.reporter_id} · {new Date(report.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <ProductStatusBadge status={report.product?.status} />
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{report.status}</span>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm font-medium">Reason: {report.reason}</p>
                      {report.details && <p className="text-sm text-muted-foreground">{report.details}</p>}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => void updateReportStatus(report.id, "reviewed")}>Mark reviewed</Button>
                      <Button size="sm" variant="outline" onClick={() => void updateReportStatus(report.id, "resolved")}>Resolve</Button>
                      {report.product?.id && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => void deleteReportedProduct({
                            id: report.product.id,
                            image_url: report.product.image_url,
                            media_urls: Array.isArray(report.product.media_urls) ? (report.product.media_urls as string[]) : null,
                          })}
                        >
                          Delete product
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Preferred Country */}
        <section className="liquid-glass rounded-[2rem] p-8 space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
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
        <section className="liquid-glass rounded-[2rem] p-8 space-y-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button">
              <Moon className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">{t("appearance")}</h2>
              <p className="text-muted-foreground text-sm">{t("customize_look")}</p>
            </div>
          </div>

          {/* Dark / Light */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Mode</p>
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
          </div>

          {/* Color theme */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-3">Accent Color</p>
            <div className="flex flex-wrap gap-3">
              {COLOR_THEMES.map((ct) => (
                <button
                  key={ct.value}
                  onClick={() => setColorTheme(ct.value)}
                  title={ct.label}
                  className={`relative w-10 h-10 rounded-full transition-all hover:scale-110 ${
                    colorTheme === ct.value ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""
                  }`}
                  style={{ background: ct.color }}
                >
                  {colorTheme === ct.value && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <Check className="w-4 h-4 text-white drop-shadow" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Download App */}
        {!isInstalled && (
          <section className="liquid-glass rounded-[2rem] p-8 space-y-4 animate-fade-in" style={{ animationDelay: "0.32s" }}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button">
                <Download className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h2 className="font-display font-bold text-xl">Download App</h2>
                <p className="text-muted-foreground text-sm">Install Quick Post Market on your device</p>
              </div>
            </div>
            <Button 
              className="w-full gap-2 h-12 rounded-2xl bg-gradient-primary hover:bg-gradient-primary/90 text-primary-foreground shadow-button"
              onClick={handleDownloadApp}
              disabled={isInstalling}
            >
              <Download className="w-5 h-5" />
              {isInstalling ? "Installing..." : canInstall ? "Download App" : "Install / How to"}
            </Button>
          </section>
        )}

        {/* Quick Guide */}
        <section className="liquid-glass rounded-[2rem] p-8 space-y-4 animate-fade-in" style={{ animationDelay: "0.35s" }}>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button">
              <BookOpen className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl">Quick Guide</h2>
              <p className="text-muted-foreground text-sm">How to use the marketplace</p>
            </div>
          </div>
          <Button variant="outline" className="w-full gap-2 h-12 rounded-2xl" onClick={() => setShowGuide(true)}>
            <BookOpen className="w-5 h-5" />
            Open Guide
          </Button>
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

      <ProductDetailModal
        open={!!selectedSavedProduct}
        onClose={() => setSelectedSavedProduct(null)}
        product={selectedSavedProduct ? {
          ...selectedSavedProduct,
          media_urls: selectedSavedProduct.media_urls as string[] | null,
        } : null}
        countryName={selectedSavedProduct?.country ? getCountryName(selectedSavedProduct.country) : undefined}
      />

      <QuickGuideModal open={showGuide} onClose={() => setShowGuide(false)} />
    </div>
  );
};

export default Settings;
