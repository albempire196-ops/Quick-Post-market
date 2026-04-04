import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageCircle, ChevronLeft, ChevronRight, X, Heart, Flag, UserRound } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProductStatusBadge } from "@/components/ProductStatusBadge";
// import { useFavorites } from "@/hooks/useFavorites";
// import { toast } from "sonner";
import { ReportProductDialog } from "@/components/ReportProductDialog";

interface ProductDetailModalProps {
  open: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price: string;
    description?: string | null;
    category: string;
    country?: string | null;
    image_url?: string | null;
    media_urls?: string[] | null;
    status?: string | null;
    user_id?: string | null;
  } | null;
  countryName?: string;
}

export const ProductDetailModal = ({ open, onClose, product, countryName }: ProductDetailModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [sellerProfile, setSellerProfile] = useState<{
    full_name: string | null;
    avatar_url: string | null;
    facebook?: string | null;
    instagram?: string | null;
    linkedin?: string | null;
    tiktok?: string | null;
    twitter?: string | null;
    website?: string | null;
  } | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  // const { isFavorite, toggleFavorite, busyProductId } = useFavorites();

  // Get all media URLs
  const allMedia: string[] = [];
  if (product) {
    if (product.media_urls && Array.isArray(product.media_urls) && product.media_urls.length > 0) {
      allMedia.push(...product.media_urls);
    } else if (product.image_url) {
      allMedia.push(product.image_url);
    }
  }

  useEffect(() => {
    if (open && product) {
      setCurrentMediaIndex(0);
    }
  }, [open, product?.id]);

  useEffect(() => {
    if (!product?.user_id) {
      setSellerProfile(null);
      return;
    }
    supabase
      .from("profiles_public")
      .select("full_name, avatar_url, facebook, instagram, linkedin, tiktok, twitter, website")
      .eq("id", product.user_id)
      .single()
      .then(({ data }) => {
        setSellerProfile(data || null);
      });
  }, [product?.user_id]);

  const isVideo = (url: string) => {
    return /\.(mp4|webm|mov|quicktime)(\?|$)/i.test(url) || url.includes("video");
  };

  const isOwner = user && product?.user_id && user.id === product.user_id;

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl">
        <>
            {/* Media Section */}
            <div className="relative bg-secondary/30 min-h-[250px] sm:min-h-[400px]">
              {allMedia.length > 0 ? (
                <>
                  {isVideo(allMedia[currentMediaIndex]) ? (
                    <video
                      src={allMedia[currentMediaIndex]}
                      controls
                      autoPlay
                      className="w-full h-full object-contain max-h-[70vh] min-h-[250px] sm:min-h-[400px]"
                    />
                  ) : (
                    <img
                      src={allMedia[currentMediaIndex]}
                      alt={product.title}
                      className="w-full h-full object-contain max-h-[70vh] min-h-[250px] sm:min-h-[400px]"
                    />
                  )}

                  {/* Navigation arrows */}
                  {allMedia.length > 1 && (
                    <>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full glass-strong h-9 w-9"
                        onClick={() => setCurrentMediaIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1))}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full glass-strong h-9 w-9"
                        onClick={() => setCurrentMediaIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1))}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>

                      {/* Dots indicator */}
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {allMedia.map((_, i) => (
                          <button
                            key={i}
                            className={`w-2 h-2 rounded-full transition-all ${i === currentMediaIndex ? "bg-white scale-125" : "bg-white/50"}`}
                            onClick={() => setCurrentMediaIndex(i)}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                  Nuk ka media
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-xl sm:text-2xl font-display font-bold leading-tight">{product.title}</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{countryName || "Global"}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="secondary" className="shrink-0 rounded-lg">{product.category}</Badge>
                  <ProductStatusBadge status={product.status} />
                </div>
              </div>

              <div className="text-2xl sm:text-3xl font-display font-bold text-gradient">{product.price}</div>

              <div className="flex flex-col gap-2">
                {/* Seller info and socials */}
                <div className="flex items-center gap-2">
                  <UserRound className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">
                    {sellerProfile?.full_name || "-"}
                  </span>
                  {product.user_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-xl ml-2"
                      onClick={() => {
                        onClose();
                        navigate(`/seller/${product.user_id}`);
                      }}
                    >
                      Shiko profilin
                    </Button>
                  )}
                </div>
                {/* Social links */}
                {sellerProfile && (
                  <div className="flex flex-wrap gap-2 items-center">
                    {sellerProfile.facebook && (
                      <a href={sellerProfile.facebook} target="_blank" rel="noopener noreferrer" title="Facebook" className="text-blue-600 hover:underline">
                        <i className="fa-brands fa-facebook" /> Facebook
                      </a>
                    )}
                    {sellerProfile.instagram && (
                      <a href={sellerProfile.instagram} target="_blank" rel="noopener noreferrer" title="Instagram" className="text-pink-500 hover:underline">
                        <i className="fa-brands fa-instagram" /> Instagram
                      </a>
                    )}
                    {sellerProfile.linkedin && (
                      <a href={sellerProfile.linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="text-blue-700 hover:underline">
                        <i className="fa-brands fa-linkedin" /> LinkedIn
                      </a>
                    )}
                    {sellerProfile.tiktok && (
                      <a href={sellerProfile.tiktok} target="_blank" rel="noopener noreferrer" title="TikTok" className="text-black hover:underline">
                        <i className="fa-brands fa-tiktok" /> TikTok
                      </a>
                    )}
                    {sellerProfile.twitter && (
                      <a href={sellerProfile.twitter} target="_blank" rel="noopener noreferrer" title="Twitter" className="text-blue-400 hover:underline">
                        <i className="fa-brands fa-twitter" /> Twitter
                      </a>
                    )}
                    {sellerProfile.website && (
                      <a href={sellerProfile.website} target="_blank" rel="noopener noreferrer" title="Website" className="text-green-700 hover:underline">
                        <i className="fa-solid fa-globe" /> Website
                      </a>
                    )}
                  </div>
                )}
                {/* Hiq butonat e tjerë, lër vetëm emrin dhe rrjetet sociale */}
              </div>

              {product.description && (
                <div className="pt-3 border-t border-border/50">
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Interested in button removed */}
            </div>
          </>

      </DialogContent>

      {product && (
        <ReportProductDialog
          open={reportOpen}
          onOpenChange={setReportOpen}
          productId={product.id}
          productTitle={product.title}
          sellerId={product.user_id}
          sellerName={sellerProfile?.full_name}
        />
      )}
    </Dialog>
  );
};
