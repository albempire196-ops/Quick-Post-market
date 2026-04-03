import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, MessageCircle, X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NewChatSearchProps {
  currentUserId: string;
  onConversationCreated: (conversationId: string) => void;
}

export const NewChatSearch = ({ currentUserId, onConversationCreated }: NewChatSearchProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (value: string) => {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    setSearching(true);
    const { data } = await supabase
      .from("products")
      .select("id, title, price, image_url, user_id, category")
      .ilike("title", `%${value.trim()}%`)
      .limit(10);

    if (data) setResults(data);
    setSearching(false);
  };

  const handleSelect = async (product: any) => {
    if (product.user_id === currentUserId) return;
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("product_id", product.id)
      .eq("buyer_id", currentUserId)
      .maybeSingle();

    if (existing) {
      onConversationCreated(existing.id);
      setOpen(false);
      setQuery("");
      setResults([]);
      return;
    }

    const { data: created, error } = await supabase
      .from("conversations")
      .insert({
        product_id: product.id,
        buyer_id: currentUserId,
        seller_id: product.user_id,
      })
      .select("id")
      .single();

    if (!error && created) {
      onConversationCreated(created.id);
      setOpen(false);
      setQuery("");
      setResults([]);
    }
  };

  if (!open) {
    return (
      <div className="p-3 border-b border-border/30">
        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          className="w-full gap-2 rounded-xl border-dashed"
        >
          <Search className="w-4 h-4" />
          Search product or seller
        </Button>
      </div>
    );
  }

  return (
    <div className="border-b border-border/30">
      <div className="p-3 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search product..."
            className="pl-9 rounded-xl bg-secondary/50 border-0"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { setOpen(false); setQuery(""); setResults([]); }}
          className="rounded-xl"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {results.length > 0 && (
        <div className="max-h-64 overflow-y-auto">
          {results.map((product) => (
            <button
              key={product.id}
              onClick={() => handleSelect(product)}
              className="w-full flex items-center gap-3 p-3 px-4 text-left hover:bg-secondary/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
                {product.image_url ? (
                  <img src={product.image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="text-xs">{product.title.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{product.title}</p>
                <p className="text-xs text-muted-foreground">{product.price} · {product.category}</p>
              </div>
              <MessageCircle className="w-4 h-4 text-primary flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {query.length >= 2 && results.length === 0 && !searching && (
        <div className="p-4 text-center text-sm text-muted-foreground">
          No products found
        </div>
      )}
    </div>
  );
};
