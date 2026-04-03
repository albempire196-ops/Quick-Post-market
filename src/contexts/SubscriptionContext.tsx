import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SubscriptionState {
  subscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  isTrialing: boolean;
  loading: boolean;
  checkSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionState | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { user, session } = useAuth();
  const [subscribed, setSubscribed] = useState(false);
  const [productId, setProductId] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [isTrialing, setIsTrialing] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkSubscription = useCallback(async () => {
    if (!session) {
      setSubscribed(false);
      setProductId(null);
      setSubscriptionEnd(null);
      setIsTrialing(false);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("check-subscription");
      if (error) throw error;

      setSubscribed(data.subscribed ?? false);
      setProductId(data.product_id ?? null);
      setSubscriptionEnd(data.subscription_end ?? null);
      setIsTrialing(data.is_trialing ?? false);
    } catch (err) {
      console.error("Subscription check failed:", err);
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    checkSubscription();
  }, [checkSubscription]);

  // Auto-refresh every 60s
  useEffect(() => {
    if (!session) return;
    const interval = setInterval(checkSubscription, 60000);
    return () => clearInterval(interval);
  }, [session, checkSubscription]);

  return (
    <SubscriptionContext.Provider value={{ subscribed, productId, subscriptionEnd, isTrialing, loading, checkSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error("useSubscription must be used within SubscriptionProvider");
  return context;
};
