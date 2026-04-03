import { Star, MapPin, Trash2, MessageCircle, Share2, Copy, Check, Play } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

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
  onClick: () => void;
}

export const ProductCard = ({
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
  onClick,
}: ProductCardProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isOwner = user && userId && user.id === userId;
  const [copied, setCopied] = useState(false);
  const [videoThumb, setVideoThumb] = useState<string | null>(null);

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

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error("Error deleting product");
    } else {
      toast.success("Product deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    }
  };

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
      className="group cursor-pointer overflow-hidden hover-lift glass border-border/30 rounded-2xl"
      onClick={onClick}
    >
      <div className="aspect-[4/3] overflow-hidden bg-secondary/30 relative">
        {firstIsVideo ? (
          <>
            <img
              src={videoThumb || image || "/placeholder.svg"}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center">
                <Play className="w-6 h-6 text-white fill-white" />
              </div>
            </div>
          </>
        ) : (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
        <Badge 
          variant="secondary" 
          className="absolute top-4 left-4 font-medium glass-strong rounded-lg"
        >
          {category}
        </Badge>
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon"
                variant="secondary"
                className="rounded-lg glass-strong"
                onClick={(e) => e.stopPropagation()}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2 flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="outline" className="gap-2 rounded-lg" onClick={handleShareWhatsApp}>
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-green-500"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                WhatsApp
              </Button>
              <Button size="sm" variant="outline" className="gap-2 rounded-lg" onClick={handleShareFacebook}>
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-blue-600"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                Facebook
              </Button>
              <Button size="sm" variant="outline" className="gap-2 rounded-lg" onClick={handleCopyLink}>
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? "Kopjuar!" : "Kopjo"}
              </Button>
            </PopoverContent>
          </Popover>
          {!isOwner && user && userId && (
            <Button
              size="icon"
              variant="secondary"
              className="rounded-lg glass-strong"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/chat?productId=${id}&sellerId=${userId}`);
              }}
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      <CardContent className="p-5 space-y-4">
        <div>
          <h3 className="font-display font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-2">
            <MapPin className="w-4 h-4" />
            <span>{location}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(rating)
                    ? "fill-accent text-accent"
                    : "text-muted/50"
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground ml-2">({reviewCount})</span>
          </div>
          
          <div className="text-2xl font-display font-bold text-gradient">
            {price}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
