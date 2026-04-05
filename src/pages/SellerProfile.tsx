import { useMemo, useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailModal } from "@/components/ProductDetailModal";
import { supabase } from "@/integrations/supabase/client";
import { useCountryNames } from "@/hooks/useCountryNames";
import { useAuth } from "@/contexts/AuthContext";


const SellerProfile = () => {
  const navigate = useNavigate();
  const { sellerId } = useParams();
  const getCountryName = useCountryNames();
  const { user } = useAuth();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);


  // No social links or description state
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["seller-profile", sellerId],
    queryFn: async () => {
      if (!sellerId) return null;

      const { data: products, error: productsError } = await supabase
        .from("products_public")
        .select("id, user_id, title, description, price, category, country, image_url, media_urls, status, created_at, updated_at")
        .eq("user_id", sellerId)
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      const productIds = (products || []).map((product) => product.id).filter(Boolean);

      // Merr profile dhe klientët e interesuar me gmail
      const [profileResult, favoritesResult] = await Promise.all([
        supabase.from("profiles_public").select("id, full_name, avatar_url, created_at, facebook, instagram, linkedin, tiktok, twitter, website, email").eq("id", sellerId).maybeSingle(),
        productIds.length
          ? supabase
              .from("favorites")
              .select("user_id")
              .in("product_id", productIds)
          : Promise.resolve({ data: [], error: null } as any),
      ]);

      const profile = profileResult.data || null;
      const favorites = favoritesResult.data || [];

      // Merr emailet e përdoruesve që kanë bërë interested in
      let gmailUsers = new Set();
      if (favorites.length > 0) {
        // Merr profilet për të gjithë user_id unik
        const userIds = Array.from(new Set(favorites.map((fav: any) => fav.user_id))) as string[];
        if (userIds.length > 0) {
          const { data: interestedProfiles } = await supabase
            .from("profiles_public")
            .select("id, email")
            .in("id", userIds);
          for (const p of interestedProfiles || []) {
            if (p.email && p.email.includes("@gmail.com")) {
              gmailUsers.add(p.id);
            }
          }
        }
      }

      return {
        profile,
        products: products || [],
        stats: {
          interestedClients: gmailUsers.size,
          favorites: favorites.length,
        },
      };
    },
    enabled: !!sellerId,
  });

  // Update sellerDescription state when profile loads
  // No effect for social links or description

  const joinedDate = useMemo(() => {
    if (!data?.profile?.created_at) return null;
    return new Date(data.profile.created_at).toLocaleDateString();
  }, [data?.profile?.created_at]);

  const initials = data?.profile?.full_name
    ? data.profile.full_name.slice(0, 2).toUpperCase()
    : "SP";

  const isOwnProfile = !!user && !!sellerId && user.id === sellerId;

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 mesh-gradient opacity-80 pointer-events-none" />
      <div className="fixed top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/12 rounded-full blur-[140px] pointer-events-none animate-float-slow" />

      <header className="sticky top-0 z-50 liquid-glass">
        <div className="container mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-xl btn-ghost-premium btn-ghost-premium">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-bold text-xl">{isOwnProfile ? "My seller profile" : "Seller profile"}</h1>
        </div>
      </header>

      <main className="relative container mx-auto px-4 sm:px-6 py-8 space-y-8 section-aura section-aura">
        <section className="liquid-glass card-glow card-glow rounded-[2rem] p-6 sm:p-8">
          {isLoading ? (
            <div className="text-muted-foreground">Loading seller profile...</div>
          ) : data ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <Avatar className="w-20 h-20 rounded-3xl ring-2 ring-border">
                <AvatarImage src={data.profile?.avatar_url || undefined} alt={data.profile?.full_name || "Seller"} />
                <AvatarFallback className="text-xl bg-secondary">{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-3">
                  <UserRound className="w-5 h-5 text-muted-foreground" />
                  <h2 className="font-display font-bold text-2xl">{data.profile?.full_name || "-"}</h2>
                  {data.profile?.email && (
                    <span className="ml-2 text-muted-foreground text-sm">{data.profile.email}</span>
                  )}
                  {!isOwnProfile && data.profile?.email && (
                    <Button size="sm" variant="outline" className="ml-2 btn-secondary-premium btn-secondary-premium" onClick={() => window.open(`mailto:${data.profile?.email}`)}>
                      Email seller
                    </Button>
                  )}
                  {!isOwnProfile && (
                    <Button size="sm" variant="destructive" className="ml-2" onClick={() => alert('Report seller feature coming soon!')}>
                      Report seller
                    </Button>
                  )}
                </div>
                {/* No social links or description section */}

              </div>
            </div>
          ) : (
            <div className="text-muted-foreground">Seller not found.</div>
          )}
        </section>

        <section className="space-y-4">
          <div>
            <h3 className="font-display font-bold text-2xl">Listings</h3>
            <p className="text-muted-foreground">{isOwnProfile ? "Browse your current public listings." : "Browse everything this seller currently has available."}</p>
          </div>

          {!data?.products?.length ? (
            <div className="liquid-glass rounded-[2rem] p-8 text-muted-foreground">This seller has no active listings.</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-8">
              {data.products
                .filter((product) => product.category?.toLowerCase() !== "music")
                .map((product, index) => (
                  <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.04}s` }}>
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
                      onClick={() => setSelectedProduct(product)}
                    />
                  </div>
                ))}
            </div>
          )}
        </section>
      </main>
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

export default SellerProfile;