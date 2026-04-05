import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ArrowLeft, Briefcase, Pencil, Trash2, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "@/data/countries";

const Jobs = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchParams, setSearchParams] = useSearchParams();
  const initialCountry = searchParams.get("country") || "";
  const [selectedCountry, setSelectedCountry] = useState(initialCountry);

  const { data, error, isLoading } = useQuery({
    queryKey: ["jobs", selectedCountry],
    queryFn: async () => {
      let q = supabase
        .from("products_public")
        .select("id, user_id, title, description, price, image_url, media_urls, contact, country, created_at")
        .in("category", ["workers", "jobs", "services"])
        .order("created_at", { ascending: false });

      if (selectedCountry) {
        q = q.eq("country", selectedCountry);
      }

      const { data: products, error: queryError } = await q;
      if (queryError) throw queryError;
      return products || [];
    },
  });

  useEffect(() => {
    if (error) console.error("Jobs query error:", error);
  }, [error]);

  useEffect(() => {
    if (selectedCountry) {
      setSearchParams({ country: selectedCountry });
    } else {
      setSearchParams({});
    }
  }, [selectedCountry]);

  // Edit state
  const [editItem, setEditItem] = useState<any | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editWage, setEditWage] = useState("");
  const [editContact, setEditContact] = useState("");
  const [saving, setSaving] = useState(false);

  const openEdit = (item: any) => {
    setEditItem(item);
    setEditTitle(item.title || "");
    setEditDesc(item.description || "");
    setEditWage(item.price || "");
    setEditContact(item.contact || "");
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("products").update({
        title: editTitle.trim(),
        description: editDesc.trim() || null,
        price: editWage.trim() || null,
        contact: editContact.trim() || null,
      }).eq("id", editItem.id);
      if (error) throw error;
      toast.success("Job listing updated!");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      setEditItem(null);
    } catch (err) {
      console.error(err);
      toast.error("Could not update listing.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
      toast.success("Listing deleted.");
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    } catch (err) {
      console.error(err);
      toast.error("Could not delete listing.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Briefcase className="w-6 h-6" /> Jobs — Workers Needed
            </h1>
            <p className="text-sm text-muted-foreground">{data?.length ?? 0} listings</p>
          </div>
        </div>

        {/* Country filter */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-muted-foreground mb-2">Filter by country</label>
          <div className="max-w-sm">
            <Select value={selectedCountry || "__all"} onValueChange={(v) => setSelectedCountry(v === "__all" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="All countries" /></SelectTrigger>
              <SelectContent className="max-h-60">
                <SelectItem value="__all">All countries</SelectItem>
                {countries.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2"><span>{c.flag}</span><span>{c.name}</span></span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading && <p className="text-muted-foreground">Loading...</p>}
        {!isLoading && data && data.length === 0 && (
          <div className="text-center py-16">
            <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-lg font-medium">No job listings yet</p>
            <p className="text-sm text-muted-foreground">Click "Find Worker" to post the first one!</p>
          </div>
        )}

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.map((job: any) => (
            <div key={job.id} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-card">
              {/* Photo */}
              {job.image_url ? (
                <img src={job.image_url} alt={job.title} className="w-full h-48 object-cover" />
              ) : (
                <div className="w-full h-32 bg-muted flex items-center justify-center">
                  <Briefcase className="w-10 h-10 text-muted-foreground/30" />
                </div>
              )}

              <div className="p-4 space-y-2">
                <h2 className="font-semibold text-lg">{job.title}</h2>
                {job.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
                )}
                <p className="font-medium text-primary">Wage: {job.price ?? "—"}</p>
                {job.contact && <p className="text-xs text-muted-foreground">Contact: {job.contact}</p>}

                {/* Edit/Delete for owner */}
                {user && job.user_id === user.id && (
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" variant="outline" className="gap-1" onClick={() => openEdit(job)}>
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1" onClick={() => handleDelete(job.id)}>
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(o) => { if (!o) setEditItem(null); }}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Job Listing</DialogTitle>
            <DialogDescription>Update the details of your job listing</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Business Name</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={4} />
            </div>
            <div>
              <Label>Wage</Label>
              <Input value={editWage} onChange={(e) => setEditWage(e.target.value)} />
            </div>
            <div>
              <Label>Contact</Label>
              <Input value={editContact} onChange={(e) => setEditContact(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditItem(null)} disabled={saving}>Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</> : "Save"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Jobs;
