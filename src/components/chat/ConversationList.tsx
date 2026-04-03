import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ConversationListProps {
  conversations: any[];
  activeId: string | null;
  currentUserId: string;
  onSelect: (id: string) => void;
}

export const ConversationList = ({ conversations, activeId, currentUserId, onSelect }: ConversationListProps) => {
  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 text-center text-muted-foreground">
        <p>No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv) => {
        const isBuyer = currentUserId === conv.buyer_id;
        const otherUser = isBuyer ? conv.seller : conv.buyer;
        const otherName = otherUser?.full_name || "User";
        const initials = otherName.substring(0, 2).toUpperCase();
        const productTitle = conv.products?.title || "Product";

        return (
          <button
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            className={cn(
              "w-full flex items-center gap-3 p-4 text-left hover:bg-secondary/50 transition-colors border-b border-border/20",
              activeId === conv.id && "bg-primary/5 border-l-2 border-l-primary"
            )}
          >
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarFallback className="bg-secondary text-xs font-semibold">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{otherName}</p>
              <p className="text-xs text-muted-foreground truncate">{productTitle}</p>
            </div>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatDistanceToNow(new Date(conv.updated_at), { addSuffix: false })}
            </span>
          </button>
        );
      })}
    </div>
  );
};
