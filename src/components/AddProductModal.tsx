import { useState, useRef, useEffect } from "react";
import { X, Image, Video, Minus, ChevronUp, Loader2 } from "lucide-react";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";
import { countries } from "@/data/countries";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  country: string | null;
}

const categories = [
  "Electronics", "Clothing", "Furniture", "Vehicles",
  "Home & Garden", "Sports", "Books", "Other",
];

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime";
const MAX_FILE_SIZE = 2 * 1024 * 1024 * 1024; // 2GB
const MAX_FILES = 10;
const MAX_VIDEOS = 2;
const MIN_VIDEO_DURATION = 15; // seconds

const getProductPostErrorMessage = (err: unknown) => {
  const message = (() => {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    if (err && typeof err === "object") {
      const maybeError = err as {
        message?: string;
        error_description?: string;
        details?: string;
        hint?: string;
        code?: string;
      };

      return (
        maybeError.message ||
        maybeError.error_description ||
        maybeError.details ||
        maybeError.hint ||
        maybeError.code ||
        JSON.stringify(err)
      );
    }

    return String(err ?? "");
  })();
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("bucket") || normalizedMessage.includes("product-media")) {
    return "Supabase storage bucket 'product-media' mungon ose nuk ka leje upload.";
  }

  if (
    normalizedMessage.includes("relation \"products\" does not exist") ||
    normalizedMessage.includes("relation 'products' does not exist") ||
    normalizedMessage.includes("table \"products\" does not exist")
  ) {
    return "Tabela e produkteve nuk ekziston ose migrimet e Supabase nuk janë aplikuar.";
  }

  if (
    normalizedMessage.includes("schema cache") ||
    normalizedMessage.includes("column") ||
    normalizedMessage.includes("status") ||
    normalizedMessage.includes("media_urls") ||
    normalizedMessage.includes("contact")
  ) {
    return `Skema e tabeles products nuk perputhet me app-in. Gabimi: ${message}`;
  }

  if (normalizedMessage.includes("products_public")) {
    return `The products_public view is missing or not updated. Error: ${message}`;
  }

  if (normalizedMessage.includes("row-level security") || normalizedMessage.includes("policy")) {
    return "Supabase RLS policy is blocking the product post.";
  }

  if (normalizedMessage.includes("jwt") || normalizedMessage.includes("auth") || normalizedMessage.includes("permission")) {
    return "You must be signed in and Supabase must have the correct permissions to post.";
  }

  return message || "Something went wrong. Please try again.";
};

