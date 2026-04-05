import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { X, Image, Video, Minus, ChevronUp, Loader2, Wifi, Car, Waves, Wind, Utensils, Tv, DoorOpen, Bath, Mountain, Coffee, ParkingCircle, Shield, Users, Bed, CalendarDays, Star } from "lucide-react";
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
import { sanitizeInput, checkRateLimit } from "@/lib/security";

interface AddProductModalProps {
  open: boolean;
  onClose: () => void;
  country: string | null;
}

const categories = [
  "Hotels & Stays", "House Rental", "House for Sale", "Car Rental",
  "Vehicles", "Electronics", "Clothing", "Furniture",
  "Services", "Home & Garden", "Sports", "Books", "Other",
];

const HOTEL_CATEGORIES = ["Hotels & Stays", "House Rental", "House for Sale"];

const PROPERTY_TYPES = [
  "Hotel", "Apartment", "Villa", "Resort", "Hostel", "Guesthouse",
  "Cabin", "Cottage", "Penthouse", "Studio", "Bungalow", "Motel",
];

const AMENITIES = [
  { id: "wifi", label: "Free WiFi", icon: Wifi },
  { id: "parking", label: "Parking", icon: ParkingCircle },
  { id: "pool", label: "Pool", icon: Waves },
  { id: "ac", label: "Air Conditioning", icon: Wind },
  { id: "restaurant", label: "Restaurant", icon: Utensils },
  { id: "tv", label: "Smart TV", icon: Tv },
  { id: "balcony", label: "Balcony", icon: DoorOpen },
  { id: "bathroom", label: "Private Bathroom", icon: Bath },
  { id: "view", label: "Scenic View", icon: Mountain },
  { id: "breakfast", label: "Breakfast", icon: Coffee },
  { id: "security", label: "24/7 Security", icon: Shield },
  { id: "kitchen", label: "Kitchen", icon: Utensils },
];

const CANCELLATION_POLICIES = [
  "Free cancellation",
  "Free cancellation up to 24h",
  "Free cancellation up to 48h",
  "Non-refundable",
  "Flexible",
];

