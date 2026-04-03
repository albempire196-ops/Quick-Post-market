import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { SUBSCRIPTION_PLANS } from "@/config/subscriptions";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Sparkles, Check, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";

const Pricing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { subscribed, productId, isTrialing, subscriptionEnd, checkSubscription } = useSubscription();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string, planKey: string) => {
    if (!user) {
      toast.error("You must sign in to subscribe");
      return;
    }

    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      toast.error("Something went wrong with the payment");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManage = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Portal error:", err);
      toast.error("Something went wrong");
    }
  };

  const plans = Object.entries(SUBSCRIPTION_PLANS);

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 mesh-gradient opacity-60 pointer-events-none" />

      <header className="sticky top-0 z-50 glass-strong">
        <div className="container mx-auto px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-xl">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-button">
              <Crown className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="font-display font-bold text-xl">Pricing</h1>
          </div>
          {subscribed && (
            <Button variant="outline" size="sm" onClick={handleManage} className="ml-auto rounded-xl">
              Manage Subscription
            </Button>
          )}
        </div>
      </header>

      <main className="relative container mx-auto px-6 py-16 max-w-5xl">
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 glass px-5 py-2.5 rounded-full">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Choose your plan</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold">
            Start Selling <span className="text-gradient">Today</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the plan that fits you to post unlimited products
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map(([key, plan]) => {
            const isActive = subscribed && productId === plan.product_id;
            const isLoading = loadingPlan === key;

            return (
              <div
                key={key}
                className={`relative glass rounded-3xl p-8 space-y-6 transition-all hover:scale-[1.02] ${
                  isActive ? "ring-2 ring-primary shadow-xl" : ""
                } ${plan.badge === "Most Popular" ? "md:-mt-4 md:mb-4" : ""}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold shadow-button">
                    {plan.badge}
                  </div>
                )}

                {isActive && (
                  <div className="absolute -top-3 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold">
                    {isTrialing ? "Free Trial" : "Active"}
                  </div>
                )}

                <div>
                  <h3 className="font-display font-bold text-2xl">{plan.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">{plan.description}</p>
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-display font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>

                <ul className="space-y-3">
                  {["Unlimited product listings", "Chat with buyers", "Priority support", "No ads"].map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                  {plan.trial && (
                    <li className="flex items-center gap-3 text-sm font-semibold text-primary">
                      <Check className="w-4 h-4 flex-shrink-0" />
                      2 weeks free trial
                    </li>
                  )}
                </ul>

                {isActive ? (
                  <Button variant="outline" className="w-full h-12 rounded-2xl" onClick={handleManage}>
                    Manage Plan
                  </Button>
                ) : (
                  <Button
                    className="w-full h-12 rounded-2xl bg-gradient-primary hover:opacity-90 shadow-button font-semibold"
                    onClick={() => handleSubscribe(plan.price_id, key)}
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Subscribe Now"}
                  </Button>
                )}

                {isActive && subscriptionEnd && (
                  <p className="text-xs text-muted-foreground text-center">
                    {isTrialing ? "Trial ends on " : "Renews on "}
                    {new Date(subscriptionEnd).toLocaleDateString("en-US")}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Button variant="ghost" size="sm" onClick={checkSubscription} className="text-muted-foreground">
            Refresh subscription status
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Pricing;
