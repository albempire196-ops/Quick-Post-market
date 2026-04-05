import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";

const Workers = () => {
  const navigate = useNavigate();
  const { data, error, isLoading } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const { data: products, error: queryError } = await supabase
        .from("products_public")
        .select("id, title, description, price, created_at")
        .in("category", ["workers", "jobs", "services"])
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;

      return (products || []).map((p: any) => ({
        id: p.id,
        business_name: p.title,
        description: p.description,
        wage: p.price,
        contact: null,
        created_at: p.created_at,
      }));
    },
  });

  useEffect(() => {
    if (error) console.error("Workers query error:", error);
  }, [error]);

  const [selected, setSelected] = useState<any | null>(null);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 mesh-gradient opacity-80 pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/3 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[130px] pointer-events-none animate-float" />

      <header className="sticky top-0 z-50 liquid-glass">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-2xl btn-ghost-premium hover:scale-105 transition-all duration-300">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-button">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-xl">Find Worker</h1>
              <p className="text-sm text-muted-foreground">Businesses & listings</p>
            </div>
          </div>
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-8 section-aura">
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {!isLoading && data && data.length === 0 && (
          <div className="liquid-glass rounded-[2rem] text-center py-20 animate-fade-in">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-secondary/50 flex items-center justify-center">
              <Users className="w-8 h-8 text-muted-foreground/40" />
            </div>
            <p className="text-lg font-display font-bold">No worker listings found</p>
            <p className="text-sm text-muted-foreground mt-1">Check back later for new listings.</p>
          </div>
        )}

        <div className="space-y-4 stagger-children">
          {data?.map((item: any) => (
            <button
              key={item.id}
              onClick={() => setSelected(item)}
              className="w-full text-left liquid-glass card-glow rounded-[2rem] p-5 group transition-all duration-300 hover:-translate-y-0.5"
            >
              <h2 className="font-display font-bold text-lg group-hover:text-primary transition-colors duration-300">{item.business_name}</h2>
              <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
              <div className="mt-3 flex items-center gap-4">
                <span className="font-semibold text-primary">Wage: {item.wage ?? "—"}</span>
                {item.contact && <span className="text-sm text-muted-foreground">Contact: {item.contact}</span>}
              </div>
            </button>
          ))}
        </div>
      </main>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-lg rounded-[2rem] liquid-glass border-border/15">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">{selected?.business_name}</DialogTitle>
            <DialogDescription className="leading-relaxed">
              {selected?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-3">
            <p className="font-semibold text-primary">Wage: {selected?.wage ?? "—"}</p>
            {selected?.contact && <p className="text-sm text-muted-foreground">Contact: {selected.contact}</p>}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => setSelected(null)} className="rounded-xl">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workers;