const CAR_TYPES = [
  "Sedan", "SUV", "Hatchback", "Coupe", "Convertible", "Van",
  "Truck", "Electric", "Hybrid", "Luxury", "Economy", "Sports",
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

  // Hotel / Property fields
  const [propertyType, setPropertyType] = useState("");
  const [guests, setGuests] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [cancellationPolicy, setCancellationPolicy] = useState("");
  const [address, setAddress] = useState("");
  const [starRating, setStarRating] = useState("");
  const [houseRules, setHouseRules] = useState("");

  // Car rental fields
  const [carType, setCarType] = useState("");
  const [carYear, setCarYear] = useState("");
  const [carTransmission, setCarTransmission] = useState("");
  const [carFuel, setCarFuel] = useState("");
  const [carSeats, setCarSeats] = useState("");

  const isHotelCategory = HOTEL_CATEGORIES.includes(category);
  const isCarCategory = category === "Car Rental";

  const toggleAmenity = useCallback((id: string) => {
    setAmenities(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  }, []);

  const buildDescription = useCallback((baseDesc: string) => {
    const meta: Record<string, any> = {};
    if (isHotelCategory) {
      if (propertyType) meta.propertyType = propertyType;
      if (guests) meta.guests = Number(guests);
      if (bedrooms) meta.bedrooms = Number(bedrooms);
      if (bathrooms) meta.bathrooms = Number(bathrooms);
      if (amenities.length) meta.amenities = amenities;
      if (checkInTime) meta.checkIn = checkInTime;
      if (checkOutTime) meta.checkOut = checkOutTime;
      if (cancellationPolicy) meta.cancellation = cancellationPolicy;
      if (address) meta.address = address;
      if (starRating) meta.stars = Number(starRating);
      if (houseRules) meta.rules = houseRules;
    }
    if (isCarCategory) {
      if (carType) meta.carType = carType;
      if (carYear) meta.carYear = Number(carYear);
      if (carTransmission) meta.transmission = carTransmission;
      if (carFuel) meta.fuel = carFuel;
      if (carSeats) meta.seats = Number(carSeats);
    }
    if (Object.keys(meta).length === 0) return baseDesc;
    return `${baseDesc}\n\n<!--META:${JSON.stringify(meta)}:META-->`;
  }, [isHotelCategory, isCarCategory, propertyType, guests, bedrooms, bathrooms, amenities, checkInTime, checkOutTime, cancellationPolicy, address, starRating, houseRules, carType, carYear, carTransmission, carFuel, carSeats]);

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

    // Rate limit: max 5 submissions per 60 seconds
    if (!checkRateLimit("post-listing", 5, 60000)) {
      toast.error("Too many submissions. Please wait a moment.");
      return;
    }

    const parsed = productSchema.safeParse({
      title: sanitizeInput(title, 200),
      price: sanitizeInput(price, 100),
      description: sanitizeInput(description, 5000),
      category,
      contact: sanitizeInput(contact, 200),
      country: selectedCountry,
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
        description: buildDescription(parsed.data.description),
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
      toast.success("Listing published successfully!");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
      setTitle(""); setPrice(""); setDescription(""); setCategory("");
      setContact(""); setSelectedCountry("");
      setPropertyType(""); setGuests(""); setBedrooms(""); setBathrooms("");
      setAmenities([]); setCheckInTime(""); setCheckOutTime(""); setCancellationPolicy("");
      setAddress(""); setStarRating(""); setHouseRules("");
      setCarType(""); setCarYear(""); setCarTransmission(""); setCarFuel(""); setCarSeats("");
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full p-4 sm:p-6 rounded-[2rem] liquid-glass border-border/20">
        <DialogHeader>
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="font-display text-2xl">Post New Listing</DialogTitle>
            {submitting && (
              <button
                type="button"
                title="Minimize – upload continues in background"
                onClick={() => setMinimized(true)}
                className="w-7 h-7 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary/80 transition-all duration-300"
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
            <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider">Listing Title*</Label>
            <Input id="title" placeholder="e.g. Luxury Hotel Suite, 2BR Apartment, BMW X5 for Rent" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 input-premium" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price" className="text-xs font-semibold uppercase tracking-wider">Price*</Label>
              <Input id="price" type="text" placeholder="e.g. $50, $120/night, Free, Negotiable" value={price} onChange={(e) => setPrice(e.target.value)} maxLength={100} className="h-11 input-premium" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category" className="text-xs font-semibold uppercase tracking-wider">Category*</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category" className="h-11 input-premium"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent className="rounded-2xl glass border-border/30 shadow-premium">
                  {categories.map((cat) => (<SelectItem key={cat} value={cat}>{cat}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country" className="text-xs font-semibold uppercase tracking-wider">Country*</Label>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger id="country" className="h-11 input-premium"><SelectValue placeholder="Select country" /></SelectTrigger>
              <SelectContent className="max-h-60 rounded-2xl glass border-border/30 shadow-premium">
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2"><span>{c.flag}</span><span>{c.name}</span></span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ─── HOTEL & PROPERTY FIELDS ─── */}
          {isHotelCategory && (
            <div className="space-y-5 liquid-glass rounded-2xl p-5 border border-primary/10">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Bed className="w-4 h-4" />
                Property Details
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Property Type</Label>
                  <Select value={propertyType} onValueChange={setPropertyType}>
                    <SelectTrigger className="h-10 input-premium text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent className="rounded-xl glass border-border/30">
                      {PROPERTY_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Star Rating</Label>
                  <Select value={starRating} onValueChange={setStarRating}>
                    <SelectTrigger className="h-10 input-premium text-sm"><SelectValue placeholder="Stars" /></SelectTrigger>
                    <SelectContent className="rounded-xl glass border-border/30">
                      {[1,2,3,4,5].map(s => (
                        <SelectItem key={s} value={String(s)}>
                          <span className="flex items-center gap-1">{[...Array(s)].map((_,i) => <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />)}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Guests</Label>
                  <Input type="number" min="1" max="50" placeholder="4" value={guests} onChange={e => setGuests(e.target.value)} className="h-10 input-premium text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Bedrooms</Label>
                  <Input type="number" min="0" max="20" placeholder="2" value={bedrooms} onChange={e => setBedrooms(e.target.value)} className="h-10 input-premium text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Bathrooms</Label>
                  <Input type="number" min="0" max="20" placeholder="1" value={bathrooms} onChange={e => setBathrooms(e.target.value)} className="h-10 input-premium text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Check-in Time</Label>
                  <Input type="time" value={checkInTime} onChange={e => setCheckInTime(e.target.value)} className="h-10 input-premium text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Check-out Time</Label>
                  <Input type="time" value={checkOutTime} onChange={e => setCheckOutTime(e.target.value)} className="h-10 input-premium text-sm" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider">Cancellation Policy</Label>
                <Select value={cancellationPolicy} onValueChange={setCancellationPolicy}>
                  <SelectTrigger className="h-10 input-premium text-sm"><SelectValue placeholder="Select policy" /></SelectTrigger>
                  <SelectContent className="rounded-xl glass border-border/30">
                    {CANCELLATION_POLICIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider">Address / Location</Label>
                <Input placeholder="e.g. 123 Beach Road, Maldives" value={address} onChange={e => setAddress(e.target.value)} className="h-10 input-premium text-sm" />
              </div>

              {/* Amenities Grid */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wider">Amenities</Label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {AMENITIES.map(amenity => {
                    const selected = amenities.includes(amenity.id);
                    return (
                      <button
                        key={amenity.id}
                        type="button"
                        onClick={() => toggleAmenity(amenity.id)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 border ${
                          selected
                            ? "bg-primary/15 border-primary/30 text-primary shadow-sm"
                            : "bg-secondary/30 border-border/20 text-muted-foreground hover:bg-secondary/50"
                        }`}
                      >
                        <amenity.icon className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{amenity.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold uppercase tracking-wider">House Rules</Label>
                <Textarea
                  placeholder="e.g. No smoking, No pets, Quiet hours 10PM-8AM..."
                  rows={2}
                  value={houseRules}
                  onChange={e => setHouseRules(e.target.value)}
                  className="input-premium text-sm min-h-[60px]"
                />
              </div>
            </div>
          )}

          {/* ─── CAR RENTAL FIELDS ─── */}
          {isCarCategory && (
            <div className="space-y-5 liquid-glass rounded-2xl p-5 border border-primary/10">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                <Car className="w-4 h-4" />
                Vehicle Details
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Car Type</Label>
                  <Select value={carType} onValueChange={setCarType}>
                    <SelectTrigger className="h-10 input-premium text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent className="rounded-xl glass border-border/30">
                      {CAR_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Year</Label>
                  <Input type="number" min="1990" max="2027" placeholder="2024" value={carYear} onChange={e => setCarYear(e.target.value)} className="h-10 input-premium text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Transmission</Label>
                  <Select value={carTransmission} onValueChange={setCarTransmission}>
                    <SelectTrigger className="h-10 input-premium text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent className="rounded-xl glass border-border/30">
                      <SelectItem value="Automatic">Automatic</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Fuel</Label>
                  <Select value={carFuel} onValueChange={setCarFuel}>
                    <SelectTrigger className="h-10 input-premium text-sm"><SelectValue placeholder="Fuel" /></SelectTrigger>
                    <SelectContent className="rounded-xl glass border-border/30">
                      <SelectItem value="Gasoline">Gasoline</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Electric">Electric</SelectItem>
                      <SelectItem value="Hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold uppercase tracking-wider">Seats</Label>
                  <Input type="number" min="1" max="12" placeholder="5" value={carSeats} onChange={e => setCarSeats(e.target.value)} className="h-10 input-premium text-sm" />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider">Description*</Label>
            <Textarea id="description" placeholder="Describe your listing — features, amenities, condition, availability..." rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="input-premium min-h-[100px]" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact" className="text-xs font-semibold uppercase tracking-wider">Contact* (phone or email)</Label>
            <Input id="contact" placeholder="e.g. +1 555 123 4567 or email@example.com" value={contact} onChange={(e) => setContact(e.target.value)} className="h-11 input-premium" />
          </div>

          {/* Multi-file Upload */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wider">Photos or Videos* <span className="text-xs text-muted-foreground font-normal normal-case">(max {MAX_FILES} files, max {MAX_VIDEOS} videos)</span></Label>

            {files.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {files.map((file, i) => (
                  <div key={i} className="relative border border-border/30 rounded-2xl overflow-hidden aspect-square bg-secondary/20">
                    <Button
                      type="button" variant="destructive" size="icon"
                      className="absolute top-1.5 right-1.5 z-10 h-6 w-6 rounded-full"
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
                      <div className="absolute bottom-1.5 left-1.5 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-lg backdrop-blur-sm">VIDEO</div>
                    )}
                  </div>
                ))}

                {files.length < MAX_FILES && (
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="border-2 border-dashed border-border/40 rounded-2xl aspect-square flex flex-col items-center justify-center hover:border-primary/60 transition-all duration-300 cursor-pointer group"
                  >
                    <Image className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                    <span className="text-xs text-muted-foreground mt-1">Add</span>
                  </div>
                )}
              </div>
            )}

            {files.length === 0 && (
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-border/40 rounded-2xl p-8 text-center hover:border-primary/60 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex justify-center gap-3 mb-2">
                  <Image className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  <Video className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                </div>
                <p className="text-sm text-muted-foreground">Click to upload photos or videos</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, WebP, GIF, MP4, WebM (max 2GB)</p>
              </div>
            )}

            <input ref={fileRef} type="file" accept={ACCEPTED_TYPES} onChange={handleFileChange} className="hidden" multiple />
          </div>

          {submitting && uploadProgress > 0 && <Progress value={uploadProgress} className="h-2 rounded-full" />}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-2xl h-12 btn-secondary-premium">Cancel</Button>
            <Button type="submit" variant="accent" className="flex-1 rounded-2xl h-12 btn-premium font-semibold" disabled={submitting}>
              <span className="btn-shine" />
              {submitting ? "Uploading..." : "Publish Listing"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>

    {/* Floating badge when minimized during upload */}
    {minimized && submitting && (
      <div className="fixed bottom-6 right-6 z-[200] glass rounded-2xl shadow-premium p-4 w-72 space-y-3 animate-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            <span className="text-sm font-medium">Uploading product…</span>
          </div>
          <button
            onClick={() => setMinimized(false)}
            className="w-7 h-7 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-secondary/80 transition-all duration-300"
            title="Expand"
          >
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <Progress value={uploadProgress} className="h-1.5 rounded-full" />
        <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
      </div>
    )}
    </>
  );
};
