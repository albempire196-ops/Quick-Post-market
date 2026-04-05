import { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { SkeletonGrid } from "@/components/SkeletonCard";
import { AddProductModal } from "@/components/AddProductModal";
import AddWorkerModal from "@/components/AddWorkerModal";
import { AuthPromptModal } from "@/components/AuthPromptModal";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { Filters } from "@/components/Filters";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Package, ArrowRight, SlidersHorizontal, Hotel, Building2, CarFront, Wrench, ShoppingBag } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useProducts } from "@/hooks/useProducts";
import { useCountryNames } from "@/hooks/useCountryNames";
import { extractNumericPrice, ProductSort } from "@/lib/marketplace";
import { parseListingMeta } from "@/lib/listingMeta";

const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddWorkerModal, setShowAddWorkerModal] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [selectedCountry] = useState<string>("al");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<ProductSort>("newest");
  const [minGuests, setMinGuests] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("");
  const [minRating, setMinRating] = useState("any");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const { data: products = [], isLoading } = useProducts();
  const getCountryName = useCountryNames();

  const categoryMap: Record<string, string> = {
    hotels: "Hotels & Stays",
    house_rent: "House Rental",
    house_buy: "House for Sale",
    car_rent: "Car Rental",
    vehicles: "Vehicles",
    electronics: "Electronics",
    clothing: "Clothing",
    furniture: "Furniture",
    services: "Services",
    sports: "Sports",
    books: "Books",
    art: "Art & Crafts",
    other: "Other",
  };

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesSearch = product.title?.toLowerCase().includes(debouncedSearch.toLowerCase());
    const mappedCategory = categoryMap[selectedCategory];
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory || product.category === mappedCategory;
    const matchesStatus = selectedStatus === "all" || product.status === selectedStatus;

    const numericPrice = extractNumericPrice(product.price);
    const minPriceNumber = minPrice ? Number(minPrice) : null;
    const maxPriceNumber = maxPrice ? Number(maxPrice) : null;
    const matchesMinPrice = minPriceNumber === null || minPriceNumber <= 0 || (numericPrice !== null && numericPrice >= minPriceNumber);
    const matchesMaxPrice = maxPriceNumber === null || maxPriceNumber <= 0 || (numericPrice !== null && numericPrice <= maxPriceNumber);

    let matchesMeta = true;
    const minGuestsNum = minGuests ? Number(minGuests) : 0;
    const minBedroomsNum = minBedrooms ? Number(minBedrooms) : 0;
    const minRatingNum = minRating !== "any" ? Number(minRating) : 0;
    if (minGuestsNum > 0 || minBedroomsNum > 0 || minRatingNum > 0) {
      const meta = parseListingMeta(product.description || "");
      if (meta.meta) {
        if (minGuestsNum > 0 && (meta.meta.guests || 0) < minGuestsNum) matchesMeta = false;
        if (minBedroomsNum > 0 && (meta.meta.bedrooms || 0) < minBedroomsNum) matchesMeta = false;
        if (minRatingNum > 0 && (meta.meta.starRating || 0) < minRatingNum) matchesMeta = false;
      } else if (minGuestsNum > 0 || minBedroomsNum > 0 || minRatingNum > 0) {
        matchesMeta = false;
      }
    }

    return matchesSearch && matchesCategory && matchesStatus && matchesMinPrice && matchesMaxPrice && matchesMeta;
  }).sort((leftProduct, rightProduct) => {
    if (sortBy === "oldest") {
      return new Date(leftProduct.created_at || 0).getTime() - new Date(rightProduct.created_at || 0).getTime();
    }
    if (sortBy === "price-asc") {
      return (extractNumericPrice(leftProduct.price) ?? Number.MAX_SAFE_INTEGER) - (extractNumericPrice(rightProduct.price) ?? Number.MAX_SAFE_INTEGER);
    }
    if (sortBy === "price-desc") {
      return (extractNumericPrice(rightProduct.price) ?? -1) - (extractNumericPrice(leftProduct.price) ?? -1);
    }
    return new Date(rightProduct.created_at || 0).getTime() - new Date(leftProduct.created_at || 0).getTime();
  }), [products, debouncedSearch, selectedCategory, selectedStatus, minPrice, maxPrice, sortBy, minGuests, minBedrooms, minRating]);

  const handlePostProduct = () => {
    if (!user) {
      setShowAuthPrompt(true);
    } else {
      setShowAddModal(true);
    }
  };

  const handleAddWorker = () => {
    if (!user) {
      setShowAuthPrompt(true);
    } else {
      setShowAddWorkerModal(true);
    }
  };

  const quickCategories = [
    { icon: Hotel, label: "Hotels", color: "from-blue-500 to-cyan-500", category: "hotels" },
    { icon: Building2, label: "Houses", color: "from-emerald-500 to-teal-500", category: "house_rent" },
    { icon: CarFront, label: "Cars", color: "from-amber-500 to-orange-500", category: "car_rent" },
    { icon: ShoppingBag, label: "Products", color: "from-violet-500 to-purple-500", category: "all" },
    { icon: Wrench, label: "Services", color: "from-rose-500 to-pink-500", category: "services" },
  ];

  const resetFilters = () => {
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("newest");
    setMinGuests("");
    setMinBedrooms("");
    setMinRating("any");
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden page-enter">
      <div className="fixed inset-0 mesh-gradient opacity-90 pointer-events-none" />
      
      {/* Ambient glow orbs */}
      <div className="fixed top-[-15%] left-[5%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[180px] pointer-events-none animate-float-slow" />
      <div className="fixed top-[25%] right-[-10%] w-[600px] h-[600px] bg-accent/15 rounded-full blur-[140px] pointer-events-none animate-float-slow" style={{ animationDelay: '2s' }} />
      <div className="fixed bottom-[-15%] left-[25%] w-[700px] h-[700px] bg-[hsl(280,80%,65%)]/12 rounded-full blur-[160px] pointer-events-none animate-float-slow" style={{ animationDelay: '4s' }} />
      
      <AuthPromptModal open={showAuthPrompt} onClose={() => setShowAuthPrompt(false)} />

      <Header
        onAddProduct={handlePostProduct}
        onAddWorker={handleAddWorker}
        onSignIn={() => setShowAuthPrompt(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Quick category bar */}
      <div className="sticky top-[60px] sm:top-[68px] z-40 glass-strong border-b border-border/20">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`shrink-0 flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-premium ${
                selectedCategory === "all"
                  ? "bg-primary text-primary-foreground shadow-button"
                  : "glass hover:bg-secondary/60 text-muted-foreground hover:text-foreground"
              }`}
            >
              All
            </button>
            {quickCategories.map((cat) => (
              <button
                key={cat.category}
                onClick={() => setSelectedCategory(cat.category)}
                className={`shrink-0 group/pill pill-aura flex items-center gap-2 rounded-2xl px-4 py-2.5 transition-all duration-300 ease-premium border ${
                  selectedCategory === cat.category
                    ? "bg-primary/10 border-primary/30 text-foreground shadow-sm"
                    : "glass border-transparent hover:border-primary/20 text-muted-foreground hover:text-foreground"
                }`}
                style={{ '--pill-color': `hsl(var(--primary) / 0.08)` } as React.CSSProperties}
              >
                <div className={`w-7 h-7 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center shadow-sm`}>
                  <cat.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="relative py-8 sm:py-12 section-aura-alt">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Desktop Filters */}
            <aside className="hidden lg:block lg:w-72 shrink-0">
              <div className="lg:sticky lg:top-[140px]">
                <Filters
                  selectedCategory={selectedCategory}
                  selectedStatus={selectedStatus}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  sortBy={sortBy}
                  minGuests={minGuests}
                  minBedrooms={minBedrooms}
                  minRating={minRating}
                  onCategoryChange={setSelectedCategory}
                  onStatusChange={setSelectedStatus}
                  onMinPriceChange={setMinPrice}
                  onMaxPriceChange={setMaxPrice}
                  onSortChange={setSortBy}
                  onMinGuestsChange={setMinGuests}
                  onMinBedroomsChange={setMinBedrooms}
                  onMinRatingChange={setMinRating}
                  onReset={resetFilters}
                />
              </div>
            </aside>

            <div className="flex-1">
              {/* Dashboard header */}
              <div className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight">
                    {t("discover_products")}
                  </h1>
                  <p className="text-muted-foreground mt-2 text-sm sm:text-base flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-0.5 rounded-full text-xs font-semibold">
                      {filteredProducts.length}
                    </span>
                    {t("products_available")}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Mobile Filter Button */}
                  <Sheet>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="sm" className="lg:hidden gap-2 rounded-2xl btn-secondary-premium">
                        <SlidersHorizontal className="w-4 h-4" />
                        {t("filters")}
                      </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-80 p-0 frosted-overlay bg-card/95 border-r border-border/30">
                      <SheetTitle className="sr-only">{t("filters")}</SheetTitle>
                      <div className="p-5">
                        <Filters
                          selectedCategory={selectedCategory}
                          selectedStatus={selectedStatus}
                          minPrice={minPrice}
                          maxPrice={maxPrice}
                          sortBy={sortBy}
                          minGuests={minGuests}
                          minBedrooms={minBedrooms}
                          minRating={minRating}
                          onCategoryChange={setSelectedCategory}
                          onStatusChange={setSelectedStatus}
                          onMinPriceChange={setMinPrice}
                          onMaxPriceChange={setMaxPrice}
                          onSortChange={setSortBy}
                          onMinGuestsChange={setMinGuests}
                          onMinBedroomsChange={setMinBedrooms}
                          onMinRatingChange={setMinRating}
                          onReset={resetFilters}
                        />
                      </div>
                    </SheetContent>
                  </Sheet>

                  <Button
                    onClick={handlePostProduct}
                    className="gap-2 font-semibold btn-premium"
                  >
                    <span className="btn-shine" />
                    {t("post_product")}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Product grid */}
              {isLoading ? (
                <SkeletonGrid count={6} />
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-24 sm:py-32 liquid-glass rounded-[2rem] px-8 relative overflow-hidden">
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-[60px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-accent/15 rounded-full blur-[80px]" />
                  </div>
                  <div className="relative">
                    <div className="inline-flex p-8 rounded-3xl bg-gradient-to-br from-primary/15 to-primary/5 mb-8 animate-float border border-primary/10">
                      <Package className="w-14 h-14 sm:w-16 sm:h-16 text-primary" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-display font-bold mb-4">{t("no_products")}</h3>
                    <p className="text-base sm:text-lg text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
                      {t("no_products_desc")}
                    </p>
                    <Button
                      onClick={handlePostProduct}
                      size="lg"
                      className="h-14 px-10 text-base font-semibold btn-premium group pulse-ring"
                    >
                      <span className="btn-shine" />
                      {t("post_first_product")}
                      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform duration-300 ease-premium" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 stagger-children">
                  {filteredProducts.map((product) => (
                    <div key={product.id}>
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
                        status={product.status || undefined}
                        description={product.description}
                        onClick={() => setSelectedProduct(product)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <AddProductModal open={showAddModal} onClose={() => setShowAddModal(false)} country={selectedCountry} />
      <AddWorkerModal open={showAddWorkerModal} onClose={() => setShowAddWorkerModal(false)} />
      
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

export default Dashboard;
