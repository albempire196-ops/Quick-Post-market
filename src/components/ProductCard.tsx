import { Star, MapPin, Share2, Copy, Check, Play, Bed, Users, Wifi, Car } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useState, useEffect, useRef, useMemo, memo } from "react";
import { ProductStatusBadge } from "@/components/ProductStatusBadge";
import { parseListingMeta, isHotelListing, isCarListing } from "@/lib/listingMeta";


interface ProductCardProps {
  id: string;
  title: string;
  price: string;
  image: string;
  location: string;
  category: string;
  rating: number;
  reviewCount: number;
  userId?: string;
  mediaUrls?: string[];
  status?: string;
  description?: string | null;
  onClick: () => void;
}

const ProductCardInner = ({
  id,
  title,
  price,
  image,
  location,
  category,
  rating,
  reviewCount,
  userId,
  mediaUrls,
  status,
  description,
  onClick,
}: ProductCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isOwner = user && userId && user.id === userId;
  const [copied, setCopied] = useState(false);
  const [videoThumb, setVideoThumb] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const { meta } = useMemo(() => parseListingMeta(description), [description]);
  const isHotel = isHotelListing(category);
  const isCar = isCarListing(category);

  const isVideo = (url: string) => /\.(mp4|webm|mov|quicktime)(\?|$)/i.test(url) || url.includes("video");
  const firstMedia = mediaUrls?.[0] || image;
  const firstIsVideo = isVideo(firstMedia);

  // Generate video thumbnail at 5th second
  useEffect(() => {
    if (firstIsVideo && firstMedia) {
      const video = document.createElement("video");
      video.crossOrigin = "anonymous";
      video.src = firstMedia;
      video.currentTime = 5;
      video.muted = true;
      video.addEventListener("seeked", () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = video.videoWidth || 640;
          canvas.height = video.videoHeight || 360;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            setVideoThumb(canvas.toDataURL("image/jpeg", 0.8));
          }
        } catch {}
      });
      video.load();
    }
  }, [firstIsVideo, firstMedia]);

  const productUrl = `${window.location.origin}/?product=${id}`;
  const shareText = `${title} - ${price}`;

  const handleShareWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + " " + productUrl)}`, "_blank");
  };

  const handleShareFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, "_blank");
  };

  const handleCopyLink = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(productUrl);
    setCopied(true);
    toast.success("Link u kopjua!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card 
      ref={cardRef}
      className="group cursor-pointer overflow-hidden liquid-glass card-shine card-glow border-border/15 rounded-[2rem] p-0"
      onClick={onClick}
    >
      {/* Image container with premium overlay */}
      <div className="aspect-[4/3] overflow-hidden bg-secondary/20 relative">
        {/* Loading shimmer */}
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton-premium animate-shimmer" />
        )}
        {firstIsVideo ? (
          <>
            <img
              src={videoThumb || image || "/placeholder.svg"}
              alt={title}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-all duration-700 ease-premium ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} group-hover:scale-110`}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 group-hover:bg-primary/80 transition-all duration-500 ease-premium shadow-lg">
                <Play className="w-6 h-6 text-white fill-white ml-0.5" />
              </div>
            </div>
          </>
        ) : (
          <img
            src={image}
            alt={title}
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 ease-premium ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'} group-hover:scale-110`}
          />
        )}
        
        {/* Premium gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        
        {/* Top badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <Badge 
            variant="secondary" 
            className="font-medium frosted-pill rounded-xl text-xs px-2.5 py-1"
          >
            {category}
          </Badge>
          <ProductStatusBadge status={status} />
        </div>

        {/* Share button - appears on hover */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-400 ease-premium">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="w-9 h-9 rounded-xl glass-strong backdrop-blur-xl hover:bg-card/90 transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-1.5 flex gap-1.5 glass rounded-2xl shadow-premium border-border/30" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="ghost" className="gap-2 rounded-xl hover:bg-secondary/60" onClick={handleShareWhatsApp}>
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-green-500"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                WhatsApp
              </Button>
              <Button size="sm" variant="ghost" className="gap-2 rounded-xl hover:bg-secondary/60" onClick={handleShareFacebook}>
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-blue-600"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </Button>
              <Button size="sm" variant="ghost" className="gap-2 rounded-xl hover:bg-secondary/60" onClick={handleCopyLink}>
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Copied!" : "Copy"}
              </Button>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <CardContent className="p-4 sm:p-5 space-y-3">
        <div>
          <h3 className="font-sans font-semibold text-base sm:text-lg line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-snug">
            {title}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-primary/60" />
            <span className="truncate">{location}</span>
          </div>
        </div>

        {/* Hotel meta chips */}
        {isHotel && meta && (
          <div className="flex flex-wrap gap-1.5">
            {meta.stars && (
              <span className="inline-flex items-center gap-0.5 frosted-pill rounded-lg px-2 py-0.5 text-[10px] font-medium">
                {[...Array(meta.stars)].map((_,i) => <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />)}
              </span>
            )}
            {meta.bedrooms != null && (
              <span className="inline-flex items-center gap-1 frosted-pill rounded-lg px-2 py-0.5 text-[10px] font-medium">
                <Bed className="w-3 h-3" />{meta.bedrooms} bed
              </span>
            )}
            {meta.guests != null && (
              <span className="inline-flex items-center gap-1 frosted-pill rounded-lg px-2 py-0.5 text-[10px] font-medium">
                <Users className="w-3 h-3" />{meta.guests}
              </span>
            )}
            {meta.amenities?.includes("wifi") && (
              <span className="inline-flex items-center gap-1 frosted-pill rounded-lg px-2 py-0.5 text-[10px] font-medium">
                <Wifi className="w-3 h-3" />
              </span>
            )}
          </div>
        )}

        {/* Car meta chips */}
        {isCar && meta && (
          <div className="flex flex-wrap gap-1.5">
            {meta.carType && (
              <span className="inline-flex items-center gap-1 frosted-pill rounded-lg px-2 py-0.5 text-[10px] font-medium">
                <Car className="w-3 h-3" />{meta.carType}
              </span>
            )}
            {meta.transmission && (
              <span className="inline-flex items-center frosted-pill rounded-lg px-2 py-0.5 text-[10px] font-medium">
                {meta.transmission}
              </span>
            )}
            {meta.seats != null && (
              <span className="inline-flex items-center gap-1 frosted-pill rounded-lg px-2 py-0.5 text-[10px] font-medium">
                <Users className="w-3 h-3" />{meta.seats}
              </span>
            )}
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t border-border/20">
          <div className="flex items-center gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 transition-colors duration-300 ${
                  i < Math.floor(rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-border fill-transparent"
                }`}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1.5">({reviewCount})</span>
          </div>
          
          <div className="text-xl sm:text-2xl font-display font-bold text-gradient animate-gradient bg-[length:200%_200%]">
            {price}
            {isHotel && <span className="text-xs font-normal text-muted-foreground ml-1">/night</span>}
            {isCar && <span className="text-xs font-normal text-muted-foreground ml-1">/day</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProductCard = memo(ProductCardInner);
