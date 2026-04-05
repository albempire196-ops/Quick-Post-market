import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AddWorkerModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddWorkerModal = ({ open, onClose }: AddWorkerModalProps) => {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [wage, setWage] = useState("");
  const [submitting, setSubmitting] = useState(false);

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

    try {
      // Try inserting into `workers` table
      const { error: insertError } = await supabase.from("workers").insert({
        business_name: businessName.trim(),
        description: description.trim() || null,
        wage: wage.trim() || null,
        poster_id: user.id,
      });

      if (insertError) {
        // Fallback: create as product with category 'workers'
        const { error: fallbackError } = await supabase.from("products").insert({
          title: businessName.trim(),
          description: description.trim() || null,
          price: wage.trim() || null,
          category: "workers",
          user_id: user.id,
        });

        if (fallbackError) throw fallbackError;
      }

      toast.success("Job listing posted.");
      setBusinessName("");
      setDescription("");
      setWage("");
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Could not post job listing.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle>Post a job (Find Worker)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Business name</Label>
            <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div>
            <Label>Wage</Label>
            <Input value={wage} onChange={(e) => setWage(e.target.value)} placeholder="e.g. 500 USD/month or 10 USD/hour" />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={submitting}>{submitting ? "Posting..." : "Post Job"}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddWorkerModal;
