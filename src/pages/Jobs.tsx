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
      <div className="fixed inset-0 mesh-gradient opacity-80 pointer-events-none" />
      <div className="fixed top-1/4 left-1/3 w-[600px] h-[600px] bg-primary/12 rounded-full blur-[150px] pointer-events-none animate-float-slow" />

      {/* Header */}
      <header className="sticky top-0 z-50 liquid-glass">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-2xl btn-ghost-premium hover:scale-105 transition-all duration-300">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-button">
              <Briefcase className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">Jobs — Workers Needed</h1>
              <p className="text-sm text-muted-foreground">{data?.length ?? 0} listings</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-8 section-aura">
        <div className="mb-8 animate-fade-in">
          <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Filter by country</label>
          <div className="max-w-sm">
            <Select value={selectedCountry || "__all"} onValueChange={(v) => setSelectedCountry(v === "__all" ? "" : v)}>
              <SelectTrigger className="h-12 rounded-2xl border-border/50 bg-secondary/30 backdrop-blur-sm"><SelectValue placeholder="All countries" /></SelectTrigger>
              <SelectContent className="max-h-60 rounded-2xl liquid-glass">
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

        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {!isLoading && data && data.length === 0 && (
          <div className="liquid-glass rounded-[2rem] text-center py-20 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
              <Briefcase className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-lg font-display font-bold">No job listings yet</p>
            <p className="text-sm text-muted-foreground mt-1">Click "Find Worker" to post the first one!</p>
          </div>
        )}

        {/* Job Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {data?.map((job: any) => (
            <div key={job.id} className="liquid-glass card-glow rounded-[2rem] overflow-hidden group">
              {/* Photo */}
              {job.image_url ? (
                <div className="relative overflow-hidden">
                  <img src={job.image_url} alt={job.title} className="w-full h-48 object-cover transition-transform duration-700 ease-premium group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
              ) : (
                <div className="w-full h-32 bg-secondary/30 flex items-center justify-center">
                  <Briefcase className="w-10 h-10 text-muted-foreground/20" />
                </div>
              )}

              <div className="p-5 space-y-3">
                <h2 className="font-display font-bold text-lg">{job.title}</h2>
                {job.description && (
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{job.description}</p>
                )}
                <p className="font-semibold text-primary">Wage: {job.price ?? "—"}</p>
                {job.contact && <p className="text-xs text-muted-foreground">Contact: {job.contact}</p>}

                {/* Edit/Delete for owner */}
                {user && job.user_id === user.id && (
                  <div className="flex gap-2 pt-3 border-t border-border/30">
                    <Button size="sm" variant="outline" className="gap-1.5 rounded-xl" onClick={() => openEdit(job)}>
                      <Pencil className="w-3.5 h-3.5" /> Edit
                    </Button>
                    <Button size="sm" variant="destructive" className="gap-1.5 rounded-xl" onClick={() => handleDelete(job.id)}>
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={!!editItem} onOpenChange={(o) => { if (!o) setEditItem(null); }}>
        <DialogContent className="max-w-md rounded-[2rem] liquid-glass border-border/15">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Edit Job Listing</DialogTitle>
            <DialogDescription>Update the details of your job listing</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider">Business Name</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="mt-2 h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider">Description</Label>
              <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={4} className="mt-2 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider">Wage</Label>
              <Input value={editWage} onChange={(e) => setEditWage(e.target.value)} className="mt-2 h-11 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-semibold uppercase tracking-wider">Contact</Label>
              <Input value={editContact} onChange={(e) => setEditContact(e.target.value)} className="mt-2 h-11 rounded-xl" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setEditItem(null)} disabled={saving} className="rounded-xl btn-secondary-premium">Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={saving} className="rounded-xl btn-premium">
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
