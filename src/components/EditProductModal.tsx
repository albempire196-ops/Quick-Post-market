import { useState, useEffect } from "react";
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
import { useQueryClient } from "@tanstack/react-query";
import { countries } from "@/data/countries";

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  product: {
    id: string;
    title: string;
    price: string;
    description: string | null;
    category: string;
    contact: string | null;
    country: string | null;
  } | null;
}

const categories = [
  "Electronics", "Clothing", "Furniture", "Vehicles",
  "Home & Garden", "Sports", "Books", "Other",
];

export const EditProductModal = ({ open, onClose, product }: EditProductModalProps) => {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [contact, setContact] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setTitle(product.title);
      setPrice(product.price);
      setDescription(product.description || "");
      setCategory(product.category);
      setContact(product.contact || "");
      setSelectedCountry(product.country || "");
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    if (!title.trim() || !price.trim()) {
      toast.error("Title and price are required");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("products")
        .update({
          title: title.trim(),
          price: price.trim(),
          description: description.trim() || null,
          category,
          contact: contact.trim() || null,
          country: selectedCountry || null,
        })
        .eq("id", product.id);

      if (error) throw error;

      toast.success("Product updated!");
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-[95vw] sm:w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl">Edit Product</DialogTitle>
          <DialogDescription>Update your product details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Title*</Label>
            <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Price*</Label>
              <Input id="edit-price" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
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

          <div className="space-y-2">
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea id="edit-desc" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-contact">Contact</Label>
            <Input id="edit-contact" value={contact} onChange={(e) => setContact(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
