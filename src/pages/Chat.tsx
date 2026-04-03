import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ConversationList } from "@/components/chat/ConversationList";
import { MessageThread } from "@/components/chat/MessageThread";
import { NewChatSearch } from "@/components/chat/NewChatSearch";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Chat = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<any[]>([]);

  const productId = searchParams.get("productId");
  const sellerId = searchParams.get("sellerId");

  useEffect(() => {
    if (!user || !productId || !sellerId) return;
    if (user.id === sellerId) return;

    const findOrCreate = async () => {
      const { data: existing } = await supabase
        .from("conversations")
        .select("id")
        .eq("product_id", productId)
        .eq("buyer_id", user.id)
        .maybeSingle();

      if (existing) {
        setActiveConversationId(existing.id);
        return;
      }

      const { data: created, error } = await supabase
        .from("conversations")
        .insert({ product_id: productId, buyer_id: user.id, seller_id: sellerId })
        .select("id")
        .single();

      if (!error && created) {
        setActiveConversationId(created.id);
      }
    };

    findOrCreate();
  }, [user, productId, sellerId]);

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      const { data } = await supabase
        .from("conversations")
        .select(`
          id,
          product_id,
          buyer_id,
          seller_id,
          updated_at,
          products ( title, image_url ),
          buyer:profiles_public!conversations_buyer_id_fkey ( full_name, avatar_url ),
          seller:profiles_public!conversations_seller_id_fkey ( full_name, avatar_url )
        `)
        .order("updated_at", { ascending: false });

      if (data) setConversations(data);
    };

    fetchConversations();

    const channel = supabase
      .channel("conversations-updates")
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => fetchConversations())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => fetchConversations())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto" />
          <h2 className="text-2xl font-display font-bold">Sign in to use chat</h2>
          <Button onClick={() => navigate("/")} variant="outline">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="glass-strong border-b border-border/30 px-4 py-3 flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <MessageCircle className="w-5 h-5 text-primary" />
        <h1 className="font-display font-bold text-lg">Messages</h1>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className={`w-full md:w-80 border-r border-border/30 flex-shrink-0 ${activeConversationId ? "hidden md:flex" : "flex"} flex-col`}>
          <NewChatSearch
            currentUserId={user.id}
            onConversationCreated={(id) => setActiveConversationId(id)}
          />
          <ConversationList
            conversations={conversations}
            activeId={activeConversationId}
            currentUserId={user.id}
            onSelect={setActiveConversationId}
          />
        </div>

        <div className={`flex-1 ${!activeConversationId ? "hidden md:flex" : "flex"} flex-col`}>
          {activeConversationId ? (
            <MessageThread
              conversationId={activeConversationId}
              currentUserId={user.id}
              onBack={() => setActiveConversationId(null)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center space-y-3">
                <MessageCircle className="w-16 h-16 mx-auto opacity-30" />
                <p className="font-medium">Select a conversation</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
