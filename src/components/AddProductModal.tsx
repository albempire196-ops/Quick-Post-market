import { useState, useRef } from "react";
import { X, Image, Video } from "lucide-react";
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
        toast.error(`Maksimumi ${MAX_FILES} skedarë`);
        break;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} është shumë i madh (max 2GB)`);
        continue;
      }
      if (file.type.startsWith("video/")) {
        if (currentVideos >= MAX_VIDEOS) {
          toast.error(`Maksimumi ${MAX_VIDEOS} video`);
          continue;
        }
        try {
          const duration = await getVideoDuration(file);
          if (duration < MIN_VIDEO_DURATION) {
            toast.error(`${file.name} është shumë e shkurtër (min ${MIN_VIDEO_DURATION} sekonda)`);
            continue;
          }
        } catch {
          toast.error(`Nuk mund të lexohet video: ${file.name}`);
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
    title: z.string().trim().min(1, "Titulli kërkohet").max(200),
    price: z.string().trim().min(1, "Çmimi kërkohet").max(100),
    description: z.string().trim().min(1, "Përshkrimi kërkohet").max(5000),
    category: z.string().min(1, "Kategoria kërkohet"),
    contact: z.string().trim().min(1, "Kontakti kërkohet").max(200),
    country: z.string().min(1, "Vendi kërkohet"),
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
      toast.error("Duhet të ngarkoni të paktën një foto ose video");
      return;
    }

    if (!user) {
      toast.error("Duhet të identifikoheni për të postuar");
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
        user_id: user.id,
        image_url: mediaUrls[0], // first as thumbnail
        media_urls: mediaUrls,
      });

      if (error) throw error;

      setUploadProgress(100);
      toast.success("Produkti u postua me sukses!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
      setTitle(""); setPrice(""); setDescription(""); setCategory("");
      setContact(""); setSelectedCountry("");
      previews.forEach(p => URL.revokeObjectURL(p));
      setFiles([]); setPreviews([]); setUploadProgress(0);
    } catch (err) {
      console.error("Error posting product:", err);
      toast.error("Diçka shkoi keq. Provoni përsëri.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl">Posto Produkt të Ri</DialogTitle>
          <DialogDescription>
            Plotësoni detajet e produktit për ta publikuar menjëherë
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titulli i Produktit*</Label>
            <Input id="title" placeholder="p.sh. iPhone 14 Pro në gjendje të shkëlqyer" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Çmimi*</Label>
              <Input id="price" type="text" placeholder="p.sh. $50, Falas, I negociueshëm" value={price} onChange={(e) => setPrice(e.target.value)} maxLength={100} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Kategoria*</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category"><SelectValue placeholder="Zgjidhni kategorinë" /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Vendi*</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger id="country"><SelectValue placeholder="Zgjidhni vendin" /></SelectTrigger>
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
            <Label htmlFor="description">Përshkrimi*</Label>
            <Textarea id="description" placeholder="Përshkruani produktin tuaj..." rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact">Kontakti* (telefon ose email)</Label>
            <Input id="contact" placeholder="p.sh. +355 69 123 4567 ose email@shembull.com" value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>

          {/* Multi-file Upload */}
          <div className="space-y-2">
            <Label>Foto ose Video* <span className="text-xs text-muted-foreground">(max {MAX_FILES} skedarë, max {MAX_VIDEOS} video)</span></Label>

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
                    <span className="text-xs text-muted-foreground mt-1">Shto</span>
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
                <p className="text-sm text-muted-foreground">Klikoni për të ngarkuar foto ose video</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, GIF, MP4, WebM (max 2GB)</p>
              </div>
            )}

            <input ref={fileRef} type="file" accept={ACCEPTED_TYPES} onChange={handleFileChange} className="hidden" multiple />
          </div>

          {submitting && uploadProgress > 0 && <Progress value={uploadProgress} className="h-2" />}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Anulo</Button>
            <Button type="submit" variant="accent" className="flex-1" disabled={submitting}>
              {submitting ? "Duke ngarkuar..." : "Publiko Produktin"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
