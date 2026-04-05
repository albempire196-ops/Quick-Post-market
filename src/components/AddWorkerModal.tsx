import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Image, X, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "@/data/countries";

const MAX_FILES = 5;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif";

interface AddWorkerModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddWorkerModal = ({ open, onClose }: AddWorkerModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [wage, setWage] = useState("");
  const [contact, setContact] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;

    const newFiles: File[] = [];
    for (const file of selected) {
      if (files.length + newFiles.length >= MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} photos`);
        break;
      }
      if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is too large (max 50MB)`);
        continue;
      }
      newFiles.push(file);
    }

    if (newFiles.length > 0) {
      setFiles(prev => [...prev, ...newFiles]);
      setPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))]);
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeFile = (index: number) => {
    URL.revokeObjectURL(previews[index]);
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Sign in to post a job.");
      return;
    }
    if (!businessName.trim()) {
      toast.error("Business name is required.");
      return;
    }

    setSubmitting(true);
    setUploadProgress(10);

    try {
      let mediaUrls: string[] = [];

      if (files.length > 0) {
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

        setUploadProgress(40);
        mediaUrls = await Promise.all(uploadPromises);
      }

      setUploadProgress(70);

      const { error: insertError } = await supabase.from("products").insert({
        title: businessName.trim(),
        description: description.trim() || null,
        price: wage.trim() || null,
        contact: contact.trim() || null,
        country: selectedCountry || null,
        category: "workers",
        status: "available",
        user_id: user.id,
        image_url: mediaUrls[0] || null,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
      });

      if (insertError) throw insertError;

      setUploadProgress(100);
      toast.success("Job listing posted!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["jobs"] });

      setBusinessName("");
      setDescription("");
      setWage("");
      setContact("");
      setSelectedCountry("");
      previews.forEach(p => URL.revokeObjectURL(p));
      setFiles([]);
      setPreviews([]);
      setUploadProgress(0);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Could not post job listing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !submitting) onClose(); }}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Post a Job — Find Worker</DialogTitle>
          <DialogDescription>Fill in the details to find a worker for your business</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Business Name *</Label>
            <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Restaurant Bella Italia" />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the job position, requirements..." rows={4} />
          </div>

          <div>
            <Label>Wage</Label>
            <Input value={wage} onChange={(e) => setWage(e.target.value)} placeholder="e.g. 500 USD/month or 10 USD/hour" />
          </div>

          <div>
            <Label>Contact</Label>
            <Input value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Phone number or email" />
          </div>

          <div>
            <Label>Country</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent className="max-h-60">
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span><span>{c.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Photo Upload */}
          <div>
            <Label>Photos</Label>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED_TYPES}
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full mt-1 gap-2"
              onClick={() => fileRef.current?.click()}
              disabled={files.length >= MAX_FILES}
            >
              <Image className="w-4 h-4" />
              Add Photos ({files.length}/{MAX_FILES})
            </Button>

            {previews.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {previews.map((src, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={src} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeFile(i)}
                      className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {submitting && <Progress value={uploadProgress} className="h-2" />}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...</> : "Post Job"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddWorkerModal;
