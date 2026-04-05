import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageCircle, ChevronLeft, ChevronRight, X, Heart, Flag, UserRound, Star, Bed, Bath, Users, Clock, ShieldCheck, Wifi, ParkingCircle, Waves, Wind, Utensils, Tv, DoorOpen, Mountain, Coffee, Car } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ProductStatusBadge } from "@/components/ProductStatusBadge";
import { ReportProductDialog } from "@/components/ReportProductDialog";
import { parseListingMeta, isHotelListing, isCarListing, AMENITY_LABELS } from "@/lib/listingMeta";
import { sanitizeUrl } from "@/lib/security";

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

  const { text: descriptionText, meta } = useMemo(
    () => parseListingMeta(product?.description),
    [product?.description]
  );
  const isHotel = isHotelListing(product?.category);
  const isCar = isCarListing(product?.category);

  const AMENITY_ICONS: Record<string, any> = {
    wifi: Wifi, parking: ParkingCircle, pool: Waves, ac: Wind,
    restaurant: Utensils, tv: Tv, balcony: DoorOpen, bathroom: Bath,
    view: Mountain, breakfast: Coffee, security: ShieldCheck, kitchen: Utensils,
  };

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
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-[2rem] border-border/15">
        <>
            {/* Media Section */}
            <div className="relative bg-secondary/20 min-h-[250px] sm:min-h-[400px] overflow-hidden">
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
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full glass-strong h-10 w-10 hover:scale-110 transition-transform duration-300"
                        onClick={() => setCurrentMediaIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1))}
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full glass-strong h-10 w-10 hover:scale-110 transition-transform duration-300"
                        onClick={() => setCurrentMediaIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1))}
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>

                      {/* Dots indicator */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass rounded-full px-3 py-1.5 flex gap-2">
                        {allMedia.map((_, i) => (
                          <button
                            key={i}
                            className={`rounded-full transition-all duration-300 ${i === currentMediaIndex ? "bg-white w-6 h-2" : "bg-white/40 w-2 h-2 hover:bg-white/60"}`}
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
            <div className="p-5 sm:p-8 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <h2 className="text-xl sm:text-2xl font-display font-bold leading-tight">{product.title}</h2>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary/60" />
                    <span>{meta?.address || countryName || "Global"}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant="secondary" className="shrink-0 rounded-xl px-3 py-1 bg-secondary/60">{product.category}</Badge>
                  <ProductStatusBadge status={product.status} />
                </div>
              </div>

              {/* Star rating for hotels */}
              {isHotel && meta?.stars && (
                <div className="flex items-center gap-1">
                  {[...Array(meta.stars)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">{meta.propertyType || "Property"}</span>
                </div>
              )}

              <div className="text-2xl sm:text-3xl font-display font-bold text-gradient animate-gradient bg-[length:200%_200%]">
                {product.price}
                {isHotel && <span className="text-base font-normal text-muted-foreground ml-1">/night</span>}
                {isCar && <span className="text-base font-normal text-muted-foreground ml-1">/day</span>}
              </div>

              {/* Hotel quick stats */}
              {isHotel && meta && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {meta.guests != null && (
                    <div className="flex items-center gap-2 frosted-pill rounded-xl px-3 py-2.5">
                      <Users className="w-4 h-4 text-primary" />
                      <div className="text-xs"><div className="font-semibold">{meta.guests}</div><div className="text-muted-foreground">Guests</div></div>
                    </div>
                  )}
                  {meta.bedrooms != null && (
                    <div className="flex items-center gap-2 frosted-pill rounded-xl px-3 py-2.5">
                      <Bed className="w-4 h-4 text-primary" />
                      <div className="text-xs"><div className="font-semibold">{meta.bedrooms}</div><div className="text-muted-foreground">Bedrooms</div></div>
                    </div>
                  )}
                  {meta.bathrooms != null && (
                    <div className="flex items-center gap-2 frosted-pill rounded-xl px-3 py-2.5">
                      <Bath className="w-4 h-4 text-primary" />
                      <div className="text-xs"><div className="font-semibold">{meta.bathrooms}</div><div className="text-muted-foreground">Bathrooms</div></div>
                    </div>
                  )}
                  {meta.checkIn && (
                    <div className="flex items-center gap-2 frosted-pill rounded-xl px-3 py-2.5">
                      <Clock className="w-4 h-4 text-primary" />
                      <div className="text-xs"><div className="font-semibold">{meta.checkIn} - {meta.checkOut || "—"}</div><div className="text-muted-foreground">Check-in/out</div></div>
                    </div>
                  )}
                </div>
              )}

              {/* Hotel amenities */}
              {isHotel && meta?.amenities && meta.amenities.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-sm font-semibold">Amenities</h4>
                  <div className="flex flex-wrap gap-2">
                    {meta.amenities.map(id => {
                      const Icon = AMENITY_ICONS[id] || ShieldCheck;
                      return (
                        <span key={id} className="inline-flex items-center gap-1.5 frosted-pill rounded-xl px-3 py-1.5 text-xs font-medium">
                          <Icon className="w-3.5 h-3.5 text-primary" />
                          {AMENITY_LABELS[id] || id}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Hotel policies */}
              {isHotel && meta && (meta.cancellation || meta.rules) && (
                <div className="space-y-3 pt-2">
                  {meta.cancellation && (
                    <div className="flex items-center gap-2 text-sm">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-emerald-600">{meta.cancellation}</span>
                    </div>
                  )}
                  {meta.rules && (
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">House Rules</h4>
                      <p className="text-sm text-muted-foreground">{meta.rules}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Car details */}
              {isCar && meta && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {meta.carType && (
                    <div className="flex items-center gap-2 frosted-pill rounded-xl px-3 py-2.5">
                      <Car className="w-4 h-4 text-primary" />
                      <div className="text-xs"><div className="font-semibold">{meta.carType}</div><div className="text-muted-foreground">Type</div></div>
                    </div>
                  )}
                  {meta.transmission && (
                    <div className="flex items-center gap-2 frosted-pill rounded-xl px-3 py-2.5">
                      <div className="text-xs"><div className="font-semibold">{meta.transmission}</div><div className="text-muted-foreground">Transmission</div></div>
                    </div>
                  )}
                  {meta.fuel && (
                    <div className="flex items-center gap-2 frosted-pill rounded-xl px-3 py-2.5">
                      <div className="text-xs"><div className="font-semibold">{meta.fuel}</div><div className="text-muted-foreground">Fuel</div></div>
                    </div>
                  )}
                  {meta.carYear && (
                    <div className="flex items-center gap-2 frosted-pill rounded-xl px-3 py-2.5">
                      <div className="text-xs"><div className="font-semibold">{meta.carYear}</div><div className="text-muted-foreground">Year</div></div>
                    </div>
                  )}
                  {meta.seats != null && (
                    <div className="flex items-center gap-2 frosted-pill rounded-xl px-3 py-2.5">
                      <Users className="w-4 h-4 text-primary" />
                      <div className="text-xs"><div className="font-semibold">{meta.seats}</div><div className="text-muted-foreground">Seats</div></div>
                    </div>
                  )}
                </div>
              )}

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
                      className="gap-2 rounded-xl ml-2 btn-secondary-premium"
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
                    {sellerProfile.facebook && sanitizeUrl(sellerProfile.facebook) && (
                      <a href={sanitizeUrl(sellerProfile.facebook)} target="_blank" rel="noopener noreferrer" title="Facebook" className="text-blue-600 hover:underline">
                        <i className="fa-brands fa-facebook" /> Facebook
                      </a>
                    )}
                    {sellerProfile.instagram && sanitizeUrl(sellerProfile.instagram) && (
                      <a href={sanitizeUrl(sellerProfile.instagram)} target="_blank" rel="noopener noreferrer" title="Instagram" className="text-pink-500 hover:underline">
                        <i className="fa-brands fa-instagram" /> Instagram
                      </a>
                    )}
                    {sellerProfile.linkedin && sanitizeUrl(sellerProfile.linkedin) && (
                      <a href={sanitizeUrl(sellerProfile.linkedin)} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="text-blue-700 hover:underline">
                        <i className="fa-brands fa-linkedin" /> LinkedIn
                      </a>
                    )}
                    {sellerProfile.tiktok && sanitizeUrl(sellerProfile.tiktok) && (
                      <a href={sanitizeUrl(sellerProfile.tiktok)} target="_blank" rel="noopener noreferrer" title="TikTok" className="text-black hover:underline">
                        <i className="fa-brands fa-tiktok" /> TikTok
                      </a>
                    )}
                    {sellerProfile.twitter && sanitizeUrl(sellerProfile.twitter) && (
                      <a href={sanitizeUrl(sellerProfile.twitter)} target="_blank" rel="noopener noreferrer" title="Twitter" className="text-blue-400 hover:underline">
                        <i className="fa-brands fa-twitter" /> Twitter
                      </a>
                    )}
                    {sellerProfile.website && sanitizeUrl(sellerProfile.website) && (
                      <a href={sanitizeUrl(sellerProfile.website)} target="_blank" rel="noopener noreferrer" title="Website" className="text-green-700 hover:underline">
                        <i className="fa-solid fa-globe" /> Website
                      </a>
                    )}
                  </div>
                )}
                {/* Hiq butonat e tjerë, lër vetëm emrin dhe rrjetet sociale */}
              </div>

              {descriptionText && (
                <div className="pt-4 border-t border-border/30">
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{descriptionText}</p>
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