export const AddProductModal = ({ open, onClose, country }: AddProductModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [contact, setContact] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(country || "");
  const [submitting, setSubmitting] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const [minimized, setMinimized] = useState(false);

  // Reset minimized when modal is freshly opened
  useEffect(() => {
    if (open) setMinimized(false);
  }, [open]);

  const videoCount = files.filter(f => f.type.startsWith("video/")).length;

  const getVideoDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve(video.duration);
      };
      video.onerror = () => reject(new Error("Cannot read video"));
      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const newFiles: File[] = [];
    let currentVideos = videoCount;

    for (const file of selected) {
        if (files.length + newFiles.length >= MAX_FILES) {
          toast.error(`Maximum ${MAX_FILES} files`);
          break;
        }
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} is too large (max 2GB)`);
          continue;
        }
        if (file.type.startsWith("video/")) {
          if (currentVideos >= MAX_VIDEOS) {
            toast.error(`Maximum ${MAX_VIDEOS} videos`);
            continue;
          }
          try {
            const duration = await getVideoDuration(file);
            if (duration < MIN_VIDEO_DURATION) {
              toast.error(`${file.name} is too short (min ${MIN_VIDEO_DURATION} seconds)`);
              continue;
            }
          } catch {
            toast.error(`Cannot read video: ${file.name}`);
            continue;
          }
          currentVideos++;
        }
      newFiles.push(file);
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(f => URL.createObjectURL(f));
      setPreviews(prev => [...prev, ...newPreviews]);
    }

    if (fileRef.current) fileRef.current.value = "";
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const productSchema = z.object({
    title: z.string().trim().min(1, "Title is required").max(200),
    price: z.string().trim().min(1, "Price is required").max(100),
    description: z.string().trim().min(1, "Description is required").max(5000),
    category: z.string().min(1, "Category is required"),
    contact: z.string().trim().min(1, "Contact is required").max(200),
    country: z.string().min(1, "Country is required"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = productSchema.safeParse({
      title, price, description, category, contact, country: selectedCountry,
    });

    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    if (files.length === 0) {
      toast.error("You must upload at least one photo or video");
      return;
    }

    if (!user) {
      toast.error("You must be signed in to post");
      return;
    }

    setSubmitting(true);
    setUploadProgress(10);

    try {
      // Upload all files in parallel
      const uploadPromises = files.map(async (file) => {
        const ext = file.name.split(".").pop();
        const filePath = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-media")
          .upload(filePath, file, { contentType: file.type });
        if (uploadError) throw uploadError;
        const { data: urlData } = supabase.storage.from("product-media").getPublicUrl(filePath);
        return urlData.publicUrl;
      });

      setUploadProgress(30);
      const mediaUrls = await Promise.all(uploadPromises);
      setUploadProgress(70);

      const { error } = await supabase.from("products").insert({
        title: parsed.data.title,
        price: parsed.data.price,
        description: parsed.data.description,
        category: parsed.data.category.toLowerCase(),
        contact: parsed.data.contact,
        country: parsed.data.country,
        status: "available",
        user_id: user.id,
        image_url: mediaUrls[0], // first as thumbnail
        media_urls: mediaUrls,
      });

      if (error) throw error;

      setUploadProgress(100);
      toast.success("Product posted successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
      setTitle(""); setPrice(""); setDescription(""); setCategory("");
      setContact(""); setSelectedCountry("");
      previews.forEach(p => URL.revokeObjectURL(p));
      setFiles([]); setPreviews([]); setUploadProgress(0); setMinimized(false);
    } catch (err) {
      console.error("Error posting product:", err);
      toast.error(getProductPostErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <Dialog open={open && !minimized} onOpenChange={(isOpen) => { if (!isOpen) { if (submitting) setMinimized(true); else onClose(); } }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="text-2xl">Post New Product</DialogTitle>
            {submitting && (
              <button
                type="button"
                title="Minimize – upload continues in background"
                onClick={() => setMinimized(true)}
                className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <Minus className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>
          <DialogDescription>
            Fill in the product details to publish it immediately
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Product Title*</Label>
            <Input id="title" placeholder="e.g. iPhone 14 Pro in excellent condition" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price*</Label>
              <Input id="price" type="text" placeholder="e.g. $50, Free, Negotiable" value={price} onChange={(e) => setPrice(e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category*</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country*</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger id="country"><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2"><span>{c.flag}</span><span>{c.name}</span></span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description*</Label>
            <Textarea id="description" placeholder="Describe your product..." rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Contact* (phone or email)</Label>
            <Input id="contact" placeholder="e.g. +1 555 123 4567 or email@example.com" value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>

          {/* Multi-file Upload */}
          <div className="space-y-2">
            <Label>Photos or Videos* <span className="text-xs text-muted-foreground">(max {MAX_FILES} files, max {MAX_VIDEOS} videos)</span></Label>

            {files.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {files.map((file, i) => (
                  <div key={i} className="relative border border-border rounded-lg overflow-hidden aspect-square bg-secondary/30">
                    <Button
                      type="button" variant="destructive" size="icon"
                      className="absolute top-1 right-1 z-10 h-6 w-6 rounded-full"
                      onClick={() => removeFile(i)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                    {file.type.startsWith("video/") ? (
                      <video src={previews[i]} className="w-full h-full object-cover" />
                    ) : (
                      <img src={previews[i]} alt="Preview" className="w-full h-full object-cover" />
                    )}
                    {file.type.startsWith("video/") && (
                      <div className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">VIDEO</div>
                    )}
                  </div>
                ))}

                {files.length < MAX_FILES && (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-border rounded-lg aspect-square flex flex-col items-center justify-center hover:border-primary transition-colors cursor-pointer"
                  >
                    <Image className="w-6 h-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground mt-1">Add</span>
                  </div>
                )}
              </div>
            )}

            {files.length === 0 && (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-smooth cursor-pointer"
              >
                <div className="flex justify-center gap-3 mb-2">
                  <Image className="w-8 h-8 text-muted-foreground" />
                  <Video className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Click to upload photos or videos</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, GIF, MP4, WebM (max 2GB)</p>
              </div>
            )}

            <input ref={fileRef} type="file" accept={ACCEPTED_TYPES} onChange={handleFileChange} className="hidden" multiple />
          </div>

          {submitting && uploadProgress > 0 && <Progress value={uploadProgress} className="h-2" />}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" variant="accent" className="flex-1" disabled={submitting}>
              {submitting ? "Uploading..." : "Publish Product"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    {/* Floating badge when minimized during upload */}
    {minimized && submitting && (
      <div className="fixed bottom-6 right-6 z-[200] bg-card border border-border rounded-2xl shadow-card p-4 w-72 space-y-3 animate-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm font-medium">Uploading product…</span>
          </div>
          <button
            onClick={() => setMinimized(false)}
            className="w-7 h-7 rounded-full bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
            title="Expand"
          >
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <Progress value={uploadProgress} className="h-1.5" />
        <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
      </div>
    )}
    </>
  );
};
