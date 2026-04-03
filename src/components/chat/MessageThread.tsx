import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface MessageThreadProps {
  conversationId: string;
  currentUserId: string;
  onBack: () => void;
}

export const MessageThread = ({ conversationId, currentUserId, onBack }: MessageThreadProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sellerContact, setSellerContact] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (data) setMessages(data);
    };

    fetchMessages();

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  // Fetch seller contact via secure function
  useEffect(() => {
    const fetchContact = async () => {
      // First get the product_id from the conversation
      const { data: conv } = await supabase
        .from("conversations")
        .select("product_id")
        .eq("id", conversationId)
        .single();

      if (!conv) return;

      const { data } = await supabase.rpc("get_product_contact", {
        p_product_id: conv.product_id,
      });

      if (data) setSellerContact(data);
    };

    fetchContact();
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: currentUserId,
      content: input.trim(),
    });

    if (!error) {
      setInput("");
      await supabase
        .from("conversations")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", conversationId);
    }
    setSending(false);
  };

  return (
    <>
      <div className="md:hidden border-b border-border/30 p-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
      </div>
      {sellerContact && (
        <div className="mx-4 mt-3 px-4 py-2.5 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-foreground/80">Kontakti i shitësit: <strong className="text-foreground">{sellerContact}</strong></span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] px-4 py-2.5 rounded-2xl text-sm",
                  isMe
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-secondary-foreground rounded-bl-md"
                )}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p className={cn("text-[10px] mt-1 opacity-60", isMe ? "text-right" : "text-left")}>
                  {format(new Date(msg.created_at), "HH:mm")}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="border-t border-border/30 p-3 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-xl bg-secondary/50 border-0"
        />
        <Button type="submit" size="icon" disabled={!input.trim() || sending} className="rounded-xl bg-gradient-primary shadow-button">
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </>
  );
};
