import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useSavedProducts = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["saved-products", user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: favorites, error: favoritesError } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (favoritesError) throw favoritesError;

      const productIds = (favorites || []).map((item) => item.product_id);
      if (!productIds.length) return [];

      const { data: products, error: productsError } = await supabase
        .from("products_public")
        .select("id, user_id, title, description, price, category, country, image_url, media_urls, status, created_at, updated_at")
        .in("id", productIds);

      if (productsError) throw productsError;

      const productMap = new Map((products || []).map((item) => [item.id, item]));
      return productIds.map((productId) => productMap.get(productId)).filter(Boolean);
    },
    enabled: !!user,
  });
};