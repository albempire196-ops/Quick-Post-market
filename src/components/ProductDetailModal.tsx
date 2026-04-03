import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageCircle, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import adImage from "@/assets/tadd.webp";

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
    user_id?: string | null;
  } | null;
  countryName?: string;
}

export const ProductDetailModal = ({ open, onClose, product, countryName }: ProductDetailModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showAd, setShowAd] = useState(true);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

  // Get all media URLs
  const allMedia: string[] = [];
  if (product) {
    if (product.media_urls && Array.isArray(product.media_urls) && product.media_urls.length > 0) {
      allMedia.push(...product.media_urls);
    } else if (product.image_url) {
      allMedia.push(product.image_url);
    }
  }

  // Show ad for 5 seconds when modal opens
  useEffect(() => {
    if (open && product) {
      setShowAd(true);
      setCurrentMediaIndex(0);
      const timer = setTimeout(() => setShowAd(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [open, product?.id]);

  const isVideo = (url: string) => {
    return /\.(mp4|webm|mov|quicktime)(\?|$)/i.test(url) || url.includes("video");
  };

  const isOwner = user && product?.user_id && user.id === product.user_id;

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto p-0 gap-0 rounded-2xl">
        {showAd ? (
          <div className="relative flex items-center justify-center bg-black min-h-[300px] sm:min-h-[400px]">
            <img
              src={adImage}
              alt="Ad"
              className="w-full h-full object-contain max-h-[70vh]"
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
              Reklama mbyllet automatikisht...
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="absolute top-3 right-3 text-white hover:bg-white/20 rounded-full"
              onClick={() => setShowAd(false)}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        ) : (
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
                <Badge variant="secondary" className="shrink-0 rounded-lg">{product.category}</Badge>
              </div>

              <div className="text-2xl sm:text-3xl font-display font-bold text-gradient">{product.price}</div>

              {product.description && (
                <div className="pt-3 border-t border-border/50">
                  <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Chat button */}
              {!isOwner && user && product.user_id && (
                <Button
                  className="w-full gap-2 rounded-xl h-12"
                  onClick={() => {
                    onClose();
                    navigate(`/chat?productId=${product.id}&sellerId=${product.user_id}`);
                  }}
                >
                  <MessageCircle className="w-5 h-5" />
                  Kontakto Shitësin
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
