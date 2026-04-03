import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { AddProductModal } from "@/components/AddProductModal";
import { AuthPromptModal } from "@/components/AuthPromptModal";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { Filters } from "@/components/Filters";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import heroImage from "@/assets/home-interior.jpg";
import { Package, ArrowRight, Zap, Shield, Globe, SlidersHorizontal } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProducts } from "@/hooks/useProducts";
import { useCountryNames } from "@/hooks/useCountryNames";

const Index = () => {
  const { user } = useAuth();
  const { t, preferredCountry } = useLanguage();
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [selectedCountry] = useState<string>("al");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { data: products = [] } = useProducts();
  const getCountryName = useCountryNames();

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    const matchesCountry = !preferredCountry || product.country === preferredCountry;
    return matchesSearch && matchesCategory && matchesCountry;
  });

  const handlePostProduct = () => {
    if (!user) {
      setShowAuthPrompt(true);
    } else {
      setShowAddModal(true);
    }
  };

  const features = [
    { icon: Zap, title: t("fast_listing"), desc: t("fast_listing_desc") },
    { icon: Shield, title: t("secure_transactions"), desc: t("secure_transactions_desc") },
    { icon: Globe, title: t("global_reach"), desc: t("global_reach_desc") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 mesh-gradient opacity-60 pointer-events-none" />
      
      <AuthPromptModal open={showAuthPrompt} onClose={() => setShowAuthPrompt(false)} />

      <Header
        onAddProduct={handlePostProduct}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Hero Section */}
      <section className="relative min-h-[400px] sm:min-h-[500px] lg:min-h-[600px] overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Home interior" className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/95 to-background/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        
        <div className="relative container mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-32">
          <div className="max-w-2xl space-y-5 sm:space-y-8">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-[1.1] animate-fade-in" style={{ animationDelay: '0.2s' }}>
              {t("hero_title_1")}{" "}
              <span className="text-gradient">{t("hero_title_2")}</span>
              <br />{t("hero_title_3")}
            </h1>
            
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground leading-relaxed animate-fade-in" style={{ animationDelay: '0.3s' }}>
              {t("hero_subtitle")}
            </p>
            
            <div className="flex flex-wrap gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button 
                onClick={handlePostProduct} 
                size="lg" 
                className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base font-semibold bg-gradient-primary hover:opacity-90 shadow-button rounded-2xl group"
              >
                {t("list_product")}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-10 sm:py-16 border-y border-border/50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, i) => (
              <div key={feature.title} className="flex items-center gap-3 sm:gap-4 animate-fade-in" style={{ animationDelay: `${0.1 * i}s` }}>
                <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-button">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-base sm:text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="relative container mx-auto px-4 sm:px-6 py-8 sm:py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Desktop Filters */}
          <aside className="hidden lg:block lg:w-72 shrink-0">
            <div className="lg:sticky lg:top-28">
              <Filters
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                onReset={() => { setSelectedCategory("all"); setSearchQuery(""); }}
              />
            </div>
          </aside>

          <div className="flex-1">
            <div className="mb-6 sm:mb-10 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold">{t("discover_products")}</h2>
                <p className="text-muted-foreground mt-1 text-sm sm:text-base">{filteredProducts.length} {t("products_available")}</p>
              </div>

              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="lg:hidden gap-2 rounded-xl">
                    <SlidersHorizontal className="w-4 h-4" />
                    {t("filters")}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SheetTitle className="sr-only">{t("filters")}</SheetTitle>
                  <div className="p-4">
                    <Filters
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                      onReset={() => { setSelectedCategory("all"); setSearchQuery(""); }}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 sm:py-24 glass rounded-3xl px-4">
                <div className="inline-flex p-6 sm:p-8 rounded-3xl bg-gradient-primary/10 mb-6 sm:mb-8 animate-float">
                  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-primary" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-bold mb-3 sm:mb-4">{t("no_products")}</h3>
                <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-md mx-auto">
                  {t("no_products_desc")}
                </p>
                <Button 
                  onClick={handlePostProduct} 
                  size="lg" 
                  className="h-12 sm:h-14 px-8 sm:px-10 text-sm sm:text-base font-semibold bg-gradient-primary hover:opacity-90 shadow-button rounded-2xl group"
                >
                  {t("post_first_product")}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-8">
                {filteredProducts.map((product, i) => (
                  <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${0.05 * i}s` }}>
                    <ProductCard
                      id={product.id!}
                      title={product.title!}
                      price={product.price!}
                      image={product.image_url || "/placeholder.svg"}
                      location={product.country ? getCountryName(product.country) : "Global"}
                      category={product.category!}
                      rating={0}
                      reviewCount={0}
                      userId={product.user_id || undefined}
                      mediaUrls={Array.isArray(product.media_urls) ? (product.media_urls as string[]) : undefined}
                      onClick={() => setSelectedProduct(product)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <AddProductModal open={showAddModal} onClose={() => setShowAddModal(false)} country={selectedCountry} />
      
      <ProductDetailModal
        open={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        product={selectedProduct ? {
          ...selectedProduct,
          media_urls: selectedProduct.media_urls as string[] | null,
        } : null}
        countryName={selectedProduct?.country ? getCountryName(selectedProduct.country) : undefined}
      />
    </div>
  );
};

export default Index;
