import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const Workers = () => {
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
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Find Worker — Businesses & listings</h1>

      {isLoading && <p>Loading...</p>}
      {!isLoading && data && data.length === 0 && <p>No worker listings found.</p>}

      <div className="space-y-3">
        {data?.map((item: any) => (
          <button
            key={item.id}
            onClick={() => setSelected(item)}
            className="w-full text-left border p-4 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <h2 className="font-semibold text-lg">{item.business_name}</h2>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{item.description}</p>
            <div className="mt-2 flex items-center gap-4">
              <span className="font-medium">Wage: {item.wage ?? "—"}</span>
              {item.contact && <span className="text-sm text-muted-foreground">Contact: {item.contact}</span>}
            </div>
          </button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) setSelected(null); }}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>{selected?.business_name}</DialogTitle>
            <DialogDescription>
              {selected?.description}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <p className="font-medium">Wage: {selected?.wage ?? "—"}</p>
            {selected?.contact && <p className="text-sm text-muted-foreground mt-2">Contact: {selected.contact}</p>}
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={() => setSelected(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Workers;
